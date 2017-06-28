'use strict';
/**
 * Course Model
 */

module.exports = function (sequelize, DataTypes) {

	var Course = sequelize.define('Course',
		{
			name: DataTypes.STRING
		},
		{
			associate: function (models) {
				Course.belongsTo(models.Organization,{onDelete: 'cascade'});
				Course.hasMany(models.Resource,{onDelete: 'cascade'});
				Course.hasMany(models.Assessment, {onDelete : 'cascade' });				
			}
		}
	);

	return Course;
};


