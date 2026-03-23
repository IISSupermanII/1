require('dotenv').config({ path: 'config/.env' });
const ccxt = require('ccxt');
const { checkMarketRegime } = require('./src/market_regime');

const exchange = require('./src/exchange');

const MARKET_ADX_MIN = Number(process.env.PAPER_MARKET_ADX_MIN || 20);
const MARKET_EMA_ATR = Number(process.env.PAPER_MARKET_EMA_ATR || 0.5);

function timeframeToMinutes(tf) {
    const map = { '1m':1, '5m':5, '15m':15, '30m':30, '1h':60, '4h':240, '1d':1440 };
    return map[tf] || 15;
}

async function monitorTrend(tf = '1h', symbols = ['BTC/USDT', 'LTC/USDT', 'ETH/USDT', 'ADA/USDT']) {
    const htfMap = { '1m': '15m', '5m': '15m', '15m': '1h', '30m': '4h', '1h': '4h', '4h': '1d' };
    const htf = htfMap[tf] || '1h';

    console.log('\n╔════════════════════════════════════════════════════════════════════╗');
    console.log(`║  МОНИТОРИНГ ТРЕНДА (${new Date().toLocaleTimeString('ru-RU')})              ║`);
    console.log(`║  TF: ${tf.padEnd(2).toUpperCase()} → HTF: ${htf}     Market Regime: ADX>${MARKET_ADX_MIN} | EMA_ATR>${MARKET_EMA_ATR}  ║`);
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');

    const results = [];

    for (const symbol of symbols) {
        try {
            const [candles, htfCandles] = await Promise.all([
                exchange.fetchOHLCV(symbol, tf, undefined, 100),
                exchange.fetchOHLCV(symbol, htf, undefined, 200), // Ensure we have enough data for EMA200
            ]);

            const ticker = await exchange.fetchTicker(symbol);
            const htfCloses = htfCandles.map(c => c[4]);
            const htfHighs = htfCandles.map(c => c[2]);
            const htfLows = htfCandles.map(c => c[3]);

            const regimeObj = checkMarketRegime(htfHighs, htfLows, htfCloses, MARKET_ADX_MIN, MARKET_EMA_ATR);
            
            let status = '⚠️';
            if (regimeObj.isShortOk) status = '🟢';
            else if (regimeObj.isLongOk) status = '🟡';

            const bufferStatus = regimeObj.metrics.distance > regimeObj.metrics.requiredDistance ? '✅' : '❌';

            results.push({
                symbol,
                status,
                trend: regimeObj.trend,
                regime: regimeObj.regime,
                htfAdx: (regimeObj.metrics.adx || 0).toFixed(1),
                distance: regimeObj.metrics.distance.toFixed(4),
                required: regimeObj.metrics.requiredDistance.toFixed(4),
                bufferStatus,
                price: ticker.last.toFixed(4),
            });

        } catch (e) {
            console.log(`⚠️  ${symbol}: Ошибка - ${e.message}`);
        }

        await new Promise(r => setTimeout(r, 500));
    }

    console.log('ПАРА        | Статус | HTF Тренд    | HTF ADX | Буфер  | Режим');
    console.log('────────────┼────────┼─────────────┼─────────┼────────┼──────────────────');
    
    results.forEach(r => {
        const distStatus = `${r.distance}/${r.required} ${r.bufferStatus}`;
        console.log(
            `${r.symbol.padEnd(11)} | ${r.status} | ${r.trend.padEnd(11)} | ${r.htfAdx.padEnd(7)} | ${distStatus.padEnd(6)} | ${r.regime}`
        );
    });

    console.log('\n\n═══════════════════════════════════════════════════════════════════\n');
    
    const shortReady = results.filter(r => r.regime === 'SHORT OK');
    const longReady = results.filter(r => r.regime === 'LONG OK');
    const flatMarket = results.filter(r => r.regime === 'WEAK TREND' || r.regime === 'BUFFER TOO SMALL');
    
    console.log(`✅ ГОТОВЫ ДЛЯ SHORT: ${shortReady.map(r => r.symbol).join(', ') || 'Нет'}`);
    console.log(`🟡 ГОТОВЫ ДЛЯ LONG:  ${longReady.map(r => r.symbol).join(', ') || 'Нет'}`);
    console.log(`⚠️  ВО ФЛЕТЕ:         ${flatMarket.map(r => r.symbol).join(', ') || 'Нет'}`);

    console.log('\n💡 Конфигурация:');
    console.log(`   PAPER_MARKET_ADX_MIN=${MARKET_ADX_MIN}`);
    console.log(`   PAPER_MARKET_EMA_ATR=${MARKET_EMA_ATR}`);
    console.log(`   (Измените в config/.env и перезапустите)\n`);

    return results;
}

async function main() {
    const args = process.argv.slice(2);
    let tf = '1h';
    let symbols = ['BTC/USDT', 'LTC/USDT', 'ETH/USDT', 'ADA/USDT', 'SOL/USDT'];
    let interval = null;

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--tf') tf = args[i + 1];
        if (args[i] === '--symbols') symbols = args[i + 1].split(',');
        if (args[i] === '--interval') interval = parseInt(args[i + 1]);
        if (args[i] === '--continuous') interval = 5;
        if (args[i] === '--help') {
            console.log(`
Мониторинг тренда - проверяет Market Regime Filter для всех пар

Использование:
  node monitor_trend.js [options]

Опции:
  --tf TIMEFRAME          Таймфрейм (по умолчанию: 1h)
  --symbols SYM1,SYM2     Пары для мониторинга (запятая-разделенные)
  --interval MIN          Интервал обновления в минутах
  --continuous            Непрерывный мониторинг (каждые 5 минут)
  --help                  Этот текст
`);
            process.exit();
        }
    }

    if (interval) {
        console.log(`\n⏰ Непрерывный мониторинг каждые ${interval} минут`);
        await monitorTrend(tf, symbols);
        setInterval(async () => {
            console.clear();
            await monitorTrend(tf, symbols);
        }, interval * 60 * 1000);
    } else {
        await monitorTrend(tf, symbols);
    }
}

main().catch(e => {
    console.error('❌ Ошибка:', e.message);
    process.exit(1);
});