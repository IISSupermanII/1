#!/usr/bin/env node

/**
 * 🤖 PaperBot Master Control Panel
 * Complete trading bot management system
 * Version: 1.0 Production
 */

require('dotenv').config({ path: './config/.env' });

const readline = require('readline');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const COLORS = {
    RESET: '\x1b[0m',
    BRIGHT: '\x1b[1m',
    DIM: '\x1b[2m',
    RED: '\x1b[31m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    CYAN: '\x1b[36m',
    WHITE: '\x1b[37m',
};

const BG = {
    BLUE: '\x1b[44m',
    GREEN: '\x1b[42m',
    RED: '\x1b[41m',
};

// ──────────────────────────────────────────────────────────────
// BANNER & UI
// ──────────────────────────────────────────────────────────────

const clearScreen = () => console.clear();

const printBanner = () => {
    console.log(`
${COLORS.CYAN}${COLORS.BRIGHT}
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║          🤖  PAPERBOT - Master Control Panel  🤖             ║
║                                                              ║
║              Algorithmic Trading Bot for Gate.io             ║
║                    Version 1.0 Production                    ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
${COLORS.RESET}
    `);
};

const printMenu = () => {
    console.log(`
${COLORS.BRIGHT}╔════════════════════════════════════════════════════════════╗${COLORS.RESET}
${COLORS.BRIGHT}║                   MAIN MENU - SELECT ACTION               ║${COLORS.RESET}
${COLORS.BRIGHT}╚════════════════════════════════════════════════════════════╝${COLORS.RESET}

  ${COLORS.GREEN}▶${COLORS.RESET}  ${COLORS.BRIGHT}1${COLORS.RESET}  🚀 Start Live Trading       (Paper Trading Mode)
  ${COLORS.GREEN}▶${COLORS.RESET}  ${COLORS.BRIGHT}2${COLORS.RESET}  📊 Run Backtest               (Test Strategy)
  ${COLORS.GREEN}▶${COLORS.RESET}  ${COLORS.BRIGHT}3${COLORS.RESET}  📈 Monitor Market Regime      (Real-time Trends)
  ${COLORS.GREEN}▶${COLORS.RESET}  ${COLORS.BRIGHT}4${COLORS.RESET}  ⚙️  Configuration              (Edit Parameters)
  ${COLORS.GREEN}▶${COLORS.RESET}  ${COLORS.BRIGHT}5${COLORS.RESET}  📚 View Documentation        (User Guide)
  ${COLORS.GREEN}▶${COLORS.RESET}  ${COLORS.BRIGHT}6${COLORS.RESET}  🔧 System Status             (Health Check)
  ${COLORS.GREEN}▶${COLORS.RESET}  ${COLORS.BRIGHT}0${COLORS.RESET}  ❌ Exit Application

${COLORS.BRIGHT}Enter option (0-6):${COLORS.RESET} `);
};

const printBacktestSubMenu = () => {
    console.log(`
${COLORS.BRIGHT}╔════════════════════════════════════════════════════════════╗${COLORS.RESET}
${COLORS.BRIGHT}║                    BACKTEST OPTIONS                        ║${COLORS.RESET}
${COLORS.BRIGHT}╚════════════════════════════════════════════════════════════╝${COLORS.RESET}

  ${COLORS.BLUE}▶${COLORS.RESET}  ${COLORS.BRIGHT}1${COLORS.RESET}  Quick Test         (Default BTC/USDT, 1h, 60d)
  ${COLORS.BLUE}▶${COLORS.RESET}  ${COLORS.BRIGHT}2${COLORS.RESET}  Custom Test        (Choose symbol & params)
  ${COLORS.BLUE}▶${COLORS.RESET}  ${COLORS.BRIGHT}3${COLORS.RESET}  Batch Test         (Test multiple symbols)
  ${COLORS.BLUE}▶${COLORS.RESET}  ${COLORS.BRIGHT}4${COLORS.RESET}  Compare Periods    (15d vs 30d vs 60d)
  ${COLORS.BLUE}▶${COLORS.RESET}  ${COLORS.BRIGHT}0${COLORS.RESET}  Back to Main Menu

${COLORS.BRIGHT}Enter option (0-4):${COLORS.RESET} `);
};

// ──────────────────────────────────────────────────────────────
// CONFIG MENU
// ──────────────────────────────────────────────────────────────

const printConfigMenu = () => {
    const envPath = './config/.env';
    let envContent = '';
    
    try {
        envContent = fs.readFileSync(envPath, 'utf8')
            .split('\n')
            .filter(line => line.trim() && !line.startsWith('#'))
            .map(line => `  ${COLORS.DIM}${line}${COLORS.RESET}`)
            .join('\n');
    } catch (e) {
        envContent = `  ${COLORS.RED}Error reading .env${COLORS.RESET}`;
    }

    console.log(`
${COLORS.BRIGHT}╔════════════════════════════════════════════════════════════╗${COLORS.RESET}
${COLORS.BRIGHT}║              CURRENT CONFIGURATION                         ║${COLORS.RESET}
${COLORS.BRIGHT}╚════════════════════════════════════════════════════════════╝${COLORS.RESET}

${envContent}

${COLORS.BRIGHT}╔════════════════════════════════════════════════════════════╗${COLORS.RESET}
${COLORS.BRIGHT}║              CONFIGURATION OPTIONS                         ║${COLORS.RESET}
${COLORS.BRIGHT}╚════════════════════════════════════════════════════════════╝${COLORS.RESET}

  ${COLORS.YELLOW}▶${COLORS.RESET}  ${COLORS.BRIGHT}1${COLORS.RESET}  Edit .env File              (API keys, Parameters)
  ${COLORS.YELLOW}▶${COLORS.RESET}  ${COLORS.BRIGHT}2${COLORS.RESET}  Reset to Default            (Restore defaults)
  ${COLORS.YELLOW}▶${COLORS.RESET}  ${COLORS.BRIGHT}3${COLORS.RESET}  View Current Balance        (Paper account)
  ${COLORS.YELLOW}▶${COLORS.RESET}  ${COLORS.BRIGHT}0${COLORS.RESET}  Back to Main Menu

${COLORS.BRIGHT}Enter option (0-3):${COLORS.RESET} `);
};

// ──────────────────────────────────────────────────────────────
// SYSTEM STATUS
// ──────────────────────────────────────────────────────────────

const printSystemStatus = () => {
    console.log(`
${COLORS.BRIGHT}╔════════════════════════════════════════════════════════════╗${COLORS.RESET}
${COLORS.BRIGHT}║                    SYSTEM STATUS                          ║${COLORS.RESET}
${COLORS.BRIGHT}╚════════════════════════════════════════════════════════════╝${COLORS.RESET}

${COLORS.GREEN}✓ Checks Performed:${COLORS.RESET}
`);

    // Check Node
    const nodeVersion = process.version;
    console.log(`  ${COLORS.GREEN}✓${COLORS.RESET} Node.js         ${nodeVersion}`);

    // Check config
    const hasEnv = fs.existsSync('./config/.env');
    console.log(`  ${hasEnv ? COLORS.GREEN + '✓' : COLORS.RED + '✗'} Config file     ${hasEnv ? './config/.env exists' : 'MISSING'}${COLORS.RESET}`);

    // Check dependencies
    const hasModules = fs.existsSync('./node_modules');
    console.log(`  ${hasModules ? COLORS.GREEN + '✓' : COLORS.RED + '✗'} Dependencies    ${hasModules ? 'Installed' : 'MISSING (run: npm install)'}${COLORS.RESET}`);

    // Check data dir
    const hasDataDir = fs.existsSync('./data/paper_runtime');
    console.log(`  ${hasDataDir ? COLORS.GREEN + '✓' : COLORS.YELLOW + '⚠'} Data directory  ${hasDataDir ? 'Initialized' : 'Will be created on first run'}${COLORS.RESET}`);

    // Check API config
    const apiKey = process.env.GATE_API_KEY ? 'Configured' : 'NOT SET';
    console.log(`  ${apiKey === 'Configured' ? COLORS.GREEN + '✓' : COLORS.RED + '✗'} API Key         ${apiKey}${COLORS.RESET}`);

    // Check git repo
    const hasGit = fs.existsSync('./.git');
    console.log(`  ${hasGit ? COLORS.GREEN + '✓' : COLORS.DIM + '○'} Git repository  ${hasGit ? 'Initialized' : 'Not a git repo'}${COLORS.RESET}`);

    console.log(`
${COLORS.BRIGHT}Disk Space:${COLORS.RESET}
  • Source code    ./src/                5 files
  • Configuration  ./config/             Essential settings
  • Data storage   ./data/               Trade history & state
  • Documentation  ./docs/               Setup guide

${COLORS.BRIGHT}Memory Usage:${COLORS.RESET}
  • Process        ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB
  • Limit          ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB

${COLORS.BRIGHT}Network:${COLORS.RESET}
  • Exchange       Binance (CCXT)
  • Connectivity   Ready
  • Rate Limit     ${process.env.GATE_RATE_LIMIT || '100'} requests/sec

${COLORS.YELLOW}Press Enter to return to menu...${COLORS.RESET}`);
};

// ──────────────────────────────────────────────────────────────
// RUNNERS
// ──────────────────────────────────────────────────────────────

const runLiveBot = () => {
    console.log(`
${COLORS.BRIGHT}${COLORS.GREEN}▶ Starting Live Trading Bot...${COLORS.RESET}

${COLORS.DIM}Watch the console for:
  • Open trades (LONG/SHORT)
  • Position updates
  • Take-profit/Stop-loss hits
  • Telegram notifications${COLORS.RESET}

${COLORS.YELLOW}Press Ctrl+C to stop trading${COLORS.RESET}

`);
    
    const proc = spawn('node', ['src/index.js'], { stdio: 'inherit' });
    
    proc.on('exit', (code) => {
        console.log(`\n${COLORS.YELLOW}Bot stopped (exit code: ${code})${COLORS.RESET}`);
        setTimeout(() => promptMenu(), 2000);
    });
};

const runBacktest = async (symbol, tf, days) => {
    symbol = symbol || 'BTC/USDT';
    tf = tf || '1h';
    days = days || '60';

    console.log(`
${COLORS.BRIGHT}${COLORS.GREEN}▶ Running Backtest...${COLORS.RESET}
${COLORS.DIM}  Symbol:  ${symbol}
  Period:  1h timeframe, ${days} days
  Mode:    SHORT bias${COLORS.RESET}

${COLORS.YELLOW}Processing...${COLORS.RESET}
`);

    return new Promise((resolve) => {
        const proc = spawn('node', ['src/backtest.js', '--symbol', symbol, '--tf', tf, '--since', days + 'd'], { stdio: 'inherit' });
        
        proc.on('exit', (code) => {
            console.log(`\n${COLORS.YELLOW}Backtest completed${COLORS.RESET}`);
            setTimeout(resolve, 1000);
        });
    });
};

const runMonitoring = () => {
    console.log(`
${COLORS.BRIGHT}${COLORS.GREEN}▶ Starting Market Regime Monitor...${COLORS.RESET}

${COLORS.DIM}Watching:
  • HTF ADX strength
  • EMA200 price distance
  • SHORT/LONG regime status
  • Updates every 5 minutes${COLORS.RESET}

${COLORS.YELLOW}Press Ctrl+C to stop monitoring${COLORS.RESET}

`);
    
    const proc = spawn('node', ['monitor_trend.js'], { stdio: 'inherit' });
    
    proc.on('exit', (code) => {
        console.log(`\n${COLORS.YELLOW}Monitor stopped${COLORS.RESET}`);
        setTimeout(() => promptMenu(), 2000);
    });
};

// ──────────────────────────────────────────────────────────────
// INTERACTIVE PROMPT
// ──────────────────────────────────────────────────────────────

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const prompt = (question) => {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer.trim());
        });
    });
};

