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
                vm.statements   = response.data.statements;
                vm.questionsNum = response.data.questionsNum;
                vm.avg          = response.data.avg;
                vm.std          = response.data.std;
                vm.studentsNum  = response.data.studentsNum;
                vm.passedstudentsNum = response.data.passedstudentsNum;
                vm.faildSutdentsNum = response.data.faildSutdentsNum;

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
            var assAttemptedStatements = new Array();
            var assCompletedStatements = new Array();
            var questionsStatements    = new Array();

            vm.statements.forEach(function(item){
                if (item.QuestionId == null){
                    if (item.has_result){
                        assCompletedStatements.push(item);
                    }else{
                        assAttemptedStatements.push(item);
                    }
                }
                else{
                    questionsStatements.push(item);
                }
            });

            assCompletedStatements  = crossfilter(assCompletedStatements);
            questionsStatements     = crossfilter(questionsStatements);


            drawScoreDistributionChart(assCompletedStatements);

            drawStudentsMarksChart(assCompletedStatements);

            drawStudentsTable(assCompletedStatements);

            drawQuestionsCorrectInCorrectChart(questionsStatements);

            dc.renderAll();
        }

        function drawScoreDistributionChart(assCompletedStatements){
            var scoreDim = assCompletedStatements.dimension(function(item){
                    return Math.ceil(item.raw / 10) * 10;
            });

            var scoresRange = scoreDim.group();            
            var scoresRangeChart = dc.barChart('#scoresDistribution');
            
            scoresRangeChart
                .dimension(scoreDim)
                .group(scoresRange)
                .width(function(element){
                    var width = element && element.getBoundingClientRect && element.getBoundingClientRect().width;
                    return (width && width > scoresRangeChart.minWidth()) ? width : scoresRangeChart.minWidth();
                })
                .title(function(d){
                    return d.value;
                })
                .renderHorizontalGridLines(true)
                .centerBar(true)
                .xAxisLabel('Scores Ranges')
                .yAxisLabel('Students Count')
                .x(d3.scale.ordinal().domain([10,20,30,40,50,60,70,80,90,100]))
                .y(d3.scale.linear().domain([0, scoresRange.top(1)[0].value + 10]))
                .xUnits(dc.units.ordinal)
                .renderLabel(true);

            vm.scoresRangeChart = scoresRangeChart;

            scoresRangeChart.margins().right = 20;        
        }

        function drawStudentsTable(assCompletedStatements){
            var dim = assCompletedStatements.dimension(function(d) {return d.User.id;});

            var studentsTable = dc.dataTable('#data-table');

            studentsTable
                .dimension(dim)
                .group(function (d) { return 'dc.js insists on putting a row here so I remove it using JS'; })
                .size(10000)
                .columns([
                    function (d) { return d.User.id; },
                    function (d) { return d.User.name; },
                    function (d) { return d.raw;},
                    function (d) { return d.success ? '<span class="fa fa-check-circle text-success"><i></i></span> Passed' : '<span class="fa fa-times-circle text-danger"><i></i></span> Failed';}
                ])
                .sortBy(function (d) { return d.User.id; })
                .order(d3.ascending)
                .on('renderlet', function (studentsTable) {
                    studentsTable.select('tr.dc-table-group').remove();
                });
        }

        function drawStudentsMarksChart(assCompletedStatements){

            var studentNameDim = assCompletedStatements.dimension(function(item){
                return item.User.name;
            });

            var grouping = studentNameDim.group().reduceSum(function(item){
                return item.raw;
            });

            grouping = remove_empty_bins(grouping);

            var studentsMarksChart = dc.barChart('#studentsMarksChart');
            
            studentsMarksChart
                .dimension(studentNameDim)
                .group(grouping)
                .width(function(element){
                    var width = element && element.getBoundingClientRect && element.getBoundingClientRect().width;
                    return (width && width > studentsMarksChart.minWidth()) ? width : studentsMarksChart.minWidth();
                })
                .title(function(d){
                    return d.value;
                })
                .renderHorizontalGridLines(true)
                .brushOn(false)
                .x(d3.scale.ordinal())
                .y(d3.scale.linear().domain([(Math.floor(grouping.bottom(1)[0].value / 10) * 10) - 6, grouping.top(1)[0].value + 5]))
                .xUnits(dc.units.ordinal)
                .renderLabel(true)
                .elasticX(true)
                .on('renderlet',function (chart) {
                    // rotate x-axis labels
                    chart.selectAll('g.x text').attr('transform', 'translate(-13,50) rotate(-90)');
                })
                .margins({left: 40, top: 20, right: 10, bottom: 100})
                .on("preRedraw", function (chart){
                    chart.y(d3.scale.linear().domain([
                        (Math.floor(grouping.bottom(1)[0].value / 10) * 10) - 6, 
                        grouping.top(1)[0].value + 5]));
                });

            studentsMarksChart.yAxis().tickFormat(function(d) {return d});
            studentsMarksChart.yAxis().ticks(10);

            vm.studentsMarksChart = studentsMarksChart;
        }

        function drawQuestionsCorrectInCorrectChart(questionsStatements){

            var questionIDDim = questionsStatements.dimension(function(item){
                return item.Question.name;
            });

            var questionGrouping = questionIDDim.group().reduce(
                function(p, v) {
                        if (v.success)
                            p.correct++;
                        else
                            p.incorrect++;
                    return p;
                }, 
                function(p, v) {
                        if (v.success)
                            p.correct--;
                        else
                            p.incorrect--;
                    return p;
                }, 
                function() {
                    return { correct : 0 , incorrect : 0};
                } 
            );

            var questionCorrectIncorrectChart = dc.barChart("#questionsCorrectInCorrect");


            function getTops(group,count) {
                    return {
                        all: function () {
                            return group.top(count);
                        }
                };
            }

            questionCorrectIncorrectChart
                .width(function(element){
                    var width = element && element.getBoundingClientRect && element.getBoundingClientRect().width;
                    return (width && width > questionCorrectIncorrectChart.minWidth()) ? width : questionCorrectIncorrectChart.minWidth();
                })
                .brushOn(false)
                .xAxisLabel('Questions')
                .yAxisLabel('Correct/InCorrect Counts')
                .dimension(questionIDDim)
                .group(getTops(questionGrouping,50),"correct", sel_stack('correct'))
                .stack(getTops(questionGrouping,50),"incorrect", sel_stack('incorrect'))
                .x(d3.scale.ordinal())
                .xUnits(dc.units.ordinal)
                .margins({left: 90, top: 20, right: 10, bottom: 100})
                .on('renderlet',function (chart) {
                    // rotate x-axis labels
                    chart.selectAll('g.x text').attr('transform', 'translate(-13,50) rotate(-90)');
                })
                .legend(dc.legend())
                .hidableStacks(true);
            vm.questionCorrectIncorrectChart = questionCorrectIncorrectChart;
                
            function sel_stack(i) {
                return function(d) {
                    return d.value[i];
                };
            }
        }


        function remove_empty_bins(source_group) {
            return {
                all:function () {
                    return source_group.all().filter(function(d) {
                        return d.value != 0;
                    });
                },

                top : function (n){
                    return source_group.top(Infinity)
                        .filter(function(d) {
                                return d.value != 0;
                        })
                        .slice(0,n);
                }

                ,bottom : function(n) {
                    return source_group.top(Infinity)
                        .filter(function(d) {
                                return d.value != 0;
                        })
                        .slice(-n).reverse();
                }
            };
        }     
    }
})();