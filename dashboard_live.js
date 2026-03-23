#!/usr/bin/env node

require('dotenv').config({ path: '../config/.env' });
const ccxt = require('ccxt');
const { ADX, EMA, ATR } = require('technicalindicators');

const exchange = require('./src/exchange');

const MARKET_ADX_MIN = Number(process.env.PAPER_MARKET_ADX_MIN || 20);
const MARKET_EMA_ATR = Number(process.env.PAPER_MARKET_EMA_ATR || 0.5);

function timeframeToMinutes(tf) {
    const map = { '1m':1, '5m':5, '15m':15, '30m':30, '1h':60, '4h':240, '1d':1440 };
    return map[tf] || 15;
}

async function checkTrendStatus(symbol, tf = '1h') {
    const htfMap = { '1m': '15m', '5m': '15m', '15m': '1h', '30m': '4h', '1h': '4h', '4h': '1d' };
    const htf = htfMap[tf] || '1h';

    try {
        const [candles, htfCandles] = await Promise.all([
            exchange.fetchOHLCV(symbol, tf, undefined, 100),
            exchange.fetchOHLCV(symbol, htf, undefined, 100),
        ]);

        const htfCloses = htfCandles.map(c => c[4]);
        const htfHighs = htfCandles.map(c => c[2]);
        const htfLows = htfCandles.map(c => c[3]);

        const htfAdxResult = ADX.calculate({ high: htfHighs, low: htfLows, close: htfCloses, period: 14 }).pop() || {};
        const htfEma200 = EMA.calculate({ values: htfCloses, period: 200 }).pop() || 0;
        const htfAtr = ATR.calculate({ high: htfHighs, low: htfLows, close: htfCloses, period: 14 }).pop() || 0;
        const htfPrice = htfCloses[htfCloses.length - 1];

        const htfAdxStrong = (htfAdxResult.adx || 0) >= MARKET_ADX_MIN;
        const shortRegimeOk = htfAdxStrong && (htfEma200 - htfPrice) > MARKET_EMA_ATR * htfAtr;
        const longRegimeOk = htfAdxStrong && (htfPrice - htfEma200) > MARKET_EMA_ATR * htfAtr;

        return {
            symbol,
            htfAdx: (htfAdxResult.adx || 0),
            htfPrice,
            htfEma200,
            shortOk: shortRegimeOk,
            longOk: longRegimeOk,
            flat: !shortRegimeOk && !longRegimeOk && htfAdxStrong,
        };
    } catch (e) {
        return { symbol, error: e.message };
    }
}

