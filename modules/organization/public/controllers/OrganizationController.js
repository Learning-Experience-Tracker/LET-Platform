(function(){
    'use strict';
    angular
        .module('letApp')
        .controller('OrganizationController', OrganizationController);

    OrganizationController.$inject = ['OrganizationService', '$rootScope', 'ngToast', '$state'];
    
    function OrganizationController(OrganizationService, $rootScope, ngToast, $state){
       var vm = this;

       vm.init = init;
       vm.create = create;
       
       function init(){
           OrganizationService.getAll().then(function(response){
              vm.orgList = response.data;
           }).catch(function(err){
               console.log(err);
               ngToast.create({
                   className : 'danger',
                   content : 'Error retrieving list of Organizations'
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

           OrganizationService.create({ name : vm.name }).then(function(){
                $state.go('main.orgList');
                ngToast.create({                    
                    content : 'Created Successfully.'
                }); 
           }).catch(function(err){
               console.log(err);
               ngToast.create({
                   className : 'danger',
                   content : 'Error creating Organization.'
               });
           })
       }
    }
})();
