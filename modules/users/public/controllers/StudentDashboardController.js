(function(){
    'use strict';
    angular
        .module('letApp')
        .controller('StudentDashboardController',StudentDashboardController);

    StudentDashboardController.$inject = ['UserService', 'CourseService', '$rootScope', 'ngToast', '$state'];
    
    function StudentDashboardController(UserService, CourseService, $rootScope, ngToast, $state){
       var vm = this;
       
       vm.user = UserService.user;

       vm.init = init;

       function init(){
           CourseService.getSpecifiedStudentCourses().then(function(response){
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
