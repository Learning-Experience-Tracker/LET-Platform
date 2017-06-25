(function(){
'use strict';

angular
    .module('letApp')
    .factory('LRSService', LRSService);

    LRSService.$inject = ['$rootScope', '$http', '$location', '$stateParams', '$q', '$timeout','$window', '$localStorage', '$state'];

    function LRSService ($rootScope, $http, $location, $stateParams, $q, $timeout,$window, $localStorage, $state) {
            return {
                getAll : function(){
                    return $http.get('/api/lrs/all');
                },
                create : function(lrs){
                    return $http.post('/api/lrs/create', lrs);
                }
            }
    }


})();
