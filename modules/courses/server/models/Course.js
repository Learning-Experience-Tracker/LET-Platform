'use strict';
/**
 * Course Model
 */

module.exports = function (sequelize, DataTypes) {

	var Course = sequelize.define('Course',
		{
			name: DataTypes.STRING,
			startDate : DataTypes.DATE,
			endDate : DataTypes.DATE
		},
		{
			associate: function (models) {
				Course.belongsTo(models.Organization,{onDelete: 'cascade'});
				Course.hasMany(models.Resource,{onDelete: 'cascade'});
				Course.hasMany(models.Assessment, {onDelete : 'cascade' });	
				Course.hasMany(models.CourseStudent, {onDelete : 'cascade' });						
			}
		}
	);

	return Course;
};


