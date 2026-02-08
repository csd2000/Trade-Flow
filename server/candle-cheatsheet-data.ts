export const candleCheatsheetStrategy = {
  slug: "secret-sauce-candle-cheatsheet",
  title: "Candle Pattern Cheat Sheet",
  summary: "Master the 12 most powerful candlestick patterns used by professional traders. This condensed training reveals the exact candle formations that signal high-probability reversals and continuations.",
  category: "Day",
  risk: "Medium",
  roiRange: "15-40% monthly",
  tags: ["candlesticks", "price-action", "reversals", "patterns", "secret-sauce"],
  trainingUrl: "/training/secret-sauce-candle-cheatsheet",
};

export const candleCheatsheetModules = [
  {
    moduleNumber: 1,
    title: "Reversal Power Patterns: Hammer & Shooting Star",
    description: "The two most reliable single-candle reversal signals that professionals trade daily",
    duration: "8 minutes",
    durationMinutes: 8,
    orderIndex: 1,
    content: {
      sections: [
        {
          title: "The Hammer - Bullish Reversal King",
          content: `**Pattern Recognition:**
• Small body at the TOP of the candle range
• Long lower shadow (wick) at least 2x the body length
• Little to no upper shadow
• Color doesn't matter, but green hammers are stronger

**Trading Rules:**
1. Must appear AFTER a downtrend (3+ red candles)
2. Entry: Above hammer's high on next candle
3. Stop Loss: Below hammer's low
4. Target: 2:1 minimum (measure the downtrend swing)

**Pro Tip:** Hammers at key support levels with high volume = highest probability setups`
        },
        {
          title: "The Shooting Star - Bearish Reversal Signal",
          content: `**Pattern Recognition:**
• Small body at the BOTTOM of the candle range
• Long upper shadow (wick) at least 2x the body length
• Little to no lower shadow
• Color doesn't matter, but red shooting stars are stronger

**Trading Rules:**
1. Must appear AFTER an uptrend (3+ green candles)
2. Entry: Below shooting star's low on next candle
3. Stop Loss: Above shooting star's high
4. Target: 2:1 minimum (measure the uptrend swing)

**Pro Tip:** Shooting stars at resistance with decreasing volume on the prior move = high probability shorts`
        }
      ]
    }
  },
  {
    moduleNumber: 2,
    title: "Engulfing Patterns: The Momentum Shift Signals",
    description: "When one candle completely consumes the previous - a powerful momentum reversal sign",
    duration: "10 minutes",
    durationMinutes: 10,
    orderIndex: 2,
    content: {
      sections: [
        {
          title: "Bullish Engulfing - Bears Get Swallowed",
          content: `**Pattern Recognition:**
• A red (bearish) candle followed by a green (bullish) candle
• The green candle's BODY completely covers the red candle's body
• The larger the engulfing candle, the stronger the signal
• Shadows don't need to be engulfed, only the bodies

**Entry Checklist:**
✓ Prior downtrend of at least 3 candles
✓ Engulfing candle has above-average volume
✓ Appears near support level
✓ Green candle closes in upper 25% of its range

**Trade Setup:**
• Entry: Market or above engulfing high
• Stop: Below engulfing low
• Target 1: 1.5x risk
• Target 2: Prior swing high`
        },
        {
          title: "Bearish Engulfing - Bulls Get Crushed",
          content: `**Pattern Recognition:**
• A green (bullish) candle followed by a red (bearish) candle
• The red candle's BODY completely covers the green candle's body
• Opens above prior close, closes below prior open
• Higher volume = more conviction

**Entry Checklist:**
✓ Prior uptrend of at least 3 candles
✓ Engulfing candle has above-average volume
✓ Appears near resistance level
✓ Red candle closes in lower 25% of its range

**Trade Setup:**
• Entry: Market or below engulfing low
• Stop: Above engulfing high
• Target 1: 1.5x risk
• Target 2: Prior swing low`
        }
      ]
    }
  },
  {
    moduleNumber: 3,
    title: "Doji Candles: The Market's Indecision Signal",
    description: "When bulls and bears are perfectly balanced - a warning of potential reversal",
    duration: "8 minutes",
    durationMinutes: 8,
    orderIndex: 3,
    content: {
      sections: [
        {
          title: "Understanding Doji Psychology",
          content: `**What a Doji Tells You:**
The open and close are nearly identical, creating a cross or plus sign pattern. This means neither buyers nor sellers won the battle during that period.

**Key Doji Types:**

1. **Standard Doji** (Cross shape)
   • Equal upper and lower shadows
   • Maximum indecision
   • Wait for confirmation before trading

2. **Gravestone Doji** (T upside down)
   • Long upper shadow, no lower shadow
   • Bearish signal - buyers pushed up but sellers rejected
   • Entry: Below doji low

3. **Dragonfly Doji** (T shape)
   • Long lower shadow, no upper shadow
   • Bullish signal - sellers pushed down but buyers rejected
   • Entry: Above doji high`
        },
        {
          title: "Trading Doji Patterns",
          content: `**The #1 Rule: Never Trade a Doji Alone**

Dojis require CONFIRMATION from the next candle:
• Bullish confirmation = green candle closing above doji high
• Bearish confirmation = red candle closing below doji low

**High-Probability Doji Setups:**

1. **Doji at Support (Bullish)**
   • Price touches major support
   • Doji forms showing rejection
   • Next candle closes green
   • Entry above doji high

2. **Doji at Resistance (Bearish)**
   • Price touches major resistance
   • Doji forms showing rejection
   • Next candle closes red
   • Entry below doji low

**Volume Confirmation:**
• Doji with HIGH volume = strong indecision, likely reversal
• Doji with LOW volume = weak signal, may continue trend`
        }
      ]
    }
  },
  {
    moduleNumber: 4,
    title: "Morning Star & Evening Star: Three-Candle Reversals",
    description: "The most reliable multi-candle reversal patterns in technical analysis",
    duration: "12 minutes",
    durationMinutes: 12,
    orderIndex: 4,
    content: {
      sections: [
        {
          title: "Morning Star - Dawn of a New Uptrend",
          content: `**Pattern Structure (3 Candles):**

Candle 1: Large RED bearish candle (continuing downtrend)
Candle 2: Small body (doji or spinning top) that GAPS below candle 1
Candle 3: Large GREEN bullish candle that closes into candle 1's body

**Why It Works:**
• Candle 1: Bears in full control
• Candle 2: Momentum exhaustion, indecision
• Candle 3: Bulls take over aggressively

**Trading the Morning Star:**
• Entry: Close of candle 3 or break above its high
• Stop Loss: Below the low of candle 2 (the star)
• Target: Measure the prior downtrend, project upward

**Quality Checklist:**
✓ Candle 3 closes above 50% of candle 1's body
✓ Volume increases on candle 3
✓ Appears after extended downtrend
✓ Forms at key support level`
        },
        {
          title: "Evening Star - Darkness Falls on Bulls",
          content: `**Pattern Structure (3 Candles):**

Candle 1: Large GREEN bullish candle (continuing uptrend)
Candle 2: Small body (doji or spinning top) that GAPS above candle 1
Candle 3: Large RED bearish candle that closes into candle 1's body

**Why It Works:**
• Candle 1: Bulls in full control
• Candle 2: Momentum exhaustion, indecision
• Candle 3: Bears take over aggressively

**Trading the Evening Star:**
• Entry: Close of candle 3 or break below its low
• Stop Loss: Above the high of candle 2 (the star)
• Target: Measure the prior uptrend, project downward

**Quality Checklist:**
✓ Candle 3 closes below 50% of candle 1's body
✓ Volume increases on candle 3
✓ Appears after extended uptrend
✓ Forms at key resistance level`
        }
      ]
    }
  },
  {
    moduleNumber: 5,
    title: "Marubozu: Pure Momentum Candles",
    description: "When a candle has no shadows - indicating complete dominance by buyers or sellers",
    duration: "6 minutes",
    durationMinutes: 6,
    orderIndex: 5,
    content: {
      sections: [
        {
          title: "Reading Marubozu Power",
          content: `**What Makes a Marubozu:**
• NO upper shadow (opens at low for bullish, opens at high for bearish)
• NO lower shadow (closes at high for bullish, closes at low for bearish)
• A "full body" candle showing complete dominance

**Bullish Marubozu (Green):**
• Opens at the low, closes at the high
• Buyers controlled EVERY moment of the period
• Extremely bullish - expect continuation
• Even more powerful after a pullback

**Bearish Marubozu (Red):**
• Opens at the high, closes at the low
• Sellers controlled EVERY moment of the period
• Extremely bearish - expect continuation
• Even more powerful after a rally`
        },
        {
          title: "Trading Marubozu Patterns",
          content: `**Continuation Strategy:**
Marubozu candles often signal the START of a strong move, not the end.

**Bullish Marubozu Entry:**
1. Wait for a small pullback (1-3 candles)
2. Enter when price breaks above the marubozu high
3. Stop: Below the pullback low
4. Target: 2x the marubozu body length

**Bearish Marubozu Entry:**
1. Wait for a small pullback (1-3 candles)
2. Enter when price breaks below the marubozu low
3. Stop: Above the pullback high
4. Target: 2x the marubozu body length

**Warning Signs:**
• Marubozu at extreme overbought/oversold = possible exhaustion
• Back-to-back marubozu = climactic move, wait for pullback
• Marubozu with low volume = weaker signal`
        }
      ]
    }
  },
  {
    moduleNumber: 6,
    title: "Three White Soldiers & Three Black Crows",
    description: "Triple candle patterns that confirm trend reversals with high reliability",
    duration: "8 minutes",
    durationMinutes: 8,
    orderIndex: 6,
    content: {
      sections: [
        {
          title: "Three White Soldiers - Bull Army Advancing",
          content: `**Pattern Recognition:**
• Three consecutive GREEN candles
• Each candle opens within the previous candle's body
• Each candle closes progressively higher
• Each candle has a small upper shadow (or none)
• Each candle has similar body size (no shrinking)

**What It Signals:**
A complete shift in market sentiment from bearish to bullish. Sellers have exhausted, and buyers are marching price higher with conviction.

**Trading Rules:**
• Entry: Close of third candle or next candle open
• Stop Loss: Below the low of the first soldier
• Target: Measure the three-candle range, project 100% higher

**Quality Factors:**
✓ Appears after clear downtrend
✓ Each soldier is similar in size
✓ Upper shadows are minimal (< 25% of body)
✓ Volume increases with each candle`
        },
        {
          title: "Three Black Crows - Bear Army Descending",
          content: `**Pattern Recognition:**
• Three consecutive RED candles
• Each candle opens within the previous candle's body
• Each candle closes progressively lower
• Each candle has a small lower shadow (or none)
• Each candle has similar body size (no shrinking)

**What It Signals:**
A complete shift in market sentiment from bullish to bearish. Buyers have exhausted, and sellers are driving price lower with conviction.

**Trading Rules:**
• Entry: Close of third candle or next candle open
• Stop Loss: Above the high of the first crow
• Target: Measure the three-candle range, project 100% lower

**Quality Factors:**
✓ Appears after clear uptrend
✓ Each crow is similar in size
✓ Lower shadows are minimal (< 25% of body)
✓ Volume increases with each candle`
        }
      ]
    }
  },
  {
    moduleNumber: 7,
    title: "Spinning Top & High Wave: Caution Signals",
    description: "Small body candles that warn of potential trend exhaustion and reversals",
    duration: "6 minutes",
    durationMinutes: 6,
    orderIndex: 7,
    content: {
      sections: [
        {
          title: "Spinning Top - Balance of Power",
          content: `**Pattern Recognition:**
• Small body (color doesn't matter)
• Upper and lower shadows of roughly equal length
• Shadows are longer than the body but not excessively long
• Appears after a trend (up or down)

**Psychology:**
Bulls and bears are fighting but neither side is winning. The trend is losing momentum.

**How to Trade:**
1. **After Uptrend:** Watch for bearish confirmation (red candle below spinning top low)
2. **After Downtrend:** Watch for bullish confirmation (green candle above spinning top high)

**Never Trade Alone:**
A spinning top is a WARNING, not a signal. Always wait for the next candle to confirm direction.`
        },
        {
          title: "High Wave Candle - Extreme Volatility Warning",
          content: `**Pattern Recognition:**
• Very small body (almost like a doji)
• Extremely long upper AND lower shadows
• Shadows are 3x+ the body length
• Shows wild price swings during the period

**What It Means:**
Extreme volatility and indecision. Price made large moves in both directions but couldn't hold gains in either. Often marks major turning points.

**Trading High Wave Candles:**

**At Resistance:**
• Bearish signal - expect rejection
• Wait for next red candle below high wave low
• Stop above high wave high

**At Support:**
• Bullish signal - expect bounce
• Wait for next green candle above high wave high
• Stop below high wave low

**Pro Tip:**
High wave candles with massive volume at key levels are often institutional distribution (at tops) or accumulation (at bottoms).`
        }
      ]
    }
  },
  {
    moduleNumber: 8,
    title: "Cheat Sheet Summary: Quick Reference Guide",
    description: "Complete visual reference for all 12 patterns with instant trade setups",
    duration: "5 minutes",
    durationMinutes: 5,
    orderIndex: 8,
    content: {
      sections: [
        {
          title: "Bullish Patterns Quick Reference",
          content: `**SINGLE CANDLE BULLISH:**
• Hammer: Long lower wick, small body at top → BUY above high
• Dragonfly Doji: Long lower wick, no body → BUY above high with confirmation
• Bullish Marubozu: Full green body, no wicks → BUY on pullback

**TWO CANDLE BULLISH:**
• Bullish Engulfing: Green candle swallows red → BUY above engulfing high

**THREE CANDLE BULLISH:**
• Morning Star: Red + Small + Green → BUY on close of third candle
• Three White Soldiers: 3 rising green candles → BUY on close of third candle

**UNIVERSAL BULLISH RULES:**
1. Pattern appears AFTER downtrend
2. Ideally at support level
3. Volume confirms
4. Stop below pattern low
5. Target minimum 2:1 R:R`
        },
        {
          title: "Bearish Patterns Quick Reference",
          content: `**SINGLE CANDLE BEARISH:**
• Shooting Star: Long upper wick, small body at bottom → SELL below low
• Gravestone Doji: Long upper wick, no body → SELL below low with confirmation
• Bearish Marubozu: Full red body, no wicks → SELL on pullback

**TWO CANDLE BEARISH:**
• Bearish Engulfing: Red candle swallows green → SELL below engulfing low

**THREE CANDLE BEARISH:**
• Evening Star: Green + Small + Red → SELL on close of third candle
• Three Black Crows: 3 falling red candles → SELL on close of third candle

**UNIVERSAL BEARISH RULES:**
1. Pattern appears AFTER uptrend
2. Ideally at resistance level
3. Volume confirms
4. Stop above pattern high
5. Target minimum 2:1 R:R

**THE GOLDEN RULE:**
Context is everything! A pattern at the right level with volume confirmation is 3x more reliable than the same pattern in the middle of nowhere.`
        }
      ]
    }
  }
];
