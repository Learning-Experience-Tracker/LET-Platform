(function(){
    'use strict';
    angular
        .module('letApp')
        .controller('DashboardController',DashboardController);

    DashboardController.$inject = ['UserService', 'CourseService', '$rootScope', 'ngToast', '$state'];
    
    function DashboardController(UserService, CourseService, $rootScope, ngToast, $state){
       var vm = this;
       
       vm.init = init;

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
