(function(){
    'use strict';
    angular
        .module('letApp')
        .controller('DashboardController',DashboardController);

    DashboardController.$inject = ['UserService', '$rootScope', 'ngToast', '$state'];
    
    function DashboardController(UserService, $rootScope, ngToast, $state){
       var vm = this;
       
    }
})();
