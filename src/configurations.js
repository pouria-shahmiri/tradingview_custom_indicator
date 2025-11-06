export const configurationData = {
    // Represents the resolutions for bars supported by your datafeed
    supported_resolutions: ['1', '2', '3', '5', '10', '15', '30', '60', '240', '1D', '1W'],
    time_frames: [
        { text: '1m', resolution: '1', description: '1 Minute' },
        { text: '2m', resolution: '2', description: '2 Minutes' },
        { text: '3m', resolution: '3', description: '3 Minutes' },
        { text: '5m', resolution: '5', description: '5 Minutes' },
        { text: '10m', resolution: '10', description: '10 Minutes' },
        { text: '15m', resolution: '15', description: '15 Minutes' },
        { text: '30m', resolution: '30', description: '30 Minutes' },
        { text: '1h', resolution: '60', description: '1 Hour' },
        { text: '4h', resolution: '240', description: 'All', title: 'All' },
        { text: '1D', resolution: '1D', description: 'All', title: 'All' },
        { text: '1W', resolution: '1W', description: 'All', title: 'All' }
    ],
    // The exchanges arguments are used for the searchSymbols method if a user selects the exchange
    exchanges: [
        { value: 'bybit', name: 'bybit', desc: 'bybit' },
        { value: 'bingx', name: 'bingx', desc: 'bingx' },
    ],
    // The symbols_types arguments are used for the searchSymbols method if a user selects this symbol type
    symbols_types: [{ name: 'crypto', value: 'crypto' }]
};
