'use strict';
/**
 * Statement Model
 */

module.exports = function (sequelize, DataTypes) {

	var Statement = sequelize.define('Statement',{
            timestamp : {
                type : DataTypes.DATE
            },
            stored : {
                type : DataTypes.DATE
            },
            platform : {
                type : DataTypes.STRING                
            },
            has_result :{
                type : DataTypes.BOOLEAN
            }, // result object
                success :{
                    type : DataTypes.BOOLEAN
                },
                scaled:{
                    type : DataTypes.DECIMAL
                },
                raw :{
                    type : DataTypes.DECIMAL
                },
                min :{
                    type : DataTypes.DECIMAL
                },
                max :{
                    type : DataTypes.DECIMAL
                }
        },
        {
			associate: function (models) {
				Statement.belongsTo(models.Verb,{onDelete: 'cascade'});
				Statement.belongsTo(models.User,{onDelete: 'cascade'});			
				Statement.belongsTo(models.Assessment,{onDelete: 'cascade'});
				Statement.belongsTo(models.Resource,{onDelete: 'cascade'});  
                Statement.belongsTo(models.Question,{onDelete: 'cascade'});     			
			}
		}
	);
	return Statement;
};