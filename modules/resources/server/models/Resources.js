'use strict';
/**
 * Resource Model
 */

module.exports = function (sequelize, DataTypes) {

	var Resource = sequelize.define('Resource',
		{
			id_IRI : DataTypes.STRING,
			name: DataTypes.STRING,
			type : DataTypes.ENUM('video', 'content','url','homepage','glossary','forum')
		},
		{
			associate: function (models) {
				Resource.belongsTo(models.Course,{onDelete: 'cascade'});				
			}
		}
	);

	return Resource;
};


