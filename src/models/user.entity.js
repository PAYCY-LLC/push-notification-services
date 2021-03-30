import Sequelize from 'sequelize';

class UserEntity extends Sequelize.Model {
    static init(sequelize, DataTypes) {
        return super.init(
            {
                id: {
                    type: DataTypes.INTEGER,
                    allowNull: false,
                    autoIncrement: true,
                    primaryKey: true
                },
                username: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true
                },
                password: { type: DataTypes.STRING, unique: false },
                created: {
                    type: DataTypes.DATE,
                    defaultValue: Sequelize.literal('NOW()')
                }
            },
            {
                timestamps: false,
                tableName: 'tb_user',
                sequelize
            }
        );
    }
}

export default UserEntity;
