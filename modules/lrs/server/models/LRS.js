'use strict';
/**
 * LRS Model
 */

module.exports = function (sequelize, DataTypes) {

	var LRS = sequelize.define('LRS',
		{
			name: DataTypes.STRING,
			username: DataTypes.STRING,
			password: DataTypes.STRING
		},
		{
			associate: function (models) {
				LRS.belongsTo(models.User);				
			}
		}
	);

	return LRS;
};



/*module.exports = function(mongoose){
    let LRSSchema = new mongoose.Schema({
        name : String,
        userId : String,
        username : String,
        password : String
    });

    return {
        model : mongoose.model('LRS', LRSSchema),
        name : 'LRS'
    };
}*/

