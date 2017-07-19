module.exports = function (sequelize, DataTypes) {

	var StudentCourses = sequelize.define('StudentCourses',
		{			
			enroll_date : DataTypes.DATE,
			unenroll_date : DataTypes.DATE,
            enroll_times : DataTypes.INTEGER,
			credits : {type:DataTypes.INTEGER , defaultValue:0},
			final_result : DataTypes.ENUM('Distinction','Pass','Fail','Withdrawn')
		}
	);

	return StudentCourses;
};

