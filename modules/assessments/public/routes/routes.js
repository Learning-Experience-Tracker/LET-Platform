(function(){

  'use strict';
  angular
         .module('letApp')
         .config(configState);

  
  configState.$inject = ['$stateProvider','$urlRouterProvider'];


  function configState($stateProvider,$urlRouterProvider){

      // states
      $stateProvider
        .state('main.assessmentList', {
          url: '/admin/assessments/all',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/assessments/views/list.html',
                controller : 'AssessmentsController',
                controllerAs : 'assessmentCtr'
              }
          }
        }).state('main.assessmentCreate', {
          url: '/admin/assessments/create',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/assessments/views/create.html',
                controller : 'AssessmentsController',
                controllerAs : 'assessmentCtr'
              }
          }
        }).state('main.assessmentView', {
          url: '/admin/assessment/:id',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/assessments/views/view.html',
                controller : 'AssessmentsController',
                controllerAs : 'assessmentCtr'
              }
          }
        }).state('main.assessmentDashboard', {
          url: '/admin/assessment/:id/dashboard',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/assessments/views/dashboard.html',
                controller : 'AssDashboardController',
                controllerAs : 'assessmentCtr'
              }
          }
        });;
  }

})();
