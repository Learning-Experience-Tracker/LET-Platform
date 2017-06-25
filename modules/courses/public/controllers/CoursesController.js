(function(){
    'use strict';
    angular
        .module('letApp')
        .controller('CoursesController', CoursesController);

    CoursesController.$inject = ['CourseService', 'OrganizationService', '$rootScope', 'ngToast', '$state'];
    
    function CoursesController(CourseService, OrganizationService, $rootScope, ngToast, $state){
       var vm = this;

       vm.init = init;
       vm.initCreate = initCreate;
       vm.create = create;
       
       function init(){
           CourseService.getAll().then(function(response){
              vm.courseList = response.data;
           }).catch(function(err){
               console.log(err);
               ngToast.create({
                   className : 'danger',
                   content : 'Error retrieving list of Courses'
               });
           });
       }

       function initCreate(){
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

           if(!vm.name || !vm.org){
               ngToast.create({
                   className : 'danger',
                   content : 'Please fill all required fields.'
               });
               return;
           }
           
           CourseService.create({ name : vm.name, orgId : vm.org }).then(function(){
                $state.go('main.courseList');
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
    }
})();
