module.exports = function (sequelize, DataTypes) {

	var User = sequelize.define('User',
		{
			name: DataTypes.STRING,
			username: DataTypes.STRING,
			password: DataTypes.STRING
		},
		{
            instanceMethods : {
                authenticate : function(password){
                    return this.password == password;
                }
            },
			associate: function (models) {
				User.hasMany(models.LRS);				
			}
		}
	);

	return User;
};


/*module.exports = function(mongoose){
    let UserSchema = new mongoose.Schema({
        name : String,
        username : String,
        password : String
    });

    UserSchema.methods.authenticate = function(password){
        return password == this.password;
    }

    return {
        model : mongoose.model('User', UserSchema),
        name : 'User'
    };
}*/

