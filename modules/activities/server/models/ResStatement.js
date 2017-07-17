'use strict';
/**
 * ResStatement Model
 */

module.exports = function (sequelize, DataTypes) {

    var ResStatement = sequelize.define('ResStatement', {
        sum_clicks: DataTypes.INTEGER,
        sum_lunches: DataTypes.INTEGER
    }, {
        timestamps: false,
        associate: function (models) {
            ResStatement.belongsTo(models.User, {
                onDelete: 'cascade'
            });
            ResStatement.belongsTo(models.Resource, {
                onDelete: 'cascade'
            });
            ResStatement.belongsTo(models.Date, {
                onDelete: 'cascade'
            });
            ResStatement.belongsTo(models.Course, {
                onDelete: 'cascade'
            });
        }
    });

    return ResStatement;
};