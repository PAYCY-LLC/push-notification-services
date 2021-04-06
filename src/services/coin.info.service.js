import StorageService from './storage.service'
import ResourceType from '../models/resource.type'

class CoinInfoService {
    constructor(logger, providerCoins) {
        this.logger = logger
        this.providerCoins = providerCoins
        this.init()
    }

    async init() {
        let updateData = false
        const { version } = this.providerCoins

        try {
            const resourceInfo = await StorageService.getResourceInfo(ResourceType.COININFO)

            if (!resourceInfo) {
                updateData = true
            } else if (resourceInfo.version !== version) updateData = true

            if (updateData) {
                await StorageService.removeAllCoinInfos()
                StorageService.saveResourceInfo({ name: ResourceType.COININFO, version })

                const coinInfos = this.providerCoins.coins.map(
                    coinInfo => ({
                        id: coinInfo.id,
                        name: coinInfo.name,
                        code: coinInfo.code,
                        coinGeckoId: coinInfo.external_id.coingecko })
                )
                StorageService.saveCoinInfos(coinInfos)
            }
        } catch (e) {
            this.logger.error(e)
        }
    }

    getCoinInfos(coinIds) {
        return StorageService.getCoinInfos(coinIds)
    }
}

export default CoinInfoService
