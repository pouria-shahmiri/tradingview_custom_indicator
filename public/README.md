# Order Block Detector - TradingView Charting Library

A clean implementation of the Order Block Detector custom indicator for TradingView Charting Library, inspired by LuxAlgo's Order Block Detector algorithm.

## Features

- **Bullish Order Blocks**: Detected and displayed with green lines
- **Bearish Order Blocks**: Detected and displayed with red lines
- **Average Lines**: Middle line showing the average of top and bottom
- **Configurable Parameters**:
  - Volume Pivot Length (1-20, default: 5)
  - Bullish Order Block Count (1-10, default: 3)
  - Bearish Order Block Count (1-10, default: 3)
  - Mitigation Method (Wick or Close)

## Structure

```
public/
├── index.html    # Clean HTML structure with TradingView scripts
├── script.js     # Widget initialization and custom indicator logic
└── README.md     # This file
```

## How to Use

### Option 1: Local Development

1. Open `index.html` in a web browser
2. The chart will load with the Order Block Detector automatically applied

### Option 2: Serve with HTTP Server

```bash
# Using Python
cd public
python -m http.server 8000

# Using Node.js
cd public
npx http-server -p 8000

# Using Next.js (from project root)
npm run dev
# Then navigate to http://localhost:3000/index.html
```

### Option 3: Deploy

Upload the files to any web hosting service (GitHub Pages, Netlify, Vercel, etc.)

## Customization

### Change Symbol

In `script.js`, modify the `symbol` property:

```javascript
symbol: "BTCUSDT",  // Change to any symbol like "AAPL", "ETHUSDT", etc.
```

### Change Interval

In `script.js`, modify the `interval` property:

```javascript
interval: "1D",  // Options: "1", "5", "15", "60", "240", "1D", "1W", "1M"
```

### Modify Indicator Settings

The indicator settings can be changed in the TradingView UI after loading, or you can modify the defaults in `script.js`:

```javascript
defaults: {
  inputs: {
    volumePivotLength: 5,      // Change detection sensitivity
    bullishOBCount: 3,         // Number of bullish blocks to show
    bearishOBCount: 3,         // Number of bearish blocks to show
    mitigationMethod: 0,       // 0 = Wick, 1 = Close
  },
}
```

### Customize Colors

In the `defaults.styles` section of `script.js`:

```javascript
bullish_ob_top: {
  color: "#169400",  // Green for bullish
  linewidth: 3,
  transparency: 20,
},
bearish_ob_top: {
  color: "#ff1100",  // Red for bearish
  linewidth: 3,
  transparency: 20,
},
```

## How It Works

The indicator detects order blocks using the following algorithm:

1. **Volume Pivot Detection**: Identifies bars with high volume relative to surrounding bars
2. **Market Structure Analysis**: Determines if the market is in a bullish or bearish structure
3. **Order Block Formation**: When a volume pivot is detected:
   - Bullish blocks are created in bullish market structure
   - Bearish blocks are created in bearish market structure
4. **Mitigation**: Blocks are removed when price breaks through them (based on the mitigation method)

## Notes

- This implementation uses the TradingView Charting Library's `custom_indicators_getter` API
- The indicator is applied automatically when the chart loads
- Order blocks are drawn as horizontal lines extending from their formation point
- The algorithm is adapted from LuxAlgo's Order Block Detector for Pine Script

## License

Based on LuxAlgo's Order Block Detector algorithm
Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)

## Resources

- [TradingView Charting Library Documentation](https://www.tradingview.com/charting-library-docs/)
- [Custom Studies API](https://www.tradingview.com/charting-library-docs/latest/custom_studies/)
- [PineJS Documentation](https://www.tradingview.com/charting-library-docs/latest/custom_studies/PineJS-Methods/)
