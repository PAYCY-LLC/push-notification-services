import Sequelize from 'sequelize';
import DeviceEntity from './device.entity';
import ChannelEntity from './channel.entity';
import UserEntity from './user.entity';
import dbConfig from '../../config/db.config.json';
import ResourceInfoEntity from './resource.info.entity';
import CoinInfoEntity from './coin.info.entity';

const config = dbConfig[process.env.NODE_ENV || 'development'];
const sequelize = new Sequelize(
    config.postgres.database,
    config.postgres.username,
    config.postgres.password,
    config.postgres
);

const models = {
    User: UserEntity.init(sequelize, Sequelize),
    Channel: ChannelEntity.init(sequelize, Sequelize),
    Device: DeviceEntity.init(sequelize, Sequelize),
    ResourceInfo: ResourceInfoEntity.init(sequelize, Sequelize),
    CoinInfo: CoinInfoEntity.init(sequelize, Sequelize)
};

// This creates relationships in the ORM
Object.values(models)
    .filter(model => typeof model.associate === 'function')
    .forEach(model => model.associate(models));

const db = {
    ...models,
    sequelize
};

export default db
