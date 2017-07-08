module.exports = function (sequelize, DataTypes) {

	var UserCourses = sequelize.define('UserCourses',
		{			
			enroll_date : DataTypes.DATE,
            enroll_times : DataTypes.INTEGER
		}
	);

	return UserCourses;
};

