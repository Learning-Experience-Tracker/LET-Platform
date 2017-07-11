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
                endDate: endDate
            }).then(function (response) {

                drawResourcesWeeklyChart(response.data.clickedstatements);

                drawStudentsViewsHistoram(response.data.studensViewsHistogram);

                vm.top10AccessedResrouce = response.data.topTenAccessedResource;

                vm.topTenActiveStudents = response.data.topTenActiveStudents;
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
                statement.timestamp = parseDate(statement.timestamp);
                statement.timestamp.setHours(0);
                statement.timestamp.setMinutes(0);
                statement.timestamp.setSeconds(0);
                statement.timestamp.setMilliseconds(0);
            });

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
                p[v.Resource.type] = (p[v.Resource.type] || 0) + 1;
                return p;
            }, function (p, v) {
                p[v.Resource.type] = (p[v.Resource.type] || 0) - 1;
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
                .renderArea(true)
                .brushOn(false)
                .legend(dc.legend().x(resourcesWeeklyChart.minWidth()).y(380).gap(5).horizontal(1).autoItemWidth(1))
                .hidableStacks(true)
                .clipPadding(10)
                .margins({
                    left: 40,
                    top: 20,
                    right: 15,
                    bottom: 50
                })
                .yAxisLabel('Daily Resources Click')

            typesOfGroupedResources.shift();

            typesOfGroupedResources.forEach(function (type) {
                resourcesWeeklyChart.stack(grouping, type, sel_stack(type));
            });

            function sel_stack(i) {
                return function (d) {
                    return d.value[i];
                };
            }

            dc.renderAll();
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

            console.log(data);

            data.sort(function (a, b) {
                return parseInt(a.numOfViews) - parseInt(b.numOfViews);
            });

            console.log(data);

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
            dc.renderAll();
        }
    }
})()