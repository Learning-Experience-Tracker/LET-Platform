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
       vm.viewDashboard = viewDashboard;
       
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
                   content : 'Error retrieving list of Courses'
               });
           });

           ResourcesService.getTypes().then(function(response){
              vm.resourceTypes = response.data;
           }).catch(function(err){
               console.log(err);
               ngToast.create({
                   className : 'danger',
                   content : 'Error retrieving types of resource'
               });
           });
       }

       function create(){

           if(!vm.name || !vm.id_IRI || !vm.type || !vm.courseId){
               ngToast.create({
                   className : 'danger',
                   content : 'Please fill all required fields.'
               });
               return;
           }

           var resource = { 
                name : vm.name,
                id_IRI : vm.id_IRI,
                courseId : vm.courseId,
                type : vm.type,
                platform : vm.platform
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

       function viewDashboard(resourceId){
           $state.go('main.resourceDashboard', { id : resourceId });
       }
    }
})();
