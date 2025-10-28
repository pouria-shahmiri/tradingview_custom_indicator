# TradingView Charting Library Setup

This project uses TradingView's commercial Charting Library. Follow these steps to set it up:

## Prerequisites

You must have a valid TradingView Charting Library license. If you don't have one, visit:
https://www.tradingview.com/HTML5-stock-forex-bitcoin-charting-library/

## Installation Steps

### 1. Download the Charting Library

After obtaining your license, download the Charting Library package from TradingView.

### 2. Extract to Public Folder

Extract the downloaded package and place it in your project:

```
public/
└── charting_library/
    ├── charting_library/
    │   ├── charting_library.js
    │   ├── charting_library.d.ts
    │   └── ...
    ├── datafeeds/
    │   └── udf/
    └── ...
```

The final structure should look like:
```
public/
└── charting_library/
    ├── charting_library/
    ├── datafeeds/
    └── static/
```

### 3. Update index.html

The `index.html` file should already include the script tag to load the library:

```html
<script src="/charting_library/charting_library/charting_library.js"></script>
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Development Server

```bash
npm run dev
```

## Custom Studies

This project includes a custom Order Block Detector study located in:
```
src/studies/OrderBlockDetectorStudy.ts
```

The custom study is automatically loaded when the chart initializes.

## Troubleshooting

### Library Not Loading

If you see errors about `TradingView` not being defined:
1. Verify the charting library files are in `public/charting_library/`
2. Check the script tag in `index.html`
3. Clear your browser cache

### Custom Study Not Appearing

1. Open browser DevTools console to check for errors
2. Verify the study file is correctly imported
3. Check that the study is registered before chart creation

## Documentation

For full Charting Library documentation:
https://www.tradingview.com/charting-library-docs/

For Custom Studies API:
https://www.tradingview.com/charting-library-docs/latest/customization/studies/
