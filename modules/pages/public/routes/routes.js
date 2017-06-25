(function(){

  'use strict';
  angular
         .module('letApp')
         .config(configState)
         .config(configLocation);

  
  configState.$inject = ['$stateProvider','$urlRouterProvider'];
  configLocation.$inject = ['$locationProvider'];


  function configState($stateProvider,$urlRouterProvider){

      //For unmatched routes:
      $urlRouterProvider.otherwise('/');

      // states
      $stateProvider
        .state('main',{
          abstract : true,
          views : {
            'header' : {
              templateUrl : '/pages/views/header.html',
              controller : 'HeaderController',
              controllerAs : 'headerCtr'
            },
            'content' : {
              template : '<section ui-view></section>'
            },
            'footer' : {
              templateUrl : '/pages/views/footer.html',
              controller : 'FooterController',
              controllerAs : 'footerCtr'
            }
          }
        })
        .state('main.index', {
          url: '/',
          templateUrl : '/pages/views/main.html',
          controller : 'MainController',
          controllerAs : 'mainCtr'
        });
  }

  function configLocation($locationProvider){
    $locationProvider.html5Mode({
      enabled:true,
      requireBase:false
    });
  }

})();
