(function () {
    'use strict';
    angular
        .module('letApp')
        .controller('StudentDashboardCtr', StudentDashboardCtr);

    StudentDashboardCtr.$inject = ['CourseDashboardService', '$rootScope', 'ngToast', '$state', '$stateParams'];

    function StudentDashboardCtr(CourseDashboardService, $rootScope, ngToast, $state, $stateParams) {
        var vm = this;

        vm.initDashboard = initDashboard;

        function initDashboard() {
            CourseDashboardService.getStudentDashbaordDate($stateParams.id).then(function (response) {
                vm.assessmentsStatements = response.data.assessmentsStatements;
                vm.resourceStatements = response.data.resourceStatements;

                drawCharts();

            }).catch(function (err) {
                console.log(err);
                ngToast.create({
                    className: 'danger',
                    content: 'Error retrieving student dashboard Data.'
                });
            });
        }


        function drawCharts() {

            drawAssessmentsChart(vm.assessmentsStatements);

            prepareReourcesActivityCharts(vm.resourceStatements);

            dc.renderAll();
        }

        function drawAssessmentsChart(assessmentsStatements) {
            var ndx = crossfilter(assessmentsStatements);

            var assDim = ndx.dimension(function (item) {
                return item.Assessment.name;
            });

            var grouping = assDim.group().reduceSum(function (item) {
                return item.raw;
            });

            var assessmentScoreChart = dc.lineChart('#assessment-score-chart');

            assessmentScoreChart
                .dimension(assDim)
                .group(grouping)
                .width(function (element) {
                    var width = element && element.getBoundingClientRect && element.getBoundingClientRect().width;
                    return (width && width > assessmentScoreChart.minWidth()) ? width : assessmentScoreChart.minWidth();
                })
                .y(d3.scale.linear().domain([0, 110]))
                .x(d3.scale.ordinal())
                .xUnits(dc.units.ordinal)
                .brushOn(false)
                .renderHorizontalGridLines(true)
                .renderVerticalGridLines(true)
                .xAxisLabel('Assessments Names')
                .yAxisLabel('Your Score')
                .interpolate('linear')
                .margins({
                    left: 50,
                    top: 20,
                    right: 10,
                    bottom: 50
                })


            vm.assessmentScoreChart = assessmentScoreChart;

        }

        function prepareReourcesActivityCharts(activityStatement) {

            var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ").parse;

            activityStatement.forEach(function (activity) {
                activity.timestamp = parseDate(activity.timestamp);
                activity.timestamp.setHours(0);
                activity.timestamp.setMinutes(0);
                activity.timestamp.setSeconds(0);
                activity.timestamp.setMilliseconds(0);
            });

            var minDate = d3.min(activityStatement, function (x) {
                    return x.timestamp;
                }),
                maxDate = d3.max(activityStatement, function (x) {
                    return x.timestamp;
                });

            var ndx = crossfilter(activityStatement);

            drawResourceActivityLineChart(ndx,minDate,maxDate);

            drawResourceTypesPieChart(ndx);
        }

        function drawResourceActivityLineChart(ndx,minDate,maxDate) {
            var dateDim = ndx.dimension(function (item) {
                return item.timestamp;
            });

            var grouping = dateDim.group().reduceCount();

            var resourcesActivityChart = dc.lineChart('#resources-activity-chart');

            resourcesActivityChart
                .dimension(dateDim)
                .group(grouping)
                .width(function (element) {
                    var width = element && element.getBoundingClientRect && element.getBoundingClientRect().width;
                    return (width && width > resourcesActivityChart.minWidth()) ? width : resourcesActivityChart.minWidth();
                }).title(function (d) {
                    return (d.key.getMonth() + 1) + '/' + d.key.getDate() + '/' + d.key.getFullYear();
                })
                .x(d3.time.scale().domain([minDate, maxDate]))
                .mouseZoomable(true)
                .zoomScale([1, grouping.all().length / 7]) // zoom scale only to week
                .brushOn(false)
                .renderHorizontalGridLines(true)
                .renderVerticalGridLines(true)
                .xAxisLabel('Timeline')
                .yAxisLabel('Your Activity')
                .elasticY(true)
                .interpolate('basis')
                .margins({
                    left: 50,
                    top: 20,
                    right: 10,
                    bottom: 50
                });

            //resourcesActivityChart.yAxis().ticks(0);
            vm.resourcesActivityChart = resourcesActivityChart;
        }

        function drawResourceTypesPieChart(ndx){

            var typeDim = ndx.dimension(function(item){
                return item.Resource.type;
            });

            var grouping = typeDim.group().reduceCount();

            console.log(grouping.all());


            var resourceTypesChart = dc.pieChart('#resources-types-chart');

            resourceTypesChart
                .dimension(typeDim)
                .group(grouping)
                .width(function (element) {
                    var width = element && element.getBoundingClientRect && element.getBoundingClientRect().width;
                    return (width && width > resourceTypesChart.minWidth()) ? width : resourceTypesChart.minWidth();
                })
                .radius(175)
                .innerRadius(50)
                .drawPaths(true)
                .on('pretransition', function(chart) {
                    chart.selectAll('text.pie-slice').text(function(d) {
                        return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
                    })
                })
                .legend(dc.legend().x(25).y(25).itemHeight(16).legendWidth(100).itemWidth(50));

            vm.resourceTypesChart = resourceTypesChart;
        }
    }
})();