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
              drawChart(response.data);
           }).catch(function(error){
              console.log(error);
           });
       }

       function drawChart(data){
           
            var ndx = crossfilter(data);

            var dim = ndx.dimension(function(d) {
                return d.count;
            });

            console.log(dim);

            var group = dim.group();
            var chart = dc.barChart('#chart');

            console.log(chart);
            chart
                .dimension(dim)
                .group(group)
                .width(function(element){
                    var width = element && element.getBoundingClientRect && element.getBoundingClientRect().width;
                    return (width && width > chart.minWidth()) ? width : chart.minWidth();
                })
                .renderHorizontalGridLines(true)
                .centerBar(true)
                .xAxisLabel('Scores Ranges')
                .yAxisLabel('Students Count')
                //.x(d3.scale.ordinal().domain([10,20,30,40,50,60,70,80,90,100]))
                .y(d3.scale.linear().domain([10,100]))
                .xUnits(dc.units.ordinal)
                .renderLabel(true);
       }
    }
})();
