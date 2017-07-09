(function(){
    'use strict';
    angular
        .module('letApp')
        .controller('StudentDashboardCtr', StudentDashboardCtr);

    StudentDashboardCtr.$inject = ['CourseService', 'OrganizationService', '$rootScope', 'ngToast', '$state', '$stateParams'];
    
    function StudentDashboardCtr(CourseService, OrganizationService, $rootScope, ngToast, $state, $stateParams){
       var vm = this;

       vm.initDashboard = initDashboard;

       function initDashboard(){
            CourseService.getStudentDashbaordDate($stateParams.id).then(function(response){
                vm.assessmentsStatements   = response.data.assessmentsStatements; 
                vm.activityStatements   = response.data.activityStatements;   
                  

                drawCharts();

            }).catch(function(err){
                console.log(err);
                ngToast.create({
                    className : 'danger',
                    content : 'Error retrieving student dashboard Data.'
                });
            });
       }


       function drawCharts(){

            drawAssessmentsChart(vm.assessmentsStatements);

            drawActivityChart(vm.activityStatements);

            dc.renderAll();
       }

       function drawAssessmentsChart(assessmentsStatements){
            var ndx = crossfilter(assessmentsStatements);

            var assDim = ndx.dimension(function(item){
                return item.Assessment.name;
            });

            var grouping = assDim.group().reduceSum(function(item){
                return item.raw;
            });

            var assessmentScoreChart = dc.lineChart('#assessmentScoreChart');

            assessmentScoreChart
                .dimension(assDim)
                .group(grouping)
                .width(function(element){
                    var width = element && element.getBoundingClientRect && element.getBoundingClientRect().width;
                    return (width && width > assessmentScoreChart.minWidth()) ? width : assessmentScoreChart.minWidth();
                })
                .y(d3.scale.linear().domain([0,110]))
                .x(d3.scale.ordinal())
                .xUnits(dc.units.ordinal)
                .brushOn(false)
                .renderHorizontalGridLines(true)
                .renderVerticalGridLines(true)
                .xAxisLabel('Assessments Names')
                .yAxisLabel('Your Score')
                .interpolate('linear')
                .margins({left: 50, top: 20, right: 10, bottom: 50})
           

            vm.assessmentScoreChart = assessmentScoreChart;

       }

       function drawActivityChart(activityStatement){

            console.log(activityStatement);

            var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ").parse;

			activityStatement.forEach(function(activity) {
				activity.timestamp = parseDate(activity.timestamp); 
                activity.timestamp.setHours(0);
                activity.timestamp.setMinutes(0);
                activity.timestamp.setSeconds(0);
                activity.timestamp.setMilliseconds(0);                
			});

            var minDate = d3.min(activityStatement, function(x) { return x.timestamp; }),
                maxDate = d3.max(activityStatement, function(x) { return x.timestamp; });
            var ndx = crossfilter(activityStatement);

            var dateDim = ndx.dimension(function(item){
                return item.timestamp;
            });

            var grouping = dateDim.group().reduceCount();

            var activitychart = dc.lineChart('#activitychart');

            activitychart
                .dimension(dateDim)
                .group(grouping)
                .width(function(element){
                    var width = element && element.getBoundingClientRect && element.getBoundingClientRect().width;
                    return (width && width > activitychart.minWidth()) ? width : activitychart.minWidth();
                }).title(function(d){
                    return (d.key.getMonth() + 1) + '/' + d.key.getDate() + '/' +  d.key.getFullYear();
                })
                .x(d3.time.scale().domain([minDate,maxDate]))
                .mouseZoomable(true)
                .zoomScale([1, grouping.all().length/7]) // zoom scale only to week
                .brushOn(false)
                .renderHorizontalGridLines(true)
                .renderVerticalGridLines(true)
                .xAxisLabel('Timeline')
                .yAxisLabel('Your Activity')
                .elasticY(true)
                .interpolate('basis')
                .margins({left: 40, top: 20, right: 10, bottom: 50});

            activitychart.yAxis().ticks(0);
            vm.activitychart = activitychart;
       }
    }
})();
