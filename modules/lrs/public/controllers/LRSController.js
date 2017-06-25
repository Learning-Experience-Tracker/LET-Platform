(function(){
    'use strict';
    angular
        .module('letApp')
        .controller('LRSController', LRSController);

    LRSController.$inject = ['LRSService', '$rootScope', 'ngToast', '$state'];
    
    function LRSController(LRSService, $rootScope, ngToast, $state){
       var vm = this;

       vm.init = init;
       vm.create = create;
       
       function init(){
           LRSService.getAll().then(function(response){
              vm.lrsList = response.data;
           }).catch(function(err){
               console.log(err);
               ngToast.create({
                   className : 'danger',
                   content : 'Error retrieving list of LRSs'
               });
           });
       }

       function create(){
           if(!vm.name){
               ngToast.create({
                   className : 'danger',
                   content : 'Please fill all required fields.'
               });
               return;
           }

           LRSService.create({ name : vm.name }).then(function(){
                $state.go('main.lrsList');
                ngToast.create({                    
                    content : 'Created Successfully.'
                }); 
           }).catch(function(err){
               console.log(err);
               ngToast.create({
                   className : 'danger',
                   content : 'Error creating LRS.'
               });
           })
       }
    }
})();
