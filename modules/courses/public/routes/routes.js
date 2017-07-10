(function(){

  'use strict';
  angular
         .module('letApp')
         .config(configState);

  
  configState.$inject = ['$stateProvider','$urlRouterProvider'];


  function configState($stateProvider,$urlRouterProvider){

      // states
      $stateProvider
        .state('main.courseList', {
          url: '/admin/courses/all',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/courses/views/admin/list_admin.html',
                controller : 'CoursesController',
                controllerAs : 'courseCtr'
              }
          }
        }).state('main.courseCreate', {
          url: '/admin/courses/create',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/courses/views/admin/create.html',
                controller : 'CoursesController',
                controllerAs : 'courseCtr'
              }
          }
        }).state('main.courseView', {
          url: '/admin/course/:id',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/courses/views/admin/view_admin.html',
                controller : 'CoursesController',
                controllerAs : 'courseCtr'
              }
          }
        }).state('main.studentCourseList', {
          url: '/student/courses/all',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/courses/views/student/list_student.html',
                controller : 'StudentCoursesController',
                controllerAs : 'courseCtr'
              }
          }
        }).state('main.studentCourseDashboard', {
          url: '/student/course/:id/dashboard',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/courses/views/student/dashboard_student.html',
                controller : 'StudentDashboardCtr',
                controllerAs : 'dashboardCtr'
              }
          }
        });
  }

})();
