/**
 * Custom Binance Datafeed for TradingView Advanced Charts
 * Implements UDF-compatible datafeed interface
 */

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

// Map TradingView intervals to Binance intervals
const resolutionMap: { [key: string]: string } = {
  '1': '1m',
  '3': '3m',
  '5': '5m',
  '15': '15m',
  '30': '30m',
  '45': '45m',
  '60': '1h',
  '120': '2h',
  '180': '3h',
  '240': '4h',
  '1D': '1d',
  '1W': '1w',
  '1M': '1M',
};

class BinanceDatafeed {
  onReady(callback: (config: any) => void) {
    setTimeout(() => {
      callback({
        supported_resolutions: ['1', '3', '5', '15', '30', '45', '60', '120', '180', '240', '1D', '1W', '1M'],
        supports_marks: false,
        supports_timescale_marks: false,
        supports_time: true,
      });
    }, 0);
  }

  searchSymbols(
    userInput: string,
    exchange: string,
    symbolType: string,
    onResultReadyCallback: (symbols: any[]) => void
  ) {
    // For simplicity, we'll return a few popular symbols
    const symbols = [
      {
        symbol: 'BTCUSDT',
        full_name: 'BTCUSDT',
        description: 'Bitcoin / USDT',
        exchange: 'Binance',
        type: 'crypto',
      },
      {
        symbol: 'ETHUSDT',
        full_name: 'ETHUSDT',
        description: 'Ethereum / USDT',
        exchange: 'Binance',
        type: 'crypto',
      },
      {
        symbol: 'BNBUSDT',
        full_name: 'BNBUSDT',
        description: 'BNB / USDT',
        exchange: 'Binance',
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
    const symbolInfo: LibrarySymbolInfo = {
      name: symbolName,
      ticker: symbolName,
      description: symbolName,
      type: 'crypto',
      session: '24x7',
      timezone: 'Etc/UTC',
      minmov: 1,
      pricescale: 100,
      has_intraday: true,
      has_no_volume: false,
      has_weekly_and_monthly: true,
      supported_resolutions: ['1', '3', '5', '15', '30', '45', '60', '120', '180', '240', '1D', '1W', '1M'],
      volume_precision: 2,
      data_status: 'streaming',
    };

    setTimeout(() => {
      onSymbolResolvedCallback(symbolInfo);
    }, 0);
  }

  async getBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: string,
    periodParams: PeriodParams,
    onHistoryCallback: (bars: Bar[], meta: { noData: boolean }) => void,
    onErrorCallback: (error: string) => void
  ) {
    try {
      const binanceInterval = resolutionMap[resolution] || '1d';
      const symbol = symbolInfo.name;

      // Calculate limit (number of bars to fetch)
      const limit = Math.min(periodParams.countBack || 500, 1000);

      // Fetch from Binance
      const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${binanceInterval}&limit=${limit}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        onHistoryCallback([], { noData: true });
        return;
      }

      // Convert Binance data to TradingView bars
      const bars: Bar[] = data
        .map((item: any) => ({
          time: item[0], // Binance returns timestamp in milliseconds
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          close: parseFloat(item[4]),
          volume: parseFloat(item[5]),
        }))
        .filter((bar: Bar) => bar.time >= periodParams.from * 1000 && bar.time <= periodParams.to * 1000);

      onHistoryCallback(bars, { noData: false });
    } catch (error) {
      console.error('Error fetching bars:', error);
      onErrorCallback(error instanceof Error ? error.message : 'Unknown error');
    }
  }

  subscribeBars(
    symbolInfo: LibrarySymbolInfo,
    resolution: string,
    onRealtimeCallback: (bar: Bar) => void,
    subscriberUID: string,
    onResetCacheNeededCallback: () => void
  ) {
    // Real-time updates can be implemented using WebSocket
    // For now, we'll use polling
    console.log('subscribeBars:', subscriberUID);
  }

  unsubscribeBars(subscriberUID: string) {
    console.log('unsubscribeBars:', subscriberUID);
  }
}

export default BinanceDatafeed;
