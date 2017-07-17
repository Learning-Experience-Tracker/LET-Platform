'use strict';
/**
 * ResStatement Model
 */

module.exports = function (sequelize, DataTypes) {

    var CourseStatement = sequelize.define('CourseStatement', {
        num_activities: DataTypes.INTEGER
    }, {
        timestamps: false,
        associate: function (models) {
            CourseStatement.belongsTo(models.Date, {
                onDelete: 'cascade'
            });
            CourseStatement.belongsTo(models.Course, {
                onDelete: 'cascade'
            });
        }
    });

    return CourseStatement;
};