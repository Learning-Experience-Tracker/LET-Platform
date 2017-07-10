(function () {
    'use strict';
    angular
        .module('letApp')
        .controller('AdminDashboardCtr', AdminDashboardCtr);


    AdminDashboardCtr.$inject = ['CourseService', '$rootScope', 'ngToast', '$state', '$stateParams'];

    function AdminDashboardCtr(CourseService, $rootScope, ngToast, $state, $stateParams) {
        var vm = this;

        vm.findOne = findOne;
        vm.initWeekSlider = initWeekSlider;

        function findOne() {
            CourseService.get($stateParams.id).then(function (response) {
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

            CourseService.getAdminDashbaordDate($stateParams.id, {
                startDate: startDate,
                endDate: endDate
            }).then(function (response) {
                drawCharts(response.data.clickedstatements, weekNo);
                vm.top10AccessedResrouce = response.data.topTenAccessedResource;
            }).catch(function (err) {
                console.log(err);
                ngToast.create({
                    className: 'danger',
                    content: 'Error retrieving admin dashboard Data.'
                });
            });
        }

        function drawCharts(clickedstatements, weekNo) {
            clickedstatements = prepareData(clickedstatements);

            var minDate = d3.min(clickedstatements, function (x) {
                    return x.timestamp;
                }),
                maxDate = d3.max(clickedstatements, function (x) {
                    return x.timestamp;
                });

            var ndx = crossfilter(clickedstatements);

            drawResourcesWeeklyChart(ndx, minDate, maxDate, weekNo);

            dc.renderAll();
        }

        function prepareData(statements) {
            var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ").parse;

            statements.forEach(function (statement) {
                statement.timestamp = parseDate(statement.timestamp);
                statement.timestamp.setHours(0);
                statement.timestamp.setMinutes(0);
                statement.timestamp.setSeconds(0);
                statement.timestamp.setMilliseconds(0);
            });

            return statements;
        }

        function drawResourcesWeeklyChart(ndx, minDate, maxDate, weekNo) {
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

            console.log(typesOfGroupedResources);

            function sel_stack(i) {
                return function (d) {
                    return d.value[i];
                };
            }
        }
    }
})()