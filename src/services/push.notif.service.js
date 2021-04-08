/* eslint-disable max-len */
// import ApnsProvider from './provider/apns.provider';
import DeviceType from '../models/device.type'
import Utils from '../utils/utils'
import StorageService from './storage.service'
import MessageCacheService from './message.cache.service';
import CoinInfoService from './coin.info.service'
import MonitoringService from './monitoring/monitoring.service'
import ChannelType from '../models/channel.type'

class PushNotificationService {
    constructor(logger, appConfig, dbConfig, providerCoins) {
        this.logger = logger
        this.appConfig = appConfig
        this.providerCoins = providerCoins
        this.baseCurrency = 'USD'
        // this.apnsProvider = new ApnsProvider(appConfig, logger);
        this.messageCacheService = new MessageCacheService(logger, appConfig, dbConfig)
        this.coinInfoService = new CoinInfoService(logger, providerCoins)
        this.monitoringService = new MonitoringService(logger, this.baseCurrency, this, this.coinInfoService)
    }

    async sendDataToChannel(sendTochannel, data) {
        try {
            this.logger.info(`Sending data to:${JSON.stringify(sendTochannel)}, ${JSON.stringify(data)}`)
            const channelName = JSON.stringify(sendTochannel)
            const channel = await StorageService.getSubscribedDevicesByType(channelName, DeviceType.IOS)
            if (channel) {
                if (channel.devices) {
                    this.logger.info(`Saving message to Cache, Channel:${channelName}, ${data}`)
                    const messageData = { timestamp: Math.floor(Date.now() / 1000), message: data }
                    const redisRes = await this.messageCacheService.pushMessage(channelName, JSON.stringify(messageData))
                    this.logger.info(`Redis Response:${redisRes}`)

                    const bundleIds = Object.entries(Utils.groupBy(channel.devices, 'bundleId'))
                    bundleIds.forEach(async bundle => {
                        if (bundle[1]) {
                        // const tokens = bundle[1].map(d => d.token)
                        // this.logger.info(`Sending message to APN ${bundle[0]} , tokens:${tokens}`)
                        // const res = await this.apnsProvider.sendDataMessage(tokens, data, bundle[0])
                        // this.logger.info(`APNS Response:${JSON.stringify(res)}`)
                        }
                    })

                    return 'Ok'
                }
            }
        } catch (e) {
            this.logger.error(`Error sending data: ${e}`)
        }

        return 'Not send'
    }

    async getCachedMessages(token) {
        try {
            const device = await StorageService.getDeviceChannels(token)
            if (device) {
                if (device.channels) {
                    const cacheds = await Promise.all(device.channels.map(channel => this.messageCacheService.getMessage(channel.name)))
                    return {
                        status: 200,
                        server_time: Math.floor(Date.now() / 1000),
                        messages: cacheds.filter(val => val).map(str => JSON.parse(str))
                    }
                }
            }
        } catch (e) {
            this.logger.error(`Error getting messages: ${e}`)
        }

        return { status: 204 }
    }

    async subscribeToChannel(token, channel, bundleId) {
        try {
            this.logger.info(`Subscribing token: ${token}, with channel:${JSON.stringify(channel)}`)

            const channelEntity = {
                name: JSON.stringify(channel),
                type: channel.type,
                data: channel.data
            }
            const createdChannel = await StorageService.saveChannel(channelEntity)

            if (createdChannel) {
                const device = { token, type: token.length <= 34 ? DeviceType.ANDROID : DeviceType.IOS }
                StorageService.addDeviceToChannel(device, bundleId, createdChannel)

                if (channel.type === ChannelType.CRYPTO_PRICE || channel.type === ChannelType.TRENDS) {
                    this.monitoringService.updateActiveCoins(channel.type, [channel.data.coin_id])
                }

                return { id: createdChannel.id }
            }
        } catch (e) {
            this.logger.error(`Error subscribing: ${e}`)
        }

        return {}
    }

    async subscribeToChannels(token, channels, bundleId) {
        try {
            const channelEntities = channels.map(channel => ({
                name: JSON.stringify(channel),
                type: channel.type,
                data: channel.data
            }))
            const savedChannels = await StorageService.saveChannels(channelEntities)

            StorageService.addDeviceToChannels(token, bundleId, savedChannels)
        } catch (e) {
            this.logger.error(e)
        }
    }

    async unSubscribeFromChannel(token, channel) {
        try {
            const device = await StorageService.getDeviceChannels(token)

            if (device && device.channels) {
                const intersection = device.channels.filter(
                    deviceChannel => deviceChannel.name === JSON.stringify(channel)
                );

                if (intersection) {
                    if (device.channels.length === 1) {
                        StorageService.removeDevice(token)
                    } else {
                        StorageService.removeDeviceFromChannel(token, intersection[0])
                    }
                }
            }
        } catch (e) {
            this.logger.error(e)
        }
    }

    async unSubscribeFromChannels(token, channels) {
        try {
            const device = await StorageService.getDeviceChannels(token)

            if (device && device.channels) {
                const intersection = device.channels.filter(
                    deviceChannel => channels.some(sChannel => deviceChannel.name === JSON.stringify(sChannel))
                );

                if (intersection.length === device.channels.length) {
                    StorageService.removeDevice(token)
                } else {
                    StorageService.removeDeviceFromChannels(token, intersection)
                }
            }
        } catch (e) {
            this.logger.error(e)
        }
    }

    async unSubscribeFromAllChannels(token) {
        try {
            StorageService.removeDevice(token)
        } catch (e) {
            this.logger.error(e)
        }
    }

    async getChannels(token) {
        try {
            const device = await StorageService.getDeviceChannels(token)
            if (device.channels) {
                const channelNames = device.channels.map(channel => JSON.parse(channel.name))
                return channelNames
            }
        } catch (e) {
            this.logger.error(e)
        }

        return []
    }

    async removeDevice(token) {
        try {
            StorageService.removeDevice(token)
        } catch (e) {
            this.logger.error(e)
        }
    }

    async removeChannel(channelName) {
        try {
            StorageService.removeChannel(channelName)
        } catch (e) {
            this.logger.error(e)
        }
    }
}

export default PushNotificationService;
