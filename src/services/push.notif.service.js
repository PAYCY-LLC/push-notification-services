/* eslint-disable max-len */
// import ApnsProvider from './provider/apns.provider';
import DeviceType from '../models/device.type'
import Utils from '../utils/utils'
import StorageService from './storage.service'
import MessageCacheService from './message.cache.service';

class PushNotificationService {
    constructor(logger, appConfig, dbConfig) {
        this.logger = logger
        this.appConfig = appConfig
        // this.apnsProvider = new ApnsProvider(appConfig, logger);
        this.messageCacheService = new MessageCacheService(logger, appConfig, dbConfig)
    }

    async sendDataToChannel(sendTochannel, data) {
        try {
            const channelName = JSON.stringify(sendTochannel)
            const channel = await StorageService.getSubscribedDevicesByType(channelName, DeviceType.IOS)
            if (channel && channel.devices) {
                this.logger.info(`Saving message to Cache, Channel:${channelName}, ${data}`)
                const redisRes = await this.messageCacheService.pushMessage(channelName, JSON.stringify(data))
                this.logger.info(`Redis Response:${redisRes}`)

                const bundleIds = Object.entries(Utils.groupBy(channel.devices, 'bundleId'))
                bundleIds.forEach(async bundle => {
                    if (bundle[1]) {
                        const tokens = bundle[1].map(d => d.token)
                        // this.logger.info(`Sending message to APN ${bundle[0]} , tokens:${tokens}`)
                        // const res = await this.apnsProvider.sendDataMessage(tokens, data, bundle[0])
                        // this.logger.info(`APNS Response:${JSON.stringify(res)}`)
                    }
                })
            }
        } catch (e) {
            this.logger.info(e)
        }
    }

    async getCachedMessages(token) {
        try {
            const device = await StorageService.getDeviceChannels(token)
            if (device.channels) {
                const cacheds = await Promise.all(device.channels.map(channel => this.messageCacheService.getMessage(channel.name)))
                return cacheds.filter(val => val).map(str => JSON.parse(str))
            }
        } catch (e) {
            this.logger.info(e)
        }

        return {}
    }

    async subscribeToChannel(token, channel, bundleId) {
        try {
            const channelEntity = {
                name: JSON.stringify(channel),
                type: channel.type,
                data: channel.data
            }
            const createdChannel = await StorageService.saveChannel(channelEntity)

            if (createdChannel) {
                const created = StorageService.addDeviceToChannel(token, bundleId, createdChannel)
                return { id: created.id }
            }
        } catch (e) {
            this.logger.info(e)
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
            this.logger.info(e)
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
            this.logger.info(e)
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
            this.logger.info(e)
        }
    }

    async unSubscribeFromAllChannels(token) {
        try {
            StorageService.removeDevice(token)
        } catch (e) {
            this.logger.info(e)
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
            this.logger.info(e)
        }

        return []
    }

    async removeDevice(token) {
        try {
            StorageService.removeDevice(token)
        } catch (e) {
            this.logger.info(e)
        }
    }

    async removeChannel(channelName) {
        try {
            StorageService.removeChannel(channelName)
        } catch (e) {
            this.logger.info(e)
        }
    }
}

export default PushNotificationService;
