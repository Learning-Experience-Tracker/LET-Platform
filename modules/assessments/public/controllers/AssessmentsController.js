(function(){
    'use strict';
    angular
        .module('letApp')
        .controller('AssessmentsController', AssessmentsController);

    AssessmentsController.$inject = ['AssessmentsService', 'CourseService', '$rootScope', 'ngToast', '$state', '$stateParams'];

    function AssessmentsController(AssessmentsService, CourseService, $rootScope, ngToast, $state, $stateParams){
        var vm = this;
        
       vm.init = init;
       vm.initCreate = initCreate;
       vm.create = create;
       vm.delete = _delete;
       vm.findOne = findOne;
       vm.viewAssessment = viewAssessment;

       vm.addQuestion = addQuestion;
       vm.removeQuestion = removeQuestion;
       vm.questions = [];


       function addQuestion(){
           vm.questions.push({id:vm.questions.length});
       }

       function removeQuestion(questionID){
            vm.questions.splice(questionID,1);
       }

       function init(){
           AssessmentsService.getAll().then(function(response){
              vm.assessmentsList = response.data;
           }).catch(function(err){
               console.log(err);
               ngToast.create({
                   className : 'danger',
                   content : 'Error retrieving list of Assessments'
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
       }

       function create(){
           if(!vm.name || !vm.id_IRI || !vm.courseId){
               ngToast.create({
                   className : 'danger',
                   content : 'Please fill all required fields.'
               });
               return;
           }

           var assessment = { 
                name : vm.name,
                id_IRI : vm.id_IRI,
                courseId : vm.courseId
            };

            if (vm.questions.length != 0){
                assessment['questions'] = vm.questions;
            }
           
           AssessmentsService.create(assessment).then(function(){
                $state.go('main.assessmentList');
                ngToast.create({                    
                    content : 'Created Successfully.'
                }); 
           }).catch(function(err){
               console.log(err);
               ngToast.create({
                   className : 'danger',
                   content : 'Error creating Assessment.'
               });
           });
       }

       function _delete(assessmentId){           
           AssessmentsService.delete(assessmentId).then(function(){
                vm.init();
                ngToast.create({                    
                    content : 'Deleted Successfully.'
                }); 
           }).catch(function(err){
               console.log(err);
               ngToast.create({
                   className : 'danger',
                   content : 'Error deleting Assessment.'
               });
           });
       }

       function findOne(){
           AssessmentsService.get($stateParams.id).then(function(response){
              vm.assessment = response.data;
           }).catch(function(err){
              console.log(err);
              ngToast.create({
                   className : 'danger',
                   content : 'Error retrieving assessment.'
              });
           });
       }

       function viewAssessment(assessmentId){
           $state.go('main.assessmentView', { id : assessmentId });
       }
    }
})();