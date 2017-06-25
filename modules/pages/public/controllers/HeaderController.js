(function(){
    'use strict';
    angular
        .module('letApp')
        .controller('HeaderController',HeaderController);

    HeaderController.$inject = ['UserService', '$rootScope', '$state'];
    
    function HeaderController(UserService, $rootScope, $state){
       var vm = this;
       vm.logout = logout;

       if(UserService.loggedin)
           vm.user = UserService.user;

       function logout() {
           UserService.logout();
       }

       $rootScope.$on('logoutSuccess', function(){
         console.log("logged out");
         $state.reload();
       });
    }
})();
