(function(){
    'use strict';
    angular
        .module('letApp')
        .controller('ActivitiesController', ActivitiesController);

    ActivitiesController.$inject = ['ActivitiesService', '$rootScope', 'ngToast', '$state'];
    
    function ActivitiesController(ActivitiesService, $rootScope, ngToast, $state){
       var vm = this;

       vm.init = init;
       
       function init(){
           ActivitiesService.getAll().then(function(response){
              vm.activitiesList = response.data;
           }).catch(function(err){
               console.log(err);
               ngToast.create({
                   className : 'danger',
                   content : 'Error retrieving list of Courses'
               });
           });
       }
    }
})();
