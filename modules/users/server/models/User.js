module.exports = function (sequelize, DataTypes) {

	var User = sequelize.define('User',
		{
			name: DataTypes.STRING,
			username: DataTypes.STRING,
            email: {type:DataTypes.STRING,unique:true},
			password: DataTypes.STRING
		},
		{
            instanceMethods : {
                authenticate : function(password){
                    return this.password == password;
                }
            },
			associate: function (models) {
				User.hasMany(models.Organization);				
			}
		}
	);

	return User;
};

