(function(){
    'use strict';
    angular
        .module('letApp')
        .controller('ActivitiesController', ActivitiesController);

    ActivitiesController.$inject = ['ActivitiesService', '$rootScope', 'ngToast', '$state' , '$log'];
    
    function ActivitiesController(ActivitiesService, $rootScope, ngToast, $state , $log){
       var vm = this;

       vm.init = init;
       vm.getPage = getPage;
       vm.activitiesCount = 100;
       vm.currentPage = 0;
       vm.pageSize = 10;

       
       function init(){

           ActivitiesService.getCount().then(function(response){
               vm.activitiesCount = response.data;
           }).catch(function(err){
               console.log(err);
               ngToast.create({
                   className : 'danger',
                   content : 'Error retrieving list of Courses'
               });
           });

           getPage(0);
       }

       function getPage(text, page, pageSize, total ){
           (!page) ? page = 0 : page--;          
           
           var offset = (page) * vm.pageSize;

            ActivitiesService.page({limit : vm.pageSize, offset: offset}).then(function(response){
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
