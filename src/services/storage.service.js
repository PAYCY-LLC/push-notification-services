import ChannelEntity from '../models/channel.entity';
import DeviceEntity from '../models/device.entity';
import UserEntity from '../models/user.entity';

class StorageService {
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

    static getSubscribedDevices(channelName) {
        return ChannelEntity.findOne({
            include: [{
                model: DeviceEntity,
                as: 'devices',
                required: false,
                attributes: ['id', 'token'],
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

    static getSubscribedDevicesByType(channelName, deviceType) {
        return ChannelEntity.findOne({
            include: [{
                model: DeviceEntity,
                as: 'devices',
                required: false,
                attributes: ['id', 'token', 'bundleId', 'type'],
                through: { attributes: [] },
                where: { type: deviceType }
            }],
            where: { name: channelName }
        })
    }

    static saveChannel(newChannel) {
        return ChannelEntity.findOrCreate({
            where: {
                name: newChannel.name
            },
            defaults: {
                name: newChannel.name
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

    static addDeviceToChannel(token, bundleId, channel) {
        return DeviceEntity.findOrCreate({
            where: {
                token
            },
            defaults: {
                token,
                bundleId
            }
        }).then(created => {
            if (created[0]) {
                channel.addDevices(created[0])
            }
        });
    }

    static addDeviceToChannels(token, bundleId, channels) {
        return DeviceEntity.findOrCreate({
            where: {
                token
            },
            defaults: {
                token,
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
