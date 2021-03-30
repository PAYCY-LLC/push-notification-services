import CoinGecko from 'coingecko-api'

class CoinGeckoProvider {
    constructor() {
        this.coinGeckoClient = new CoinGecko();
    }

    async getXRates(coinIds, fiatCodes) {
        const params = {
            ids: [coinIds],
            vs_currencies: [fiatCodes],
            include_market_cap: false,
            include_24hr_vol: false,
            include_24hr_change: false,
            include_last_updated_at: false
        }
        return this.coinGeckoClient.simple.price(params);
    }

    async getHistoricalXRates(coinId, fiatCode, fromTimestamp, toTimestamp) {
        const params = {
            vs_currency: fiatCode,
            from: fromTimestamp,
            to: toTimestamp
        }

        return this.coinGeckoClient.coins.fetchMarketChartRange(coinId, params);
    }
}

export default CoinGeckoProvider;
