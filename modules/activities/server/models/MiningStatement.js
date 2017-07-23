module.exports = function (sequelize, DataTypes) {

    var MiningStatement = sequelize.define('MiningStatement', {
        final_result : DataTypes.STRING,
        weekNo : DataTypes.INTEGER,
        homepage: DataTypes.INTEGER,
        content: DataTypes.INTEGER,
        url: DataTypes.INTEGER,
        forum: DataTypes.INTEGER,
        willSubmit : DataTypes.BOOLEAN,
        score : DataTypes.INTEGER
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