async function dashboardLoop(symbols = ['BTC/USDT', 'LTC/USDT', 'ETH/USDT', 'ADA/USDT', 'SOL/USDT'], tf = '1h', updateInterval = 5) {
    console.clear();
    console.log('\n╔════════════════════════════════════════════════════════════════════╗');
    console.log('║            DASHBOARD МОНИТОРИНГА ТРЕНДА (LIVE)                     ║');
    console.log('║   Для автоматической ротации пар в live боте                      ║');
    console.log('╚════════════════════════════════════════════════════════════════════╝\n');

    let lastUpdate = new Date();
    
    const update = async () => {
        const now = new Date();
        lastUpdate = now;

        const statuses = [];
        for (const symbol of symbols) {
            const status = await checkTrendStatus(symbol, tf);
            statuses.push(status);
            await new Promise(r => setTimeout(r, 300));
        }

        console.clear();
        console.log(`\n📊 ПОСЛЕДНЕЕ ОБНОВЛЕНИЕ: ${lastUpdate.toLocaleTimeString('ru-RU')}`);
        console.log(`   Таймфрейм: ${tf} | Интервал: ${updateInterval} минут | Режим: Continuous\n`);

        console.log('┌─────────────┬──────────┬────────────┬──────────┬───────────┐');
        console.log('│ Пара        │ HTF ADX  │ Регим      │ SHORT    │ LONG      │');
        console.log('├─────────────┼──────────┼────────────┼──────────┼───────────┤');

        const shortReady = [];
        const longReady = [];
        let shortCount = 0, longCount = 0;

        statuses.forEach(s => {
            if (s.error) {
                console.log(`│ ${s.symbol.padEnd(11)} │ ERROR    │            │          │           │`);
            } else {
                const adx = s.htfAdx.toFixed(1);
                let regime = s.flat ? '⚠️  FLAT' : '?';
                let shortStatus = s.shortOk ? '✅' : '  ';
                let longStatus = s.longOk ? '✅' : '  ';

                if (s.shortOk) {
                    regime = '💩 SHORT';
                    shortReady.push(s.symbol);
                    shortCount++;
                } else if (s.longOk) {
                    regime = '📈 LONG';
                    longReady.push(s.symbol);
                    longCount++;
                } else if (s.htfAdx < MARKET_ADX_MIN) {
                    regime = '😴 WEAK';
                }

                console.log(`│ ${s.symbol.padEnd(11)} │ ${adx.padEnd(8)} │ ${regime.padEnd(10)} │ ${shortStatus.padEnd(8)} │ ${longStatus.padEnd(9)} │`);
            }
        });

        console.log('└─────────────┴──────────┴────────────┴──────────┴───────────┘\n');

        // Рекомендации
        console.log('💡 РЕКОМЕНДАЦИИ:\n');
        if (shortReady.length > 0) {
            console.log(`   🟢 SHORT-only режим:  ${shortReady.map(s => `[${s}]`).join(' ')}`);
            console.log(`      └─ ${shortReady.length} пара(ы) в режиме\n`);
        } else {
            console.log(`   ⚠️  SHORT режим недоступен (рынок в растущем тренде)\n`);
        }

        if (longReady.length > 0) {
            console.log(`   🟡 LONG режим доступен: ${longReady.map(s => `[${s}]`).join(' ')}`);
            console.log(`      └─ ${longReady.length} пара(ы) - НО ВЫ ТОРГУЕТЕ SHORT!\n`);
        }

        // Советы
        console.log('📋 ДЕЙСТВИЯ:\n');
        if (shortReady.length === 0 && shortCount + longCount > 0) {
            console.log(`   1️⃣  Рынок в даунтренде с корпп (alt-season)`);
            console.log(`   2️⃣  SHORT сейчас убыточна - переходить на HOLD до смены тренда`);
            console.log(`   3️⃣  Следующий SHORT сигнал ожидается, когда цена упадет\n`);
        } else if (shortReady.length > 0) {
            console.log(`   ✅ SHORT режим активен! Торгуйте ${shortReady.join(', ')}`);
            console.log(`   📊 Ожидание +1.5-2.5% за 15 дней\n`);
        }

        console.log(`⏰ Следующее обновление через ${updateInterval} мин...`);
        console.log(`🔄 Нажмите Ctrl+C для выхода\n`);
    };

    // Первое обновление
    await update();

    // Циклическое обновление
    setInterval(async () => {
        await update();
    }, updateInterval * 60 * 1000);
}

// === ЗАПУСК ===

const args = process.argv.slice(2);
let tf = '1h';
let symbols = ['BTC/USDT', 'LTC/USDT', 'ETH/USDT', 'ADA/USDT', 'SOL/USDT'];
let interval = 5;
let singleRun = false;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--tf') tf = args[i + 1];
    if (args[i] === '--symbols') symbols = args[i + 1].split(',');
    if (args[i] === '--interval') interval = parseInt(args[i + 1]);
    if (args[i] === '--once') singleRun = true;
    if (args[i] === '--help') {
        console.log(`
Dashboard мониторинга тренда - live наблюдение за Market Regime

Использование:
  node dashboard_live.js [options]

Опции:
  --tf TIMEFRAME          Таймфрейм (1h)
  --symbols SYM1,SYM2     Пары (BTC/USDT,LTC/USDT,...)
  --interval MIN          Интервал обновления (5 минут)
  --once                  Один run без loop

Примеры:
  node dashboard_live.js                    # Default 5 min loop
  node dashboard_live.js --interval 1       # Update every 1 min
  node dashboard_live.js --once             # Single check only
  node dashboard_live.js --symbols BTC/USDT,ETH/USDT
        `);
        process.exit();
    }
}

if (singleRun) {
    dashboardLoop(symbols, tf, 0).catch(console.error);
} else {
    dashboardLoop(symbols, tf, interval).catch(console.error);
}
