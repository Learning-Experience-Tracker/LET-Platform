(function(){
'use strict';

angular
    .module('letApp')
    .factory('ActivitiesService', ActivitiesService);

    ActivitiesService.$inject = ['$rootScope', '$http', '$location', '$stateParams', '$q', '$timeout','$window', '$localStorage', '$state'];

    function ActivitiesService ($rootScope, $http, $location, $stateParams, $q, $timeout,$window, $localStorage, $state) {
            return {
                getAll : function(){
                    return $http.get('/api/activity/all');
                },
                delete : function(activityId){
                    return $http.post('/api/activity/delete', { activityId : activityId });
                }
            }
    }
})();
