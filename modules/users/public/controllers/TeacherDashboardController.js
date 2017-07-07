(function(){
    'use strict';
    angular
        .module('letApp')
        .controller('TeacherDashboardController',TeacherDashboardController);

    TeacherDashboardController.$inject = ['UserService', 'CourseService', '$rootScope', 'ngToast', '$state'];
    
    function TeacherDashboardController(UserService, CourseService, $rootScope, ngToast, $state){
       var vm = this;
       
       vm.user = UserService.user;
       
       vm.init = init;

       function init(){
           
       }
    }
})();
