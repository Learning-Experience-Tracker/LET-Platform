module.exports = function (sequelize, DataTypes) {

	var UserCourses = sequelize.define('UserCourses',
		{			
			enroll_date : DataTypes.DATE,
			unenroll_date : DataTypes.DATE,
            enroll_times : DataTypes.INTEGER,
			credits : {type:DataTypes.INTEGER , defaultValue:0},
			final_result : DataTypes.ENUM('Distinction','Pass','Fail','Withdrawn')
		}
	);

	return UserCourses;
};

