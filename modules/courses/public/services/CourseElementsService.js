(function () {
    'use strict';

    angular
        .module('letApp')
        .factory('CourseElementsService', CourseElementsService);

    CourseElementsService.$inject = ['$rootScope', '$http', '$location', '$stateParams', '$q', '$timeout', '$window', '$localStorage', '$state'];

    function CourseElementsService($rootScope, $http, $location, $stateParams, $q, $timeout, $window, $localStorage, $state) {
        return {
            getCourseResources: function (courseId,page,pageSize) {
                return $http.get('/api/admin/course/' + courseId + "/resources/"+page+"/"+pageSize);
            },
            getCourseAssessments: function (courseId,page,pageSize) {
                return $http.get('/api/admin/course/' + courseId + "/assessments/"+page+"/"+pageSize);
            },
            getCourseActivities: function (courseId,page,pageSize) {
                return $http.get('/api/admin/course/' + courseId + "/activities/"+page+"/"+pageSize);
            },
            getCourseStudents :  function (courseId,page,pageSize) {
                return $http.get('/api/admin/course/' + courseId + "/students/"+page+"/"+pageSize);
            }
        }
    }
})();