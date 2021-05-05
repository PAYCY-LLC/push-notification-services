import ChannelEntity from '../models/channel.entity';
import CoinInfoEntity from '../models/coin.info.entity';
import DeviceEntity from '../models/device.entity';
import ResourceInfoEntity from '../models/resource.info.entity';
import UserEntity from '../models/user.entity';

class StorageService {
    static async saveResourceInfo(newItem) {
        const foundItem = await ResourceInfoEntity.findOne({ where: { name: newItem.name } });
        if (!foundItem) {
            const item = await ResourceInfoEntity.create(newItem)
            return item;
        }
        const item = await ResourceInfoEntity.update(newItem, { where: { name: newItem.name } });
        return item;
    }

    static getResourceInfo(name) {
        return ResourceInfoEntity.findOne({ where: { name } });
    }

    static getCoinInfos(coinIds) {
        return CoinInfoEntity.findAll({
            where: {
                id: coinIds
            }
        });
    }

    static getCoinInfo(coinId) {
        return CoinInfoEntity.findOne({
            where: {
                id: coinId
            }
        });
    }

    static saveCoinInfos(coinInfos) {
        return CoinInfoEntity.bulkCreate(coinInfos, {
            ignoreDuplicates: true
        })
    }

    static removeAllCoinInfos() {
        return CoinInfoEntity.destroy({
            truncate: true
        })
    }

    static getUserByUsername(username) {
        return UserEntity.findOne({
            where: { username },
            order: [['name', 'DESC']]
        });
    }

    static getChannelByName(name) {
        return ChannelEntity.findOne({
            where: { name },
            order: [['name', 'DESC']]
        });
    }

    static getChannels(channelNames) {
        return ChannelEntity.findAll({
            where: {
                name: channelNames
            },
            order: [['name', 'DESC']]
        });
    }

    static getAllChannels() {
        return ChannelEntity.findAll({
            order: [['name', 'DESC']]
        });
    }

    static getSubscribedDevices(channelName) {
        return ChannelEntity.findOne({
            include: [{
                model: DeviceEntity,
                as: 'devices',
                required: false,
                attributes: ['id', 'token', 'bundleId', 'type'],
                through: { attributes: [] }
            }],
            where: { name: channelName }
        })
    }

    static getDeviceChannels(token) {
        return DeviceEntity.findOne({
            include: [{
                model: ChannelEntity,
                as: 'channels',
                required: false,
                attributes: ['id', 'name'],
                through: { attributes: [] }
            }],
            where: { token }
        })
    }

    static saveChannel(newChannel) {
        return ChannelEntity.findOrCreate({
            where: {
                name: newChannel.name
            },
            defaults: {
                name: newChannel.name,
                type: newChannel.type
            }
        }).then(created => created[0]);
    }

    static saveDevice(token, bundleId) {
        return ChannelEntity.findOrCreate({
            where: {
                token
            },
            defaults: {
                token,
                bundleId
            }
        }).then(created => created[0]);
    }

    static saveChannels(channels) {
        return ChannelEntity.bulkCreate(channels, {
            updateOnDuplicate: ['name']
        })
    }

    static addDeviceToChannel(device, bundleId, channel) {
        return DeviceEntity.findOrCreate({
            where: {
                token: device.token
            },
            defaults: {
                token: device.token,
                type: device.type,
                bundleId
            }
        }).then(created => {
            if (created[0]) {
                channel.addDevices(created[0])
            }
        });
    }

    static addDeviceToChannels(device, bundleId, channels) {
        return DeviceEntity.findOrCreate({
            where: {
                token: device.token
            },
            defaults: {
                token: device.token,
                type: device.type,
                bundleId
            }
        }).then(created => {
            if (created[0]) {
                created[0].addChannels(channels)
            }
        });
    }

    static removeDeviceFromChannel(token, channel) {
        return DeviceEntity.findOne({
            where: {
                token
            }
        }).then(found => {
            if (found) {
                found.removeChannel(channel)
            }
        });
    }

    static removeDeviceFromChannels(token, channels) {
        return DeviceEntity.findOne({
            where: {
                token
            }
        }).then(found => {
            if (found) {
                found.removeChannels(channels)
            }
        });
    }

    static removeDevice(token) {
        return DeviceEntity.destroy({
            where: {
                token
            }
        });
    }

    static removeChannel(channelName) {
        return ChannelEntity.destroy({
            where: {
                name: channelName
            }
        });
    }
}

export default StorageService;
