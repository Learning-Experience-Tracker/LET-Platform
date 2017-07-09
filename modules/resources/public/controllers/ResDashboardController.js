(function(){
    'use strict';
    angular
        .module('letApp')
        .controller('ResDashboardController', ResDashboardController);

    ResDashboardController.$inject = ['ResourcesService', 'CourseService', '$rootScope', 'ngToast', '$state' ,'$stateParams'];
    
    function ResDashboardController(ResourcesService, CourseService, $rootScope, ngToast, $state,$stateParams){
       var vm = this;
        
        vm.initDashboard = initDashboard;
       
        function initDashboard(){
            findOne();

            ResourcesService.getDashboardData($stateParams.id).then(function(response){
                vm.lunchedStatements   = response.data.lunchedStatements;
                vm.clickedStatements   = response.data.clickedStatements;
                vm.numUniqueVisitor    = response.data.numUniqueVisitor;
                vm.avgLunchPerDay    = response.data.avgLunchPerDay;
                vm.avgClickPerDay    = response.data.avgClickPerDay;
                
                drawCharts();
            }).catch(function(err){
                console.log(err);
                ngToast.create({
                    className : 'danger',
                    content : 'Error retrieving resource dashboard Data.'
                });
            });
        }

        function findOne(){
            ResourcesService.get($stateParams.id).then(function(response){
                vm.resource = response.data;
            }).catch(function(err){
                console.log(err);
                ngToast.create({
                    className : 'danger',
                    content : 'Error retrieving resource.'
                });
            });
        }

        function drawCharts(){

            var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ").parse;

			vm.lunchedStatements.forEach(function(activity) {
				activity.timestamp = parseDate(activity.timestamp); 
                activity.timestamp.setHours(0);
                activity.timestamp.setMinutes(0);
                activity.timestamp.setSeconds(0);
                activity.timestamp.setMilliseconds(0);                
			});

			vm.clickedStatements.forEach(function(activity) {
				activity.timestamp = parseDate(activity.timestamp);            
			});

            drawResource_lunch_chart(vm.lunchedStatements);

            drawResource_click_chart(vm.clickedStatements);

            dc.renderAll();
        }

        function drawResource_lunch_chart(lunchedStatements){
            var minDate = d3.min(lunchedStatements, function(x) { return x.timestamp; }),
                maxDate = d3.max(lunchedStatements, function(x) { return x.timestamp; });
            
            var ndx = crossfilter(lunchedStatements);

            var dateDim = ndx.dimension(function(d) {
                return d.timestamp;
            });

            var grouping = dateDim.group().reduceCount();
            var resource_lunch_chart = dc.lineChart('#resource_lunch_chart');

            resource_lunch_chart
                .dimension(dateDim)
                .group(grouping)
                .width(function(element){
                    var width = element && element.getBoundingClientRect && element.getBoundingClientRect().width;
                    return (width && width > resource_lunch_chart.minWidth()) ? width : resource_lunch_chart.minWidth();
                }).title(function(d){
                    return (d.key.getMonth() + 1) + '/' + d.key.getDate() + '/' +  d.key.getFullYear() + " " + d.value + " Lunches";
                })
                .x(d3.time.scale().domain([minDate,maxDate]))
                .mouseZoomable(true)
                .brushOn(false)
                .renderHorizontalGridLines(true)
                .renderVerticalGridLines(true)
                .xAxisLabel('Timeline')
                .yAxisLabel('Number of Lunches')
                .elasticY(true)
                .interpolate('linear')
                .margins({left: 50, top: 20, right: 10, bottom: 50})
           

            vm.resource_lunch_chart = resource_lunch_chart;
        }

        function drawResource_click_chart(clickedStatements){
            var minDate = d3.min(clickedStatements, function(x) { return x.timestamp; }),
                maxDate = d3.max(clickedStatements, function(x) { return x.timestamp; });
            
            var ndx = crossfilter(clickedStatements);

            var dateDim = ndx.dimension(function(d) {
                return d.timestamp;
            });

            var grouping = dateDim.group().reduceCount();
            var resource_click_chart = dc.lineChart('#resource_click_chart');

            resource_click_chart
                .dimension(dateDim)
                .group(grouping)
                .width(function(element){
                    var width = element && element.getBoundingClientRect && element.getBoundingClientRect().width;
                    return (width && width > resource_click_chart.minWidth()) ? width : resource_click_chart.minWidth();
                }).title(function(d){
                    return (d.key.getMonth() + 1) + '/' + d.key.getDate() + '/' +  d.key.getFullYear() + " " + d.value + " Clicks";
                })
                .x(d3.time.scale().domain([minDate,maxDate]))
                .mouseZoomable(true)
                .brushOn(false)
                .renderHorizontalGridLines(true)
                .renderVerticalGridLines(true)
                .xAxisLabel('Timeline')
                .yAxisLabel('Number of Clicks')
                .elasticY(true)
                .interpolate('linear')
                .margins({left: 50, top: 20, right: 10, bottom: 50})
           

            vm.resource_click_chart = resource_click_chart;
        }
    }
})();
