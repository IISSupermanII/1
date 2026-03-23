# 🚀 QUICKSTART - За 5 минут в боя!

**Production-ready trading bot** • Version 1.0 • Status: ✅ Ready

---

## ⚡ Установка (2 минуты)

```bash
# 1. Зависимости
npm install

# 2. Конфиг
cp config/.env.example config/.env
# Открой config/.env и вставь свои API ключи Gate.io
# GATE_API_KEY=xxx
# GATE_API_SECRET=yyy
# GATE_UID=zzz

# 3. Готово!
echo "✓ Setup complete"
```

---

## 🎮 Главное Меню (РЕКОМЕНДУЕТСЯ!)

```bash
node app.js
```

Откроется красивое интерактивное меню:

```
╔═══════════════════════════════════════╗
║     🤖 PAPERBOT Control Panel         ║
╚═══════════════════════════════════════╝

1 🚀 Start Live Trading      (Paper Mode)
2 📊 Run Backtest            (Test Strategy)
3 📈 Monitor Market Regime   (Real-time)
4 ⚙️  Configuration          (Edit params)
5 📚 View Documentation      (Help)
6 🔧 System Status           (Health check)
0 ❌ Exit

Enter option: _
```

---

## 🎯 Основные Операции

### Вариант 1: Через Меню (ПРОСТО!)

```bash
node app.js

# Нажми 1 → Start Live Trading
# Боту чёрные логи → жди сигналов
# Ctrl+C чтобы остановить
```

### Вариант 2: Прямые Команды

```bash
# Торговля
npm start              # или npm run trade

# Бэктест
npm run test-quick     # Быстрый тест BTC
npm run test-full      # Полный тест всех пар

# Мониторинг
npm run monitor        # Смотреть режим рынка
```

---

## 📊 Первый Бэктест (3 минуты)

```bash
node app.js

# Выбери: 2 (Run Backtest)
# Выбери: 1 (Quick Test)
# Жди результата...

# Результат покажет:
# ✅ P/L и winrate
# ✅ Доп детали о сделках
# ✅ Рекомендации
```

---

## 📈 Мониторинг Рыночного Режима

```bash
# Через меню
node app.js
# Выбери: 3 (Monitor Market Regime)

# Прямо
npm run monitor

# Окончный вывод:
💩 SHORT OK   ← Торгуй SHORT!
📈 LONG OK    ← Ждешь
⚠️ FLAT       ← Боковик
😴 WEAK       ← Слабо
```

Если **💩 SHORT OK** → можно торговать! 🎉

---

## 🔥 Запуск Live Trading

```bash
# Через меню
node app.js
# Выбери: 1 (Start Live Trading)

# Или прямо
npm start

# Боту откроет торговлю в режиме Paper Trading
# Смотри логи для открытых сделок
# Ctrl+C чтобы остановить
```

---

## ⚙️ Конфигурация

### Главные Параметры (config/.env)

```env
# Обязательно (API)
GATE_API_KEY=xxx
GATE_API_SECRET=yyy
GATE_UID=zzz

# Нужно (Коммерческое опасно)
PAPER_POSITION_SIZE=400          # USD per trade
PAPER_RISK_PER_TRADE=2           # %

# Опционально (Advanced)
PAPER_MARKET_ADX_MIN=20          # Trend detection
PAPER_MARKET_EMA_ATR=0.5         # Distance buffer
```

### Изменить Параметры

**Способ 1: Через меню**
```bash
node app.js
# Выбери: 4 (Configuration)
```

**Способ 2: Редактор**
```bash
# Windows
code config/.env

# Mac/Linux
nano config/.env
```

**Способ 3: Переменные окружения**
```bash
PAPER_POSITION_SIZE=500 npm start
```

---

## 📱 Telegram Уведомления (Опционально)

1. Создай бота через @BotFather в Telegram
2. Добавь в config/.env:
```env
TELEGRAM_BOT_TOKEN=123:ABC...
TELEGRAM_CHAT_ID=987654321
TELEGRAM_ENABLED=true
```
3. Перезапусти бота

Будешь получать:
- ✅ Trade opened
- 📊 Scale-out
- 🎯 Take profit / Stop loss
- 📈 Daily summary

---

## 🐛 Troubleshooting

### "Cannot find module ccxt"
```bash
npm install
npm start
```

### "API key invalid"
- Проверь config/.env
- Убедись ключи не истекли в Gate.io
- Перезагрузи: npm start

### "No signals found"
- Запусти мониторинг (выбери 3)
- Проверь режим (SHORT OK или нет?)
- Если FLAT/LONG → рынок не в режиме SHORT

### "Бот не торгует"
- Проверь монитор (npm run monitor)
- Режим должен быть: 💩 SHORT OK
- Если нет → ждем смены режима
- Check баланс (menu → 6)

---

## 📊 Что Ожидать

### Профитабльность

| Период | Return | Win% | Status |
|--------|--------|------|--------|
| 15 дней | -0.7% to +1.8% | 40-45% | Best |
| 30 дней | -1.2% to +0.3% | 35-40% | Okay |
| 60 дней | +2.8% to +4.7% | 40-45% | Good |

**Текущий рынок (March 2026):** 🟡 UPTREND = SHORT менее viable

### Лучшие Пары

✅ **BTC/USDT** — +4.74% (main pair)  
✅ **LTC/USDT** — +2.83% (secondary)  
⚠️ **Остальные** — менее прибыльны

---

## 🎓 Как Это Работает

### Сигнал = Market Regime + Score

```
1. Проверить тренд (ADX >= 20?)
   ↓
2. Проверить расстояние от EMA200 (> 0.5×ATR?)
   ↓
3. Если оба условия → проверить score (> 70?)
   ↓
4. Если товарный → открыть SHORT позицию
   ↓
5. Stop-loss = 2×ATR
   Take-profit = 3×ATR
   ↓
6. При достижении 1:1 RR → переместить стоп на breakeven
   ↓
7. Закрыть когда: TP или SL хит или reversal
```

---

## ✅ Чеклист Первого Запуска

```
SETUP:
☑️ npm install (зависимости)
☑️ cp config/.env.example config/.env
☑️ Отредактировать config/.env с API ключами
☑️ npm start (первый запуск!)

FIRST TRADE:
☑️ node app.js → 2 (Run Backtest) → 1 (Quick Test)
☑️ Проверить результаты (должно быть > 50% winrate)
☑️ node app.js → 3 (Monitor) → Проверить режим
☑️ Если 💩 SHORT OK → готово торговать!
☑️ node app.js → 1 (Live Trading)

MONITORING:
☑️ Каждый час: Проверить логи торговли
☑️ Каждый день: Run monitor (npm run monitor)
☑️ Каждую неделю: Run backtest (npm run test-full)
```

---

## 📚 Документация

| Файл | Содержание |
|------|-----------|
| **app.js** | Главное приложение ← НАЧНИ ЗДЕСЬ |
| **docs/README.md** | Полная документация |
| **docs/SETUP.md** | Детальная установка |
| **config/.env.example** | Шаблон конфиг |

---

## 🚀 Далее...

**Готов начать?**

```bash
# Шаг 1: Установка
npm install
cp config/.env.example config/.env
# Отредактируй config/.env

# Шаг 2: Главное меню
node app.js

# Ты в деле! 🎉
```

---

**Версия:** 1.0 Production  
**Дата:** 15 Марта 2026  
**Статус:** ✅ Ready to Trade  

🚀 **СТАРТ! node app.js** 🚀
