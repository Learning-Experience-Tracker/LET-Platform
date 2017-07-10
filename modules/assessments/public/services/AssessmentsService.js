(function(){
'use strict';

angular
    .module('letApp')
    .factory('AssessmentsService', AssessmentsService);

    AssessmentsService.$inject = ['$rootScope', '$http', '$location', '$stateParams', '$q', '$timeout','$window', '$localStorage', '$state'];

    function AssessmentsService ($rootScope, $http, $location, $stateParams, $q, $timeout,$window, $localStorage, $state) {
            return {
                getAll : function(){
                    return $http.get('/api/assessment/all');
                },
                create : function(assessment){
                    return $http.post('/api/assessment/create', assessment);
                },
                delete : function(assessmentId){
                    return $http.post('/api/assessment/delete', { assessmentId : assessmentId });
                },
                get : function(assessmentId){
                    return $http.get('/api/assessment/' + assessmentId);
                },
                getDashboardData : function(assessmentId){
                    return $http.get('/api/assessment/' + assessmentId+'/dashboard');
                },
                getAllAssessmentsQuestions : function(){
                    return $http.get('/api/assessment/questions/all');
                }
            }
    }
})();
