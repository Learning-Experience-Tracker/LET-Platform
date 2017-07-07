(function(){
    'use strict';
    angular
        .module('letApp')
        .controller('AdminDashboardController',AdminDashboardController);

    AdminDashboardController.$inject = ['UserService', 'CourseService', '$rootScope', 'ngToast', '$state'];
    
    function AdminDashboardController(UserService, CourseService, $rootScope, ngToast, $state){
       var vm = this;
       
       vm.init = init;

       vm.user = UserService.user;

       function init(){
           CourseService.getAll().then(function(response){
               vm.coursesList = response.data;
           }).catch(function(err){
               console.log(err);
               ngToast.create({
                   className : 'danger',
                   content : 'Error retrieving list of Courses'
               });
           });
       }
    }
})();