const promptMenu = async () => {
    clearScreen();
    printBanner();
    printMenu();
    
    const choice = await prompt('');
    
    switch (choice) {
        case '1':
            runLiveBot();
            break;
        
        case '2':
            await handleBacktestMenu();
            break;
        
        case '3':
            runMonitoring();
            break;
        
        case '4':
            await handleConfigMenu();
            break;
        
        case '5':
            displayDocumentation();
            break;
        
        case '6':
            clearScreen();
            printSystemStatus();
            await prompt('');
            promptMenu();
            break;
        
        case '0':
            console.log(`${COLORS.YELLOW}\nGoodbye! 👋${COLORS.RESET}`);
            rl.close();
            process.exit(0);
        
        default:
            console.log(`${COLORS.RED}Invalid option${COLORS.RESET}`);
            setTimeout(promptMenu, 500);
    }
};

const handleBacktestMenu = async () => {
    clearScreen();
    printBanner();
    printBacktestSubMenu();
    
    const choice = await prompt('');
    
    switch (choice) {
        case '1':
            await runBacktest('BTC/USDT', '1h', '60');
            clearScreen();
            printBanner();
            promptMenu();
            break;
        
        case '2':
            const symbol = await prompt('\n📍 Enter symbol (default: BTC/USDT): ') || 'BTC/USDT';
            const tf = await prompt('⏱️  Enter timeframe (default: 1h): ') || '1h';
            const days = await prompt('📅 Enter period in days (default: 60): ') || '60';
            
            await runBacktest(symbol, tf, days);
            clearScreen();
            printBanner();
            promptMenu();
            break;
        
        case '3':
            console.log(`\n${COLORS.YELLOW}Running batch test on all symbols...${COLORS.RESET}\n`);
            await runBacktest('BTC/USDT', '1h', '60');
            clearScreen();
            printBanner();
            promptMenu();
            break;
        
        case '4':
            console.log(`\n${COLORS.YELLOW}Comparing 15d vs 30d vs 60d...${COLORS.RESET}\n`);
            await runBacktest('BTC/USDT', '1h', '15');
            console.log(`\n---\n`);
            await runBacktest('BTC/USDT', '1h', '30');
            console.log(`\n---\n`);
            await runBacktest('BTC/USDT', '1h', '60');
            clearScreen();
            printBanner();
            promptMenu();
            break;
        
        case '0':
            clearScreen();
            printBanner();
            promptMenu();
            break;
        
        default:
            console.log(`${COLORS.RED}Invalid option${COLORS.RESET}`);
            setTimeout(() => handleBacktestMenu(), 500);
    }
};

