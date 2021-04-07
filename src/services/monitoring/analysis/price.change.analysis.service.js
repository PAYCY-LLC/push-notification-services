/* eslint-disable max-len */
import cron from 'node-cron';
import StorageService from '../../storage.service'

const CRON_DAILY_12AM = '0 5 0 * * *' // every day at 12:05 AM
const CRON_EVERY_20M = '0 */20 * * * *' // every 20 minutes

const XRATES_CHANGE_PERCENTAGES = [2, 5, 10]
const CHANGE_24H = 'change_24hour'
const EMOJI_ARROW_UP = '\u2B06'
const EMOJI_ARROW_DOWN = '\u2B07'

class PriceChangeAnalysisService {
    constructor(logger, baseCurrency, messagingService, dataCollectorService, storageService) {
        this.logger = logger;
        this.baseCurrency = baseCurrency

        this.messagingService = messagingService
        this.dataCollectorService = dataCollectorService
        this.storageService = storageService
        this.sentNotifications = []
        this.activeCoinIds = []
        this.dailyOpeningXRates = []
    }

    start() {
        cron.schedule(CRON_DAILY_12AM, () => {
            this.sentNotifications = []
            this.getDailyOpeningXRates()
        });

        cron.schedule(CRON_EVERY_20M, () => {
            this.checkXRateChanges(CHANGE_24H)
        });

        this.initMonitoringService()
    }

    async initMonitoringService() {
        const channels = await StorageService.getAllChannels()

        if (channels) {
            const priceChannelsCoinIds = channels.map(channel => JSON.parse(channel.name).data.coin_id)
            this.updateActiveCoins(priceChannelsCoinIds)
        }
    }

    async updateActiveCoins(newCoinIds) {
        if (!this.activeCoinIds.includes(newCoinIds)) {
            const latestXRates = await this.dataCollectorService.getLatestXRates(
                newCoinIds,
                this.baseCurrency
            )

            if (Object.keys(latestXRates).length > 0) {
                this.dailyOpeningXRates.push(...latestXRates)
                this.activeCoinIds.push(...newCoinIds)
            }
        }
    }

    async getDailyOpeningXRates() {
        this.dailyOpeningXRates = []
        this.dailyOpeningXRates = await this.dataCollectorService.getDailyOpeningXRates(
            this.activeCoinIds,
            this.baseCurrency
        )
        if (this.dailyOpeningXRates) {
            this.logger.info('[PriceChange] Daily opening xrates" data collected')
        }
    }

    async checkXRateChanges(period) {
        const latestXRates = await this.dataCollectorService.getLatestXRates(
            this.activeCoinIds,
            this.baseCurrency
        )

        if (this.dailyOpeningXRates && latestXRates) {
            this.logger.info(`[PriceChange] Checking ${period} price changes.`)

            Object.values(this.dailyOpeningXRates).forEach(dailyOpeningXRate => {
                const latestXRate = latestXRates.find(xrate => xrate.coinId === dailyOpeningXRate.coinId)
                if (latestXRate) {
                    const changePercentage = PriceChangeAnalysisService.calculateXRateChangePercentage(
                        dailyOpeningXRate.rate,
                        latestXRate.rate
                    )

                    Object.values(XRATES_CHANGE_PERCENTAGES).forEach(percentage => {
                        if (percentage <= Math.abs(changePercentage)) {
                            this.logger.info(`[PriceChange] Coin: ${dailyOpeningXRate.coinId}, Opening rate:${dailyOpeningXRate.rate}, Latest Rate:${latestXRate.rate}`)

                            if (!this.isNotificationAlreadySent(dailyOpeningXRate.coinId, percentage)) {
                                this.sendXRateChangeDataMessage(
                                    dailyOpeningXRate,
                                    period,
                                    percentage,
                                    changePercentage
                                )
                            }
                        }
                    });
                }
            });
        }
    }

    static calculateXRateChangePercentage(rateSource, rateTarget) {
        const diff = rateTarget - rateSource
        const changePercentage = (diff * 100) / rateSource

        return Math.round(changePercentage * 10) / 10
    }

    isNotificationAlreadySent(coinId, changePercentage) {
        const notified = this.sentNotifications.find(
            notifData => coinId === notifData.coinId && notifData.changePercentage === changePercentage
        )

        if (notified) {
            this.logger.info(`[PriceChange] Coin:${coinId}, for change%:${changePercentage} already notified`)
            return true
        }

        this.sentNotifications.push({ coinId, changePercentage })

        return false
    }

    async sendXRateChangeDataMessage(xrateData, change, alertPercentage, changePercentage) {
        const channel = {
            type: 'PRICE',
            data: {
                coin_id: xrateData.coinId,
                period: '24h',
                percent: alertPercentage
            }
        }

        // const channelName = `${xrateData.coinId}_24hour_${alertPercentage}percent`

        const emojiCode = changePercentage > 0 ? EMOJI_ARROW_UP : EMOJI_ARROW_DOWN
        const changeDirection = changePercentage > 0 ? 'up' : 'down'
        const args = [xrateData.coinCode, changePercentage.toString(), emojiCode]
        const data = {
            'title-loc-key': xrateData.coinName,
            'loc-key': `${change}_${changeDirection}`,
            'loc-args': args
        };

        this.logger.info(`[PriceChange] Send Notif: Coin:${xrateData.coinCode}, Alert %:${alertPercentage}, Change %:${changePercentage}`)
        const status = await this.messagingService.sendDataToChannel(channel, data)
        this.logger.info(`[PriceChange] Response status: ${status}`)

        return 0
    }
}

export default PriceChangeAnalysisService
