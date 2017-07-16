'use strict';
/**
 * Resource Model
 */

module.exports = function (sequelize, DataTypes) {

	var Resource = sequelize.define('Resource',
		{
			id_IRI : {type : DataTypes.STRING , unique : true},
			name: DataTypes.STRING,
			type : DataTypes.ENUM('video', 'content','quiz','homepage','glossary','forum','url','wiki')
		},
		{
			associate: function (models) {
				Resource.belongsTo(models.Course,{onDelete: 'cascade'});				
			}
		}
	);

	return Resource;
};


