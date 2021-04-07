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
                if (coinGeckoIds.length > 0) {
                    const result = await this.defaultProvider.getXRates(coinGeckoIds, fiatCode)
                    const xrates = []

                    coinInfos.forEach(info => {
                        try {
                            const xrate = new XRate(
                                info.id,
                                info.code,
                                info.name,
                                fiatCode,
                                result.data[info.coinGeckoId.toLowerCase()][fiatCode.toLowerCase()]
                            )

                            xrates.push(xrate)
                        } catch (e) {
                            // ignore
                        }
                    })

                    return xrates
                }
            }
        } catch (e) {
            this.logger.error(`Error getting XRates for coinCodes: ${coinIds}: ${e}`)
        }

        return {}
    }
}

export default XRatesProvider;
