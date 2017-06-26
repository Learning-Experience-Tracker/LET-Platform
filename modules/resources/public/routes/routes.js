(function(){

  'use strict';
  angular
         .module('letApp')
         .config(configState);

  
  configState.$inject = ['$stateProvider','$urlRouterProvider'];


  function configState($stateProvider,$urlRouterProvider){

      // states
      $stateProvider
        .state('main.resourceList', {
          url: '/resources/all',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/resources/views/list.html',
                controller : 'ResourcesController',
                controllerAs : 'resourceCtr'
              }
          }
        }).state('main.resourceCreate', {
          url: '/resources/create',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/resources/views/create.html',
                controller : 'ResourcesController',
                controllerAs : 'resourceCtr'
              }
          }
        });
  }

})();
