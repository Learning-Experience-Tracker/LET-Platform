(function(){

  'use strict';
  angular
         .module('letApp')
         .config(configState);

  
  configState.$inject = ['$stateProvider','$urlRouterProvider'];


  function configState($stateProvider,$urlRouterProvider){

      // states
      $stateProvider
        .state('main.lrsList', {
          url: '/lrs/all',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/lrs/views/list.html',
                controller : 'LRSController',
                controllerAs : 'lrsCtr'
              }
          }
        }).state('main.lrsCreate', {
          url: '/lrs/create',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/lrs/views/create.html',
                controller : 'LRSController',
                controllerAs : 'lrsCtr'
              }
          }
        });
  }

})();
