(function(){
'use strict';

angular
    .module('letApp')
    .factory('ResourcesService', ResourcesService);

    ResourcesService.$inject = ['$rootScope', '$http', '$location', '$stateParams', '$q', '$timeout','$window', '$localStorage', '$state'];

    function ResourcesService ($rootScope, $http, $location, $stateParams, $q, $timeout,$window, $localStorage, $state) {
            return {
                getAll : function(){
                    return $http.get('/api/resource/all');
                },
                create : function(resource){
                    return $http.post('/api/resource/create', resource);
                },
                delete : function(resourceId){
                    return $http.post('/api/resource/delete', { resourceId : resourceId });
                }
            }
    }
})();
