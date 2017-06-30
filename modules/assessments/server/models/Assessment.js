'use strict';
/**
 * Assessment Model
 */

module.exports = function (sequelize, DataTypes) {

	var Assessment = sequelize.define('Assessment',
		{
			name: DataTypes.STRING,
            id_IRI : DataTypes.STRING
		},
		{
			associate: function (models) {
				Assessment.belongsTo(models.Course,{onDelete: 'cascade'});
				Assessment.hasMany(models.Statement);
				Assessment.hasMany(models.Question);			
			}
		}
	);

	return Assessment;
};