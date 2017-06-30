(function(){
    'use strict';
    angular
        .module('letApp')
        .controller('AssDashboardController', AssDashboardController);

    AssDashboardController.$inject = ['AssessmentsService', 'CourseService', '$rootScope', 'ngToast', '$state', '$stateParams'];

    function AssDashboardController(AssessmentsService, CourseService, $rootScope, ngToast, $state, $stateParams){
        var vm = this;

       vm.initDashboard = initDashboard;

       function initDashboard(){

           findOne();

            AssessmentsService.getDashboardData($stateParams.id).then(function(response){
                vm.statements = response.data;
                drawCharts();
            }).catch(function(err){
                console.log(err);
                ngToast.create({
                    className : 'danger',
                    content : 'Error retrieving assessment.'
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

       function drawCharts(){
           

            var assessmentStatements = new Array();
            var questionsStatements = new Array();

            vm.statements.forEach(function(item){
                if (item.QuestionId == null)
                    assessmentStatements.push(item);
                else
                    questionsStatements.push(item);
            });

            var ndx1 = crossfilter(assessmentStatements);
            var ndx2 = crossfilter(questionsStatements);


            var scoreDim = ndx1.dimension(function(item){
                return item.raw;
            });

            var scoresRange = scoreDim.group().reduceCount();

            var scoresRangeChart = dc.barChart('#scoresRangeChart');

            var xScale = d3.scale.linear();
            xScale.domain([0,100]);
            xScale.rangeRound([0,100]);
            
            scoresRangeChart 
                .dimension(scoreDim)
                .group(scoresRange)
                .width(1080)
                .height(400)
                .renderHorizontalGridLines(true)
                .centerBar(true)
                .x(xScale);

                dc.renderAll();
       }

        function print_filter(filter){
            var f=eval(filter);
            if (typeof(f.length) != "undefined") {}else{}
            if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
            if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
            console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
        } 
    }
})();