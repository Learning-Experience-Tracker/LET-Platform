(function(){
    'use strict';
    angular
        .module('letApp')
        .controller('ResourcesController', ResourcesController);

    ResourcesController.$inject = ['ResourcesService', 'CourseService', '$rootScope', 'ngToast', '$state'];
    
    function ResourcesController(ResourcesService, CourseService, $rootScope, ngToast, $state){
       var vm = this;
        
       vm.init = init;
       vm.initCreate = initCreate;
       vm.create = create;
       vm.delete = _delete;
       
       function init(){
           ResourcesService.getAll().then(function(response){
              vm.resourceList = response.data;
           }).catch(function(err){
               console.log(err);
               ngToast.create({
                   className : 'danger',
                   content : 'Error retrieving list of Courses'
               });
           });
       }

       function initCreate(){
            CourseService.getAll().then(function(response){
              vm.courseList = response.data;
           }).catch(function(err){
               console.log(err);
               ngToast.create({
                   className : 'danger',
                   content : 'Error retrieving list of Organizations'
               });
           });
       }

       function create(){

           if(!vm.name || !vm.description || !vm.id_IRI || !vm.type_IRI || !vm.courseId){
               ngToast.create({
                   className : 'danger',
                   content : 'Please fill all required fields.'
               });
               return;
           }

           var resource = { 
                name : vm.name,
                description : vm.description,
                id_IRI : vm.id_IRI,
                type_IRI : vm.type_IRI,
                courseId : vm.courseId 
            };
           
           ResourcesService.create(resource).then(function(){
                $state.go('main.resourceList');
                ngToast.create({                    
                    content : 'Created Successfully.'
                }); 
           }).catch(function(err){
               console.log(err);
               ngToast.create({
                   className : 'danger',
                   content : 'Error creating Course.'
               });
           });
       }

       function _delete(resourceId){           
           ResourcesService.delete(resourceId).then(function(){
                vm.init();
                ngToast.create({                    
                    content : 'Deleted Successfully.'
                }); 
           }).catch(function(err){
               console.log(err);
               ngToast.create({
                   className : 'danger',
                   content : 'Error deleteing Course.'
               });
           });
       }
    }
})();
