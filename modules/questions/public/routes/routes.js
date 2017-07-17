(function(){

  'use strict';
  angular
         .module('letApp')
         .config(configState);

  
  configState.$inject = ['$stateProvider','$urlRouterProvider'];


  function configState($stateProvider,$urlRouterProvider){

      // states
      $stateProvider
        .state('main.questionList', {
          url: '/admin/question/all',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/questions/views/list.html',
                controller : 'QuestionController',
                controllerAs : 'qCtr'
              }
          }
        })
        .state('main.questionDetails', {
          url: '/admin/question/:id/details',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/questions/views/details.html',
                controller : 'QuestionController',
                controllerAs : 'qCtr'
              }
          }
        })
        .state('main.question', {
          url: '/admin/question',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/questions/views/view.html',
                controller : 'QuestionController',
                controllerAs : 'qCtr'
              }
          }
        });
  }

})();
