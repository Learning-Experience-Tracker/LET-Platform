(function(){
    'use strict';
    angular
        .module('letApp')
        .controller('StudentCoursesController', StudentCoursesController);

    StudentCoursesController.$inject = ['CourseService', 'OrganizationService', '$rootScope', 'ngToast', '$state', '$stateParams'];
    
    function StudentCoursesController(CourseService, OrganizationService, $rootScope, ngToast, $state, $stateParams){
       var vm = this;

       vm.init = init;
       vm.enroll = enroll;
       vm.viewDashboard = viewDashboard;

       function init(){
           CourseService.getSpecifiedStudentCourses().then(function(response){
                vm.courseList = response.data;
           }).catch(function(error){
            console.log(error);
           });
       }

       function enroll(courseId){
           CourseService.enrollCourse(courseId).then(function(response){
            console.log(response);
            vm.init();
           }).catch(function(error){
            console.log(error);
           });
       }

       function viewDashboard(courseId){
          $state.go('main.studentCourseDashboard', { id : courseId});
       }
    }
})();
