(function(){

  'use strict';
  angular
         .module('letApp')
         .config(configState);

  
  configState.$inject = ['$stateProvider','$urlRouterProvider'];


  function configState($stateProvider,$urlRouterProvider){

      // states
      $stateProvider
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
