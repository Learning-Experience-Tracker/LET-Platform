(function () {
    'use strict';

    angular
        .module('letApp')
        .factory('CourseService', CourseService);

    CourseService.$inject = ['$rootScope', '$http', '$location', '$stateParams', '$q', '$timeout', '$window', '$localStorage', '$state'];

    function CourseService($rootScope, $http, $location, $stateParams, $q, $timeout, $window, $localStorage, $state) {
        return {
            getAll: function () {
                return $http.get('/api/course/all');
            },
            create: function (course) {
                return $http.post('/api/course/create', course);
            },
            delete: function (courseId) {
                return $http.post('/api/course/delete', {
                    courseId: courseId
                });
            },
            get: function (courseId) {
                return $http.get('/api/course/' + courseId);
            },
            getAdminDashbaordDate: function (courseId,dateRange) {
                return $http.post('/api/admin/course/' + courseId + "/dashboard",{
                    startDate : dateRange.startDate,
                    endDate : dateRange.endDate
                });
            },
            getStudentCourses: function () {
                return $http.get('/api/student/courses/all');
            },
            getSpecifiedStudentCourses: function () {
                return $http.get('/api/student/courses');
            },
            enrollCourse: function (courseId) {
                return $http.post('/api/course/enroll', {
                    courseId: courseId
                });
            },
            getStudentDashbaordDate: function (courseId) {
                return $http.get('/api/student/course/' + courseId + "/dashboard");
            }
        }
    }
})();