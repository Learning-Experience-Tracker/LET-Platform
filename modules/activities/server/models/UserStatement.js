'use strict';
/**
 * UserStatement Model
 */

module.exports = function (sequelize, DataTypes) {

    var UserStatement = sequelize.define('UserStatement', {
        sum_activities: DataTypes.INTEGER
    }, {
        timestamps: false,
        associate: function (models) {
            UserStatement.belongsTo(models.User, {
                onDelete: 'cascade'
            });
            UserStatement.belongsTo(models.Date, {
                onDelete: 'cascade'
            });
            UserStatement.belongsTo(models.Course, {
                onDelete: 'cascade'
            });
        }
    });

    return UserStatement;
};