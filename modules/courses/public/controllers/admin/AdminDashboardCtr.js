(function () {
    'use strict';
    angular
        .module('letApp')
        .controller('AdminDashboardCtr', AdminDashboardCtr);


    AdminDashboardCtr.$inject = ['CourseDashboardService', '$rootScope', 'ngToast', '$state', '$stateParams'];

    function AdminDashboardCtr(CourseDashboardService, $rootScope, ngToast, $state, $stateParams) {
        var vm = this;

        vm.findOne = findOne;
        vm.initWeekSlider = initWeekSlider;

        vm.x = 'Content';
        vm.y = 'Forum';

        vm.drawClusterChart = drawClusterChart;


        vm.pageSize = "10";
        vm.currentPage = 0;
        vm.getPage = getPage;

        function findOne() {
            CourseDashboardService.get($stateParams.id).then(function (response) {
                vm.course = response.data;
                initWeekSlider();
                initDashboard();
            }).catch(function (error) {
                if (error.status = 404) {
                    console.log(error);
                    ngToast.create({
                        className: 'danger',
                        content: 'Course Not Found.'
                    });
                } else {
                    console.log(error);
                    ngToast.create({
                        className: 'danger',
                        content: 'Error retrieving Course.'
                    });
                }
            });
        }

        function initWeekSlider() {
            vm.course.startDate = moment(vm.course.startDate);
            vm.course.endDate = moment(vm.course.endDate);
            vm.course.courseWeeksCount = vm.course.endDate.diff(vm.course.startDate, 'week');

            vm.weekSlider = {
                value: 1,
                options: {
                    floor: 1,
                    ceil: vm.course.courseWeeksCount,
                    showTicksValues: true,
                    onChange: function () {
                        initDashboard();
                    }
                }
            };
        }

        function initDashboard() {
            var weekNo = vm.weekSlider.value;
            var startDate = moment(vm.course.startDate).add(weekNo - 1, 'w').toDate();
            var endDate = moment(vm.course.startDate).add(weekNo, 'w').toDate();

            CourseDashboardService.getAdminDashbaordDate($stateParams.id, {
                startDate: startDate,
                endDate: endDate,
                weekNo: weekNo
            }).then(function (response) {

                drawStudentsViewsHistoram(response.data.studensViewsHistogram);

                drawOverallChart(response.data.overallActivities);

                vm.top10AccessedResrouce = response.data.topTenAccessedResource;

                vm.topTenActiveStudents = response.data.topTenActiveStudents;

                drawResourcesWeeklyChart(response.data.clickedstatements);

                vm.clusterData = response.data.clusterData;

                drawClusterChart();

                vm.predctionData = response.data.predctionData;

                vm.partOfPredctionData = vm.predctionData.splice(0,10);

                dc.renderAll();

            }).catch(function (err) {
                console.log(err);
                ngToast.create({
                    className: 'danger',
                    content: 'Error retrieving admin dashboard Data.'
                });
            });
        }

        function drawResourcesWeeklyChart(clickedstatements) {
            var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ").parse;

            clickedstatements.forEach(function (statement) {
                statement.timestamp = parseDate(statement.date);
                statement.timestamp.setHours(0);
                statement.timestamp.setMinutes(0);
                statement.timestamp.setSeconds(0);
                statement.timestamp.setMilliseconds(0);
            });

            for (var i = clickedstatements.length - 1; i >= 0; i--) {
                if (clickedstatements[i].Resource.type == 'glossary') {
                    clickedstatements.splice(i, 1);
                }
            }

            var minDate = d3.min(clickedstatements, function (x) {
                    return x.timestamp;
                }),
                maxDate = d3.max(clickedstatements, function (x) {
                    return x.timestamp;
                });

            var ndx = crossfilter(clickedstatements);

            var dateDim = ndx.dimension(function (item) {
                return item.timestamp;
            });

            // aggregate click statements in each day based on resource type
            var grouping = dateDim.group().reduce(function (p, v) {
                p[v.Resource.type] = (p[v.Resource.type] || 0) + v.sum_clicks;
                return p;
            }, function (p, v) {
                p[v.Resource.type] = (p[v.Resource.type] || 0) - v.sum_clicks;
                return p;
            }, function () {
                return {};
            });

            var typesOfGroupedResources = Object.keys(grouping.top(1)[0].value);

            var resourcesWeeklyChart = dc.lineChart('#resources-weekly-chart');

            resourcesWeeklyChart
                .dimension(dateDim)
                .group(grouping, typesOfGroupedResources[0], sel_stack(typesOfGroupedResources[0]))
                .width(function (element) {
                    var width = element && element.getBoundingClientRect && element.getBoundingClientRect().width;
                    return (width && width > resourcesWeeklyChart.minWidth()) ? width : resourcesWeeklyChart.minWidth();
                })
                .x(d3.time.scale().domain([minDate, maxDate]))
                .xUnits(d3.time.days)
                .renderArea(true)
                .renderDataPoints(true)
                .brushOn(false)
                .legend(dc.legend().x(resourcesWeeklyChart.minWidth()).y(380).gap(5).horizontal(1).autoItemWidth(1))
                .hidableStacks(true)
                .elasticY(true)
                .margins({
                    left: 40,
                    top: 20,
                    right: 15,
                    bottom: 50
                }).yAxisLabel('Daily Resources Click');


            typesOfGroupedResources.shift();

            typesOfGroupedResources.forEach(function (type) {
                resourcesWeeklyChart.stack(grouping, type, sel_stack(type));
            });


            function sel_stack(i) {
                return function (d) {
                    return d.value[i];
                };
            }
        }

        function drawStudentsViewsHistoram(data) {
            var minValue = d3.min(data, function (x) {
                    return x.numOfViews;
                }),
                maxValue = d3.max(data, function (x) {
                    return x.numOfViews;
                });

            var quantize = d3.scale.quantize().domain([minValue, maxValue]).range(['0 %', '10 %', '20 %', '30 %', '40 %', '50 %', '60 %', '70 %', '80 %', '90 %', '100 %']);

            data.forEach(function (item) {
                item.range = quantize(parseInt(item.numOfViews));
            });

            data.sort(function (a, b) {
                return parseInt(a.numOfViews) - parseInt(b.numOfViews);
            });

            var ndx = crossfilter(data);

            var rangesDim = ndx.dimension(function (item) {
                return item.range;
            });

            var grouping = rangesDim.group();

            var studentsViewsHistoram = dc.barChart('#students-views-historam');

            studentsViewsHistoram
                .dimension(rangesDim)
                .group(grouping)
                .width(function (element) {
                    var width = element && element.getBoundingClientRect && element.getBoundingClientRect().width;
                    return (width && width > studentsViewsHistoram.minWidth()) ? width : studentsViewsHistoram.minWidth();
                })
                .title(function (d) {
                    return d.value;
                })
                .renderHorizontalGridLines(true)
                .xAxisLabel('Ranges')
                .yAxisLabel('Unique Students')
                .x(d3.scale.ordinal())
                .y(d3.scale.linear().domain([0, grouping.top(1)[0].value + 10]))
                .xUnits(dc.units.ordinal)
                .renderLabel(true)
                .ordering(function (d) {
                    var rangeNumber = d.key.replace(' %', '');
                    return +rangeNumber;
                })

            studentsViewsHistoram.margins().right = 20;
        }

        function drawOverallChart(statements) {
            var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ").parse;

            statements.forEach(function (statement) {
                statement.timestamp = parseDate(statement.date);
                statement.timestamp.setHours(0);
                statement.timestamp.setMinutes(0);
                statement.timestamp.setSeconds(0);
                statement.timestamp.setMilliseconds(0);
            });

            var minDate = d3.min(statements, function (x) {
                    return x.timestamp;
                }),
                maxDate = d3.max(statements, function (x) {
                    return x.timestamp;
                });


            minDate = moment(minDate).subtract(1, 'week').toDate();

            statements.push({
                sum_activities: 0,
                timestamp: minDate
            }); // to begin from zero

            var ndx = crossfilter(statements);

            var dateDim = ndx.dimension(function (item) {
                return item.timestamp;
            });

            var grouping = dateDim.group().reduceSum(item => {
                return item.sum_activities;
            });

            var courseOverAllChart = dc.lineChart('#course-overall-chart');

            courseOverAllChart
                .dimension(dateDim)
                .group(grouping)
                .width(function (element) {
                    var width = element && element.getBoundingClientRect && element.getBoundingClientRect().width;
                    return (width && width > courseOverAllChart.minWidth()) ? width : courseOverAllChart.minWidth();
                }).title(function (d) {
                    return (d.key.getMonth() + 1) + '/' + d.key.getDate() + '/' + d.key.getFullYear() + " " + d.value + " Clicks";
                })
                .x(d3.time.scale().domain([minDate, maxDate]))
                .mouseZoomable(true)
                .renderHorizontalGridLines(true)
                .renderVerticalGridLines(true)
                .brushOn(false)
                .xAxisLabel('Timeline')
                .yAxisLabel('Number of Activities')
                .elasticY(true)
                .interpolate('linear')
                .margins({
                    left: 70,
                    top: 20,
                    right: 20,
                    bottom: 50
                })


            vm.courseOverAllChart = courseOverAllChart;
        }

        function drawClusterChart() {

            var ndx = crossfilter(vm.clusterData);

            var dimension = ndx.dimension(function (d) {
                return [+d.cluster, helpX(d), d.UserId];
            });

            var runGroup = dimension.group().reduceSum(function (d) {
                return helpY(d);
            });

            var symbolScale = d3.scale.ordinal().range(d3.svg.symbolTypes);
            var symbolAccessor = function (d) {
                return symbolScale(d.key[0]);
            };
            var subChart = function (c) {
                return dc.scatterPlot(c)
                    .symbol(symbolAccessor)
                    .symbolSize(8)
                    .highlightedSize(10)
            };

            var minX = d3.min(vm.clusterData, function (d) {
                return helpX(d);
            });

            var maxX = d3.max(vm.clusterData, function (d) {
                return helpX(d);
            });

            var minY = d3.min(vm.clusterData, function (d) {
                return helpY(d);
            });

            var maxY = d3.max(vm.clusterData, function (d) {
                return helpY(d);
            });

            var chart = dc.seriesChart("#clusters-chart");
            chart
                .width(function (element) {
                    var width = element && element.getBoundingClientRect && element.getBoundingClientRect().width;
                    return (width && width > chart.minWidth()) ? width : chart.minWidth();
                })
                .chart(subChart)
                .x(d3.scale.linear().domain([minX, maxX]))
                .y(d3.scale.linear().domain([minY, maxY + 50]))
                .brushOn(false)
                .mouseZoomable(true)
                .yAxisLabel(vm.y)
                .xAxisLabel(vm.x)
                .dimension(dimension)
                .group(runGroup)
                .title(function (d) {
                    return 'Student: ' + d.key[2];
                })
                .seriesAccessor(function (d) {
                    return "Group: " + d.key[0];
                })
                .keyAccessor(function (d) {
                    return +d.key[1];
                }).valueAccessor(function (d) {
                    return +d.value;
                }).legend(dc.legend().x(100).y(50).itemHeight(13).gap(5).horizontal(1).legendWidth(140).itemWidth(70));

            dc.renderAll();
        }

        function helpY(item) {
            if (vm.y == 'Content') {
                return +item.content;
            }

            if (vm.y == 'Url') {
                return +item.url;
            }

            if (vm.y == 'Forum') {
                return +item.forum;
            }
        };

        function helpX(item) {
            if (vm.x == 'Content') {
                return +item.content;
            }

            if (vm.x == 'Url') {
                return +item.url;
            }

            if (vm.x == 'Forum') {
                return +item.forum;
            }
        };

        function getPage(text, page, pageSize, total){
            (!page) ? page = 0: page--;

            console.log(page);
            var start = (page-1)*vm.pageSize;
            var end = (+start) + (+vm.pageSize);

            console.log(+start);
            console.log(+end);

            vm.partOfPredctionData = vm.predctionData.slice(start,end);

            console.log(vm.partOfPredctionData);
        }
    }
})()