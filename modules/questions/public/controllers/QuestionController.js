(function(){
    'use strict';
    angular
        .module('letApp')
        .controller('QuestionController', QuestionController);

    QuestionController.$inject = ['QuestionsService', 'VerbsService', 'ResourcesService', 'AssessmentsService', '$rootScope', 'ngToast', '$state', '$stateParams'];
    
    function QuestionController(QuestionsService, VerbsService, ResourcesService, AssessmentsService, $rootScope, ngToast, $state, $stateParams){
       var vm = this;
       
       vm.init = init;
       vm.initList = initList;
       vm.initDetails = initDetails;

       vm.execute = execute;
       vm.goDetails = goDetails;

       vm.toWhat = 'resource';
       vm.apply =  'none';

       vm.questionIndics = [{}];

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

       function execute(btn){
           console.log(btn);
           
           QuestionsService.execute({
               didWhat : vm.didWhat,
               toWhat : vm.toWhat,
               toWhatValue : vm.toWhatValue,
               apply : vm.apply
           }).then(function(response){
              //console.log(response);
              drawChart(response.data);
           }).catch(function(error){
              //console.log(error);
           });
       }

       function drawChart(data){

            

            var ndx = crossfilter(data);

            var dim = ndx.dimension(function(d) {
                return d.QueriedId;
            });


            var group = dim.group().reduceSum(function(d){
                return d.count; // dummy grouping
            });

            console.log(group.all());
            
            var chart = dc.barChart('#chart');

            chart
                .dimension(dim)
                .group(group)
                .width(function(element){
                    var width = element && element.getBoundingClientRect && element.getBoundingClientRect().width;
                    return (width && width > chart.minWidth()) ? width : chart.minWidth();
                })
                .renderHorizontalGridLines(true)
                //.centerBar(true)
                .xAxisLabel('Scores Ranges')
                .yAxisLabel('Students ّCount')
                .x(d3.scale.ordinal())
                .y(d3.scale.linear().domain([0, group.top(1)[0].value + 10]))
                .xUnits(dc.units.ordinal)
                .renderLabel(true);
            dc.renderAll();
       }

       function initList(){
           QuestionsService.getAll().then(function(response){
              console.log(response);
              vm.questionsList = response.data;
           }).catch(function(error){
            console.log(error);
           });
       }

       function goDetails(questionId){
           $state.go('main.questionDetails', { id : questionId });
       }

       function initDetails(){
           QuestionsService.get($stateParams.id).then(function(response){
              vm.question = response.data;
           }).catch(function(error){
              console.log(error);              
           });
       }
    }
})();
