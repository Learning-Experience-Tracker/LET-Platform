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
				Organization.belongsTo(models.User,{onDelete: 'cascade'});	
				Organization.hasMany(models.Course,{onDelete: 'cascade'});			
			}
		}
	);

	return Organization;
};


