'use strict';
/**
 * Assessment Model
 */

module.exports = function (sequelize, DataTypes) {

	var Question = sequelize.define('Question',
		{
			name: DataTypes.STRING,
			id_IRI : {type : DataTypes.STRING , unique : true},
		},
		{
			associate: function (models) {
				Question.belongsTo(models.Assessment,{onDelete: 'cascade'});
				Question.hasMany(models.Statement);			
			}
		}
	);

	return Question;
};