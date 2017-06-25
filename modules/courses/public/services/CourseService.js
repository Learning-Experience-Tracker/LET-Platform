(function(){
'use strict';

angular
    .module('letApp')
    .factory('CourseService', CourseService);

    CourseService.$inject = ['$rootScope', '$http', '$location', '$stateParams', '$q', '$timeout','$window', '$localStorage', '$state'];

    function CourseService ($rootScope, $http, $location, $stateParams, $q, $timeout,$window, $localStorage, $state) {
            return {
                getAll : function(){
                    return $http.get('/api/course/all');
                },
                create : function(course){
                    return $http.post('/api/course/create', course);
                }
            }
    }


})();
