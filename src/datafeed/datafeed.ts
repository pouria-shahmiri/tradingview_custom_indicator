/**
 * TradingView Charting Library Datafeed
 *
 * This is a basic implementation that connects to a data source.
 * For production use, you'll want to connect to a real data provider.
 *
 * Documentation: https://www.tradingview.com/charting-library-docs/latest/connecting_data/
 */

export interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

const supportedResolutions = ['1', '5', '15', '30', '60', '240', '1D', '1W', '1M'];

const configurationData = {
  supported_resolutions: supportedResolutions,
  exchanges: [
    {
      value: 'Binance',
      name: 'Binance',
      desc: 'Binance Exchange',
    },
  ],
  symbols_types: [
    {
      name: 'crypto',
      value: 'crypto',
    },
  ],
};

export default {
  onReady: (callback: (config: any) => void) => {
    console.log('[Datafeed] onReady');
    setTimeout(() => callback(configurationData));
  },

  searchSymbols: (
    userInput: string,
    exchange: string,
    symbolType: string,
    onResultReadyCallback: (symbols: any[]) => void
  ) => {
    console.log('[Datafeed] searchSymbols:', userInput);
    // For demonstration, return empty array
    // In production, implement symbol search
    onResultReadyCallback([]);
  },

  resolveSymbol: (
    symbolName: string,
    onSymbolResolvedCallback: (symbolInfo: any) => void,
    onResolveErrorCallback: (reason: string) => void
  ) => {
    console.log('[Datafeed] resolveSymbol:', symbolName);

    const symbolInfo = {
      ticker: symbolName,
      name: symbolName,
      description: symbolName,
      type: 'crypto',
      session: '24x7',
      timezone: 'Etc/UTC',
      exchange: 'Binance',
      minmov: 1,
      pricescale: 100,
      has_intraday: true,
      has_weekly_and_monthly: true,
      supported_resolutions: supportedResolutions,
      volume_precision: 2,
      data_status: 'streaming',
    };

    setTimeout(() => onSymbolResolvedCallback(symbolInfo), 0);
  },

  getBars: async (
    symbolInfo: any,
    resolution: string,
    periodParams: any,
    onHistoryCallback: (bars: Bar[], meta: { noData: boolean }) => void,
    onErrorCallback: (error: string) => void
  ) => {
    console.log('[Datafeed] getBars:', symbolInfo.ticker, resolution, periodParams);

    try {
      // For demonstration, we'll use Binance API
      // In production, use your preferred data source
      const symbol = symbolInfo.ticker.replace('/', '');
      const interval = convertResolution(resolution);

      const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=1000`;

      const response = await fetch(url);
      const data = await response.json();

      if (!data || data.length === 0) {
        onHistoryCallback([], { noData: true });
        return;
      }

      const bars: Bar[] = data.map((item: any) => ({
        time: item[0],
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
        volume: parseFloat(item[5]),
      }));

      onHistoryCallback(bars, { noData: false });
    } catch (error) {
      console.error('[Datafeed] getBars error:', error);
      onErrorCallback(String(error));
    }
  },

  subscribeBars: (
    symbolInfo: any,
    resolution: string,
    onRealtimeCallback: (bar: Bar) => void,
    subscriberUID: string,
    onResetCacheNeededCallback: () => void
  ) => {
    console.log('[Datafeed] subscribeBars:', symbolInfo.ticker, resolution, subscriberUID);
    // For demonstration, we don't implement real-time updates
    // In production, implement WebSocket connection for live data
  },

  unsubscribeBars: (subscriberUID: string) => {
    console.log('[Datafeed] unsubscribeBars:', subscriberUID);
  },
};

/**
 * Convert TradingView resolution to Binance interval
 */
function convertResolution(resolution: string): string {
  const resolutionMap: { [key: string]: string } = {
    '1': '1m',
    '5': '5m',
    '15': '15m',
    '30': '30m',
    '60': '1h',
    '240': '4h',
    '1D': '1d',
    '1W': '1w',
    '1M': '1M',
  };

  return resolutionMap[resolution] || '1d';
}
