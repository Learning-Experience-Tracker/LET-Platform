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
				Course.belongsTo(models.Organization);				
			}
		}
	);

	return Course;
};


