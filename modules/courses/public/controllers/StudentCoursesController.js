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
       vm.viewCourse = viewCourse;

       function init(){
           CourseService.getStudentCourses().then(function(response){
            console.log(response);
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

       function viewCourse(courseId){
          $state.go('main.studentCourseView', { id : courseId});
       }
    }
})();
