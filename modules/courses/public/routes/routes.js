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
          url: '/courses/all',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/courses/views/list.html',
                controller : 'CoursesController',
                controllerAs : 'courseCtr'
              }
          }
        }).state('main.courseCreate', {
          url: '/courses/create',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/courses/views/create.html',
                controller : 'CoursesController',
                controllerAs : 'courseCtr'
              }
          }
        }).state('main.courseView', {
          url: '/courses/:id',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/courses/views/view.html',
                controller : 'CoursesController',
                controllerAs : 'courseCtr'
              }
          }
        });
  }

})();
