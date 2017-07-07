'use strict';
/**
 * StudentCourse Model
 */

module.exports = function (sequelize, DataTypes) {

	var CourseStudent = sequelize.define('CourseStudent',
		{
            un_reg_date : DataTypes.DATE,
            reg_date : {type:DataTypes.DATE,defaultValue:new Date()},
            credits : {type:DataTypes.INTEGER , defaultValue:0},
            num_attempts : {type:DataTypes.INTEGER , defaultValue:0},
			final_result : DataTypes.ENUM('Distinction','Pass','Fail','Withdrawn')
		},
		{
			associate: function (models) {
                CourseStudent.belongsTo(models.Course,{onDelete: 'cascade'});
                CourseStudent.belongsTo(models.User,{onDelete: 'cascade'});			
			}
		}
	);

	return CourseStudent;
};
