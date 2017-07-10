(function(){
'use strict';

angular
    .module('letApp')
    .factory('QuestionsService', QuestionsService);

    QuestionsService.$inject = ['$rootScope', '$http', '$location', '$stateParams', '$q', '$timeout','$window', '$localStorage', '$state'];

    function QuestionsService ($rootScope, $http, $location, $stateParams, $q, $timeout,$window, $localStorage, $state) {
            return {
                execute : function(query){
                    return $http.post('/api/question/execute', query);
                }
            }
    }
})();
