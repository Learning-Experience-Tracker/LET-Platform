module.exports = function (sequelize, DataTypes) {

	var User = sequelize.define('User',
		{
			name: DataTypes.STRING,
			username: DataTypes.STRING,
            email: {
				type : DataTypes.STRING,
				unique:true
			},
			password: DataTypes.STRING,
			gender : {
				type : DataTypes.ENUM('Male','Female','NA'),
				defaultValue:'NA'
			},
			region : {
				type : DataTypes.STRING,
				defaultValue : 'NA'
			},
			highest_education : {
				type : DataTypes.STRING,
				defaultValue : 'NA'
			},
			age_band : {
				type : DataTypes.STRING,
				defaultValue : 'NA'
			},
			disability : {
				type : DataTypes.BOOLEAN,
				defaultValue : false
			},
			role : {
				type : DataTypes.ENUM('admin', 'student', 'teacher')
			}
		},
		{
            instanceMethods : {
                authenticate : function(password){
                    return this.password == password;
                }
            },
			associate: function (models) {
				User.hasMany(models.Organization);
				User.belongsToMany(models.Course, {through : 'user_courses'});
			}
		}
	);

	return User;
};

