(function(){
    'use strict';
    angular
        .module('letApp')
        .controller('SignupController',SignupController);

    SignupController.$inject = ['UserService', '$rootScope', 'ngToast', '$state'];
    
    function SignupController(UserService, $rootScope, ngToast, $state){
       var vm = this;

       vm.signup = signup;

       function signup(){
           if(vm.password != vm.rePassword){
               ngToast.create({
                   className : 'danger',
                   content : 'Passwords Mismatch'
               });
               return;
           }

           if(!vm.password || !vm.username || !vm.name){
               ngToast.create({
                   className : 'danger',
                   content : 'Please fill all fields'
               });
               return;
           }

           UserService.signup({name : vm.name, username : vm.username,email: vm.email, password : vm.password });
       }

       $rootScope.$on('signupFailed', function(){
           ngToast.create({
               className : 'danger',
               content : 'Registration Failed'
            });
       });

       $rootScope.$on('loginSuccess', function(){
          console.log("login success");
          $state.go('main.index')
       });
    }
})();
