(function(){
'use strict';

angular
    .module('letApp')
    .factory('VerbsService', VerbsService);

    VerbsService.$inject = ['$rootScope', '$http', '$location', '$stateParams', '$q', '$timeout','$window', '$localStorage', '$state'];

    function VerbsService ($rootScope, $http, $location, $stateParams, $q, $timeout,$window, $localStorage, $state) {
            return {
                getAll : function(){
                    return $http.get('/api/verbs/all');
                }
            }
    }
})();
