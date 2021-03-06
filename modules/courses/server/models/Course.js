'use strict';
/**
 * Course Model
 */

module.exports = function (sequelize, DataTypes) {

	var Course = sequelize.define('Course', {
		name: DataTypes.STRING,
		id_IRI: {
			type: DataTypes.STRING,
			unique: true
		},
		startDate: {
			type: DataTypes.DATE,
			defaultValue: new Date()
		},
		endDate: DataTypes.DATE
	}, {
		associate: function (models) {
			Course.belongsTo(models.Organization, {
				onDelete: 'cascade'
			});
			Course.hasMany(models.Resource, {
				onDelete: 'cascade'
			});
			Course.hasMany(models.Assessment, {
				onDelete: 'cascade'
			});
			Course.hasMany(models.Statement, {
				onDelete: 'cascade'
			});
			Course.belongsToMany(models.User, {
				as: 'students',
				through: models.StudentCourses
			});
		}
	});

	return Course;
};