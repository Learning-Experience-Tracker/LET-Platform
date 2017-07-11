(function () {
    'use strict';

    angular
        .module('letApp')
        .factory('CourseDashboardService', CourseDashboardService);

    CourseDashboardService.$inject = ['$rootScope', '$http', '$location', '$stateParams', '$q', '$timeout', '$window', '$localStorage', '$state'];

    function CourseDashboardService($rootScope, $http, $location, $stateParams, $q, $timeout, $window, $localStorage, $state) {
        return {
            get: function (courseId) {
                return $http.get('/api/course/' + courseId);
            },
            getAdminDashbaordDate: function (courseId,dateRange) {
                return $http.post('/api/admin/course/' + courseId + "/dashboard",{
                    startDate : dateRange.startDate,
                    endDate : dateRange.endDate
                });
            },
            getStudentDashbaordDate: function (courseId) {
                return $http.get('/api/student/course/' + courseId + "/dashboard");
            }
        }
    }
})();