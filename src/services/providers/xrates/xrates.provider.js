/* eslint-disable max-len */
import XRate from '../../../models/xrate.model'
import CoinGeckoProvider from './coingecko.provider'

class XRatesProvider {
    constructor(logger, coinInfoService) {
        this.logger = logger
        this.coinInfoService = coinInfoService

        this.defaultProvider = new CoinGeckoProvider()
    }

    async getHistoricalXRates(coinId, fiatCode, fromTimestamp, toTimestamp) {
        try {
            const result = await this.defaultProvider.getHistoricalXRates(
                coinId,
                fiatCode,
                fromTimestamp,
                toTimestamp
            )

            if (result) {
                return result
            }
        } catch (e) {
            this.logger.error(`Error getting HistoRates coinCode:${coinId}: ${e}`)
        }

        return {}
    }

    async getXRates(coinIds, fiatCode) {
        try {
            const coinInfos = await this.coinInfoService.getCoinInfos(coinIds)

            if (coinInfos) {
                const coinGeckoIds = coinInfos.map(info => info.coinGeckoId)
                const result = await this.defaultProvider.getXRates(coinGeckoIds, fiatCode)

                if (result) {
                    return coinInfos.map(info => new XRate(info.id, info.code, info.name, fiatCode, result.data[info.id][fiatCode.toLowerCase()]))
                }
            }
        } catch (e) {
            this.logger.error(`Error getting XRates coinCodes: ${coinIds}: ${e}`)
        }

        return {}
    }
}

export default XRatesProvider;
