const fs = require('fs');
let code = fs.readFileSync('src/index.js', 'utf8');

const regex = /if \(code === 0\) \{[\s\S]*?\{ parse_mode: 'Markdown' \}\n                    \);/m;

const replacement = `if (code === 0) {
                    const lines = output.split('\n').filter(l => l.trim());
                    
                    let summaryLines = [];
                    let capture = false;
                    for (const line of lines) {
                        if (line.includes('ИТОГИ БЭКТЕСТА') || line.includes('BACKTEST RESULTS')) capture = true;
                        if (capture) summaryLines.push(line);
                    }
                    if (summaryLines.length === 0) summaryLines = lines.slice(-20);
                    
                    const lastText = summaryLines.join('\n').replace(/[\[\]]/g, '').substring(0, 1500);
                    
                    await ctx.reply(
                        '✅ *BACKTEST COMPLETE*\n\n\`\`\`\n' + lastText + '\n\`\`\`',
                        { parse_mode: 'Markdown' }
                    );`;

code = code.replace(regex, replacement);
fs.writeFileSync('src/index.js', code);
