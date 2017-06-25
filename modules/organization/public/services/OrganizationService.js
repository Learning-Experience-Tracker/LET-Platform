(function(){
'use strict';

angular
    .module('letApp')
    .factory('OrganizationService', OrganizationService);

    OrganizationService.$inject = ['$rootScope', '$http', '$location', '$stateParams', '$q', '$timeout','$window', '$localStorage', '$state'];

    function OrganizationService ($rootScope, $http, $location, $stateParams, $q, $timeout,$window, $localStorage, $state) {
            return {
                getAll : function(){
                    return $http.get('/api/org/all');
                },
                create : function(org){
                    return $http.post('/api/org/create', org);
                }
            }
    }


})();
