import Sequelize from 'sequelize';

class CoinInfoEntity extends Sequelize.Model {
    static init(sequelize, DataTypes) {
        return super.init(
            {
                id: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    primaryKey: true,
                    field: 'id'
                },
                name: { type: DataTypes.STRING, allowNull: false },
                code: { type: DataTypes.STRING, allowNull: false },
                coinGeckoId: {
                    type: DataTypes.STRING,
                    allowNull: true,
                    field: 'coingecko_id'
                }
            },
            {
                timestamps: false,
                tableName: 'tb_coininfo',
                sequelize
            }
        );
    }
}

export default CoinInfoEntity;