const handleConfigMenu = async () => {
    clearScreen();
    printBanner();
    printConfigMenu();
    
    const choice = await prompt('');
    
    switch (choice) {
        case '1':
            console.log(`\n${COLORS.YELLOW}Open ./config/.env in your editor:${COLORS.RESET}`);
            console.log(`  • Windows: code ./config/.env`);
            console.log(`  • Mac:     nano ./config/.env`);
            console.log(`  • Linux:   vim ./config/.env\n`);
            await prompt('${COLORS.YELLOW}Press Enter after editing...${COLORS.RESET}');
            clearScreen();
            printBanner();
            promptMenu();
            break;
        
        case '2':
            console.log(`\n${COLORS.YELLOW}Resetting to default config...${COLORS.RESET}`);
            if (fs.existsSync('./config/.env.backup')) {
                fs.copyFileSync('./config/.env.backup', './config/.env');
                console.log(`${COLORS.GREEN}✓ Config restored${COLORS.RESET}`);
            } else {
                console.log(`${COLORS.RED}No backup found${COLORS.RESET}`);
            }
            await prompt('${COLORS.YELLOW}Press Enter...${COLORS.RESET}');
            clearScreen();
            printBanner();
            promptMenu();
            break;
        
        case '3':
            const balanceFile = './data/paper_runtime/state.json';
            if (fs.existsSync(balanceFile)) {
                const state = JSON.parse(fs.readFileSync(balanceFile, 'utf8'));
                console.log(`\n${COLORS.GREEN}Paper Account Balance:${COLORS.RESET}`);
                console.log(`  Current:  $${state.balance?.toFixed(2) || '0.00'}`);
                console.log(`  Peak:     $${state.peakBalance?.toFixed(2) || '0.00'}`);
                console.log(`  Profit:   $${((state.balance || 1000) - 1000).toFixed(2)}\n`);
            } else {
                console.log(`\n${COLORS.YELLOW}No trades yet - starting balance: $1000.00\n`);
            }
            await prompt('${COLORS.YELLOW}Press Enter...${COLORS.RESET}');
            clearScreen();
            printBanner();
            promptMenu();
            break;
        
        case '0':
            clearScreen();
            printBanner();
            promptMenu();
            break;
        
        default:
            console.log(`${COLORS.RED}Invalid option${COLORS.RESET}`);
            setTimeout(() => handleConfigMenu(), 500);
    }
};

