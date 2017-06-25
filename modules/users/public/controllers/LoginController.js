(function(){
    'use strict';
    angular
        .module('letApp')
        .controller('LoginController',LoginController);

    LoginController.$inject = ['UserService', '$rootScope', 'ngToast', '$state'];
    
    function LoginController(UserService, $rootScope, ngToast, $state){
       var vm = this;

       vm.login = login;


       function login(){
            if(!vm.username || !vm.password)
                return; //empty fields

            UserService.login({username : vm.username, password : vm.password });
       }

       $rootScope.$on('loginSuccess', function(){
          console.log("login success");
          $state.go('main.index')
       });

       $rootScope.$on('loginFailed', function(){
          console.log("login failed");
          ngToast.create({ 
              className : 'danger',
              content : 'Login Failed, Try Again...'
          });
          vm.username = vm.password = '';
       });
       
    }
})();
