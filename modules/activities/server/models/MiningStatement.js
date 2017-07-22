module.exports = function (sequelize, DataTypes) {

    var MiningStatement = sequelize.define('MiningStatement', {
        homepage: DataTypes.INTEGER,
        content: DataTypes.INTEGER,
        url: DataTypes.INTEGER,
        forum: DataTypes.INTEGER
    }, {
        timestamps: false,
        associate: function (models) {
            MiningStatement.belongsTo(models.User, {
                onDelete: 'cascade'
            });
            MiningStatement.belongsTo(models.Date, {
                onDelete: 'cascade'
            });
            MiningStatement.belongsTo(models.Course, {
                onDelete: 'cascade'
            });
        }
    });

    return MiningStatement;
};