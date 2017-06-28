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
          url: '/assessments/all',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/assessments/views/list.html',
                controller : 'AssessmentsController',
                controllerAs : 'assessmentCtr'
              }
          }
        }).state('main.assessmentCreate', {
          url: '/assessments/create',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/assessments/views/create.html',
                controller : 'AssessmentsController',
                controllerAs : 'assessmentCtr'
              }
          }
        }).state('main.assessmentView', {
          url: '/assessments/:id',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/assessments/views/view.html',
                controller : 'AssessmentsController',
                controllerAs : 'assessmentCtr'
              }
          }
        });
  }

})();
