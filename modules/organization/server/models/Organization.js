'use strict';
/**
 * Organization Model
 */

module.exports = function (sequelize, DataTypes) {

	var Organization = sequelize.define('Organization',
		{
			name: DataTypes.STRING
		},
		{
			associate: function (models) {
				Organization.belongsTo(models.User);	
				Organization.hasMany(models.Course);			
			}
		}
	);

	return Organization;
};


