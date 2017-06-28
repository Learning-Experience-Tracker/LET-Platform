'use strict';
angular.module('letApp', ['ui.router', 'ngStorage', 'ngToast', 'angular-loading-bar','bw.paging']);

(function () {

  angular
    .module('letApp')
    
    .config(['cfpLoadingBarProvider', function (cfpLoadingBarProvider) {
      cfpLoadingBarProvider.includeSpinner = false;
    }])
    
    .run(function ($rootScope, $state, $location, $window, $http, $transitions, UserService, $localStorage) {
    
        $transitions.onSuccess({}, function(trans){
            var $toState = trans.$to();

            if(angular.isDefined($toState.data) && angular.isDefined($toState.data.bodyClasses))
                $('body').removeClass().addClass($toState.data.bodyClasses)
            else
                $('body').removeClass();
        });
        
        $rootScope.$on('$viewContentLoaded',
            function (event, viewConfig) {
            
            });

        
        $rootScope.$on('$stateChangeSuccess', 
            function (event, toState, toParams, fromState, fromParams) {
                $("body").scrollTop(0);
            });

        
        $rootScope.$on('$stateChangeError', 
            function(event, toState, toParams, fromState, fromParams, error){
            
            });      

        $rootScope.$state = $state;

        //config current session: jwt & user
        if($localStorage.token){
            $http.defaults.headers.common.Authorization = 'JWT ' + $localStorage.token;
            UserService.user = $localStorage.user;
            UserService.loggedin = $localStorage.authenticated;
            UserService.name = $localStorage.user.name;
        }
    });
})();
