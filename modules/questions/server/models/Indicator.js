'use strict';
/**
 * Indicator Model
 */

module.exports = function (sequelize, DataTypes) {

	var Indicator = sequelize.define('Indicator',
		{
			name: DataTypes.STRING,
            hql : DataTypes.STRING
		},
		{
			associate: function (models) {
				Indicator.belongsTo(models.AnalyticsQuestion);				
			}
		}
	);

	return Indicator;
};


