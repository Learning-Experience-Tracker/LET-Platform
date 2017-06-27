'use strict';
/**
 * Verb Model
 */

module.exports = function (sequelize, DataTypes) {

	var Verb = sequelize.define('Verb',
		{
			name: DataTypes.STRING,
            id_IRI : {type:DataTypes.STRING , unique:true}
		}
	);

	return Verb;
};