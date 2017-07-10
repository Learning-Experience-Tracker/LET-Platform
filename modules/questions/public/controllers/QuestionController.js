(function(){
    'use strict';
    angular
        .module('letApp')
        .controller('QuestionController', QuestionController);

    QuestionController.$inject = ['QuestionsService', 'VerbsService', 'ResourcesService', 'AssessmentsService', '$rootScope', 'ngToast', '$state'];
    
    function QuestionController(QuestionsService, VerbsService, ResourcesService, AssessmentsService, $rootScope, ngToast, $state){
       var vm = this;
       
       vm.init = init;
       vm.execute = execute;

       vm.toWhat = 'resource';
       vm.apply =  'none';

       function init(){
           VerbsService.getAll().then(function(response){
              vm.verbs = response.data;
           }).catch(function(error){
              console.log(error);
           });

           ResourcesService.getAll().then(function(response){
              vm.resources = response.data;
           }).catch(function(error){
              console.log(error);
           });

           AssessmentsService.getAll().then(function(response){
              vm.assessments = response.data;
           }).catch(function(error){
              console.log(error);
           });

           AssessmentsService.getAllAssessmentsQuestions().then(function(response){
              vm.questions = response.data;
           }).catch(function(error){
              console.log(error);
           });
       }

       function execute(){
           QuestionsService.execute({
               didWhat : vm.didWhat,
               toWhat : vm.toWhat,
               toWhatValue : vm.toWhatValue,
               apply : vm.apply
           }).then(function(response){
              console.log(response);
           }).catch(function(error){
              console.log(error);
           });
       }
    }
})();
