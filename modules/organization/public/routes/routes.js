(function(){

  'use strict';
  angular
         .module('letApp')
         .config(configState);

  
  configState.$inject = ['$stateProvider','$urlRouterProvider'];


  function configState($stateProvider,$urlRouterProvider){

      // states
      $stateProvider
        .state('main.orgList', {
          url: '/org/all',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/organization/views/list.html',
                controller : 'OrganizationController',
                controllerAs : 'orgCtr'
              }
          }
        }).state('main.orgCreate', {
          url: '/org/create',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/organization/views/create.html',
                controller : 'OrganizationController',
                controllerAs : 'orgCtr'
              }
          }
        });
  }

})();
