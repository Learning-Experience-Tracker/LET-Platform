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
          url: '/admin/resources/all',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/resources/views/list.html',
                controller : 'ResourcesController',
                controllerAs : 'resourceCtr'
              }
          }
        }).state('main.resourceCreate', {
          url: '/admin/resources/create',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/resources/views/create.html',
                controller : 'ResourcesController',
                controllerAs : 'resourceCtr'
              }
          }
        }).state('main.resourceDashboard', {
          url: '/admin/resources/:id/dashboard',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/resources/views/dashboard.html',
                controller : 'ResDashboardController',
                controllerAs : 'resourceCtr'
              }
          }
        });;
  }

})();