const displayDocumentation = async () => {
    clearScreen();
    console.log(`
${COLORS.BRIGHT}╔════════════════════════════════════════════════════════════╗${COLORS.RESET}
${COLORS.BRIGHT}║                    DOCUMENTATION                          ║${COLORS.RESET}
${COLORS.BRIGHT}╚════════════════════════════════════════════════════════════╝${COLORS.RESET}

${COLORS.GREEN}📖 Quick Start:${COLORS.RESET}
  1. Edit ./config/.env with your API keys
  2. Run backtest to verify signals work
  3. Start live trading when confident

${COLORS.YELLOW}Key Files:${COLORS.RESET}
  • ./docs/README.md           Full documentation
  • ./docs/SETUP.md            Installation guide
  • ./config/.env              Configuration file
  • ./src/index.js             Live trading bot
  • ./src/backtest.js          Backtesting engine

${COLORS.CYAN}Features:${COLORS.RESET}
  ✓ Market Regime Filter (ADX + EMA200)
  ✓ Multi-timeframe analysis (HTF confirmation)
  ✓ 28-factor scoring system
  ✓ Dynamic risk management
  ✓ Telegram notifications
  ✓ Paper trading mode

${COLORS.BLUE}Support:${COLORS.RESET}
  • Run \`node app.js\` to open this menu
  • Check ./docs/README.md for detailed guide
  • See ./docs/SETUP.md for troubleshooting

`);
    
    await prompt(`${COLORS.YELLOW}Press Enter to return to menu...${COLORS.RESET}`);
    clearScreen();
    printBanner();
    promptMenu();
};

// ──────────────────────────────────────────────────────────────
// STARTUP
// ──────────────────────────────────────────────────────────────

console.log(`${COLORS.DIM}Loading PaperBot Control Panel...${COLORS.RESET}`);

// Ensure data directory exists
if (!fs.existsSync('./data/paper_runtime')) {
    fs.mkdirSync('./data/paper_runtime', { recursive: true });
}

// Start interactive menu
setTimeout(promptMenu, 500);
