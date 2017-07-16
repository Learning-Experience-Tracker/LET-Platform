'use strict';
/**
 * Date Model
 */

module.exports = function (sequelize, DataTypes) {

	var Date = sequelize.define('Date',
		{
			date: DataTypes.DATE,
            timestamp : DataTypes.BIGINT(11),
            day_of_month :  DataTypes.INTEGER,
            week_of_year : DataTypes.INTEGER,
            day_of_week : DataTypes.STRING,
            month : DataTypes.INTEGER,
            year : DataTypes.INTEGER   
		},{
            timestamps: false
        }
	);

	return Date;
};