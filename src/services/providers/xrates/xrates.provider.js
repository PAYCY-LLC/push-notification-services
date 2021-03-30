import CoinGeckoProvider from './coingecko.provider'

class XRatesProvider {
    constructor(logger, appConfig) {
        this.logger = logger
        this.appConfig = appConfig

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

    async getXRates(coinIds, fiatCodes) {
        try {
            const result = await this.defaultProvider.getXRates(coinIds, fiatCodes)

            if (result) {
                return result
            }
        } catch (e) {
            this.logger.error(`Error getting XRates coinCodes: ${coinIds}: ${e}`)
        }

        return {}
    }

    static convertHistoPriceResponse(coinCode, fiatCode, result) {
        if (result) {
            const xrates = []
            result.forEach(element => {
                xrates.push(new XRate(coinCode, coinCode, fiatCode, element.close, element.time))
            })

            return xrates;
        }
        return []
    }

    static convertPriceResponse(result) {
        if (result) {
            const xRates = Object.entries(result).map(
                resultData => {
                    const ents = Object.entries(resultData[1]).map(
                        coinData => Object.entries(coinData[1]).map(
                            fiatData => new XRate(coinData[0], coinData[0], fiatData[0], fiatData[1])
                        )
                    )
                    return [].concat(...ents)
                }
            )

            return [].concat(...xRates);
        }
        return {}
    }

}

export default XRatesProvider;
