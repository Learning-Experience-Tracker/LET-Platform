'use strict';
/**
 * Resource Model
 */

module.exports = function (sequelize, DataTypes) {

	var Resource = sequelize.define('Resource',
		{
			id_IRI : DataTypes.STRING,
			type_IRI : DataTypes.STRING,
			name: DataTypes.STRING,
			description :  DataTypes.STRING,
		},
		{
			associate: function (models) {
				Resource.belongsTo(models.Course);				
			}
		}
	);

	return Resource;
};


