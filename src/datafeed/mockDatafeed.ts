/**
 * Custom Mock Datafeed for TradingView Professional Charting Library
 * Uses local kline_mock_data.json file
 */

import mockData from '../kline_mock_data.json';

interface LibrarySymbolInfo {
  name: string;
  ticker: string;
  description: string;
  type: string;
  session: string;
  timezone: string;
  minmov: number;
  pricescale: number;
  has_intraday: boolean;
  has_no_volume: boolean;
  has_weekly_and_monthly: boolean;
  supported_resolutions: string[];
  volume_precision: number;
  data_status: string;
  exchange: string;
}

interface Bar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PeriodParams {
  from: number;
  to: number;
  countBack: number;
  firstDataRequest: boolean;
}

// Map TradingView intervals
const resolutionMap: { [key: string]: string } = {
  '1': '1',
  '2': '2',
  '3': '3',
  '5': '5',
  '10': '10',
  '15': '15',
  '30': '30',
  '60': '60',
  '240': '240',
  '1D': '1D',
  '1W': '1W',
};

class MockDatafeed {
  private mockBars: Bar[] = [];

  constructor() {
    // Convert mock data to bars format
    this.mockBars = mockData.data.map((item: any) => ({
      time: item.timestamp * 1000, // Convert to milliseconds
      open: parseFloat(item.open_price),
      high: parseFloat(item.high_price),
      low: parseFloat(item.low_price),
      close: parseFloat(item.close_price),
      volume: parseFloat(item.volume),
    })).sort((a: Bar, b: Bar) => a.time - b.time); // Sort by time ascending

    console.log('[MockDatafeed] Loaded bars:', this.mockBars.length);
  }

  onReady(callback: (config: any) => void) {
    console.log('[MockDatafeed] onReady called');
    setTimeout(() => {
      callback({
        supported_resolutions: ['1', '2', '3', '5', '10', '15', '30', '60', '240', '1D', '1W'],
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true,
        exchanges: [
          { value: 'bybit', name: 'Bybit', desc: 'Bybit Exchange' },
          { value: 'bingx', name: 'BingX', desc: 'BingX Exchange' },
        ],
        symbols_types: [
          { name: 'crypto', value: 'crypto' },
        ],
      });
    }, 0);
  }

  searchSymbols(
    userInput: string,
    exchange: string,
    symbolType: string,
    onResultReadyCallback: (symbols: any[]) => void
  ) {
    console.log('[MockDatafeed] searchSymbols:', userInput);
    const symbols = [
      {
        symbol: 'BTCUSDT',
        full_name: 'BTCUSDT',
        description: 'Bitcoin / USDT',
        exchange: 'Bybit',
        type: 'crypto',
      },
    ];

    const filtered = symbols.filter(
      (symbol) =>
        symbol.symbol.toLowerCase().includes(userInput.toLowerCase()) ||
        symbol.description.toLowerCase().includes(userInput.toLowerCase())
    );

    onResultReadyCallback(filtered);
  }

  resolveSymbol(
    symbolName: string,
    onSymbolResolvedCallback: (symbolInfo: LibrarySymbolInfo) => void,
    onResolveErrorCallback: (reason: string) => void
  ) {
    console.log('[MockDatafeed] resolveSymbol:', symbolName);

    const symbolInfo: LibrarySymbolInfo = {
      name: symbolName,
      ticker: symbolName,
      description: symbolName,
      type: 'crypto',
      session: '24x7',
      timezone: 'Etc/UTC',
      exchange: 'Bybit',
      minmov: 1,
      pricescale: 10, // For prices like 67297.5
      has_intraday: true,
      has_no_volume: false,
      has_weekly_and_monthly: true,
      supported_resolutions: ['1', '2', '3', '5', '10', '15', '30', '60', '240', '1D', '1W'],
      volume_precision: 2,
      data_status: 'streaming',
    };

    setTimeout(() => {
      onSymbolResolvedCallback(symbolInfo);
    }, 0);
  }

  getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: string,
    periodParams: PeriodParams,
    onHistoryCallback: (bars: Bar[], meta: { noData: boolean }) => void,
    onErrorCallback: (error: string) => void
  ) {
    console.log('[MockDatafeed] getBars called:', {
      symbol: symbolInfo.name,
      resolution,
      from: periodParams.from,
      to: periodParams.to,
      countBack: periodParams.countBack,
      firstDataRequest: periodParams.firstDataRequest,
    });

    try {
      if (!this.mockBars || this.mockBars.length === 0) {
        console.log('[MockDatafeed] No data available');
        onHistoryCallback([], { noData: true });
        return;
      }

      // For first request or if no time range specified, return all data
      if (periodParams.firstDataRequest) {
        console.log('[MockDatafeed] First request - returning all', this.mockBars.length, 'bars');
        onHistoryCallback([...this.mockBars], { noData: false });
        return;
      }

      // Filter bars by time range (timestamps in periodParams are in seconds)
      const fromMs = periodParams.from * 1000;
      const toMs = periodParams.to * 1000;

      const filteredBars = this.mockBars.filter((bar) => {
        return bar.time >= fromMs && bar.time <= toMs;
      });

      console.log('[MockDatafeed] Filtered bars:', filteredBars.length);

      if (filteredBars.length === 0) {
        // No more data available
        console.log('[MockDatafeed] No bars in requested range');
        onHistoryCallback([], { noData: true });
      } else {
        onHistoryCallback([...filteredBars], { noData: false });
      }
    } catch (error) {
      console.error('[MockDatafeed] Error in getBars:', error);
      onErrorCallback(String(error));
    }
  }

  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: string,
    onRealtimeCallback: (bar: Bar) => void,
    subscriberUID: string,
    onResetCacheNeededCallback: () => void
  ) {
    console.log('[MockDatafeed] subscribeBars:', subscriberUID);
    // Mock data doesn't have real-time updates
  }

  unsubscribeBars(subscriberUID: string) {
    console.log('[MockDatafeed] unsubscribeBars:', subscriberUID);
  }
}

export default MockDatafeed;
