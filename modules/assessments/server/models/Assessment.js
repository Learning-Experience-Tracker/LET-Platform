'use strict';
/**
 * Assessment Model
 */

module.exports = function (sequelize, DataTypes) {

	var Assessment = sequelize.define('Assessment',
		{
			name: DataTypes.STRING,
            id_IRI : DataTypes.STRING,
			type : DataTypes.ENUM('TMA','CMA','Exam'),
			deadline : DataTypes.DATE,
			weight : DateTypes.INT
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