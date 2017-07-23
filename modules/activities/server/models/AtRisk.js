'use strict';
/**
 * ResStatement Model
 */

module.exports = function (sequelize, DataTypes) {

    var AtRisk = sequelize.define('AtRisk', {
        studentName: DataTypes.STRING,
        assessments: DataTypes.JSON,
        nextAssessmentSubmit: DataTypes.BOOLEAN,
        nextAssessmentScore: DataTypes.INTEGER,
        atRisk: DataTypes.BOOLEAN
    }, {
        timestamps: false
    });

    return AtRisk;
};