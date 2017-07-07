(function(){

  'use strict';
  angular
         .module('letApp')
         .config(configState);

  
  configState.$inject = ['$stateProvider','$urlRouterProvider'];


  function configState($stateProvider,$urlRouterProvider){

      // states
      $stateProvider
        .state('main.activitiesList', {
          url: '/admin/activity/all',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/activities/views/list.html',
                controller : 'ActivitiesController',
                controllerAs : 'activitiesCtr'
              }
          }
        }).state('main.activitiesView', {
          url: '/admin/activity/:id',          
          data : { },
          views : {
              '' : {                
                templateUrl : '/activities/views/view.html',
                controller : 'ActivitiesController',
                controllerAs : 'activitiesCtr'
              }
          }
        });
  }

})();
