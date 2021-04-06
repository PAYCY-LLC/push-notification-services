import XRatesProvider from '../providers/xrates/xrates.provider';

class DataCollectorService {
    constructor(logger, coinInfoService) {
        this.logger = logger;

        this.xratesProvider = new XRatesProvider(
            this.logger,
            coinInfoService
        );
    }

    async getLatestXRates(coinIds, fiatCode) {
        return this.xratesProvider.getXRates(coinIds, fiatCode)
    }

    async getDailyOpeningXRates(coinIds, fiatCode) {
        return this.xratesProvider.getXRates(coinIds, fiatCode)
    }

    async getHistoricalXRates(coinId, fiatCode, timePeriod, aggregate, limit, toTimestamp) {
        return this.xratesProvider.getHistoricalXRates(coinId, fiatCode, timePeriod, aggregate, limit, toTimestamp)
    }
}

export default DataCollectorService
