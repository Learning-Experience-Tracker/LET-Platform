'use strict';
/**
 * Question Model
 */

module.exports = function (sequelize, DataTypes) {

	var AnalyticsQuestion = sequelize.define('AnalyticsQuestion',
		{
			name: DataTypes.STRING
		},
		{
			associate: function (models) {
				AnalyticsQuestion.hasMany(models.Indicator, {onDelete: 'cascade'});				
			}
		}
	);

	return AnalyticsQuestion;
};


