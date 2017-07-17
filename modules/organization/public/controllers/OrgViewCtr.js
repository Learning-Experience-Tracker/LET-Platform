(function () {
    'use strict';
    angular
        .module('letApp')
        .controller('OrgViewCtr', OrgViewCtr);

    OrgViewCtr.$inject = ['OrganizationService', '$rootScope', 'ngToast', '$state', '$stateParams'];

    function OrgViewCtr(OrganizationService, $rootScope, ngToast, $state, $stateParams) {
        var vm = this;

        vm.findOne = findOne;
        vm.update = update;


        function findOne() {
            OrganizationService.get($stateParams.id).then(function (response) {
                vm.org = response.data;
            }).catch(function (error) {
                if (error.status = 404) {
                    console.log(error);
                    ngToast.create({
                        className: 'danger',
                        content: 'Org Not Found.'
                    });
                } else {
                    console.log(error);
                    ngToast.create({
                        className: 'danger',
                        content: 'Error retrieving Org.'
                    });
                }
            });
        }

        function update(course) {
            course.showen = !course.showen;
            getDashboardData();
        }


        function getDashboardData() {
            var coursesIds = [];
            vm.org.Courses.forEach(course => {
                if (course.showen)
                    coursesIds.push(course.id);
            });
            OrganizationService.getDashboardDate($stateParams.id, coursesIds).then(
                function (response) {
                    drawChart(response.data);
                }).catch(function (error) {
                ngToast.create({
                    className: 'danger',
                    content: 'Error retrieving Org dashboard data.'
                });
            });
        }


        function drawChart(statements) {

            var parseDate = d3.time.format("%Y-%m-%dT%H:%M:%S.%LZ").parse;


            var coursesIds = new Set();
            statements.forEach(function (statement) {
                statement.timestamp = parseDate(statement.date);
                statement.timestamp.setHours(0);
                statement.timestamp.setMinutes(0);
                statement.timestamp.setSeconds(0);
                statement.timestamp.setMilliseconds(0);
                coursesIds.add(statement.CourseId);
            });



            coursesIds.forEach(courseId => {
                var courseStatement = [];

                statements.forEach(statement => {
                    if (statement.CourseId == courseId) {
                        courseStatement.push(statement);
                    }
                });

                var minDate = d3.min(courseStatement, function (x) {
                    return x.timestamp;
                });


                statements.push({
                    num_activities: 0,
                    CourseId: courseId,
                    timestamp: moment(minDate).subtract(1, 'week').toDate()
                });
            });


            var minDate = d3.min(statements, function (x) {
                    return x.timestamp;
                }),
                maxDate = d3.max(statements, function (x) {
                    return x.timestamp;
                });

            var ndx = crossfilter(statements);

            var dateDim = ndx.dimension(function (item) {
                return [+item.CourseId, item.timestamp];
            });

            var grouping = dateDim.group().reduceSum(item => {
                return item.num_activities;
            });

            var chart = dc.seriesChart("#org-overall-chart");

            chart
                .dimension(dateDim)
                .group(grouping)
                .width(function (element) {
                    var width = element && element.getBoundingClientRect && element.getBoundingClientRect().width;
                    return (width && width > chart.minWidth()) ? width : chart.minWidth();
                }).title(function (d) {
                    return (d.key.getMonth() + 1) + '/' + d.key.getDate() + '/' + d.key.getFullYear() + " " + d.value + " Clicks";
                })
                .x(d3.time.scale().domain([minDate, maxDate]))
                .xAxisLabel('Timeline')
                .yAxisLabel('Number of Activities')
                .renderHorizontalGridLines(true)
                .renderVerticalGridLines(true)
                .seriesAccessor(function (d) {
                    return "Course: " + d.key[0];
                })
                .keyAccessor(function (d) {
                    return +d.key[1];
                }).valueAccessor(function (d) {
                    return +d.value;
                })
                .legend(dc.legend().x(chart.minWidth() * 2.2).y(380).gap(5).horizontal(1).autoItemWidth(1))
                .margins({
                    left: 60,
                    top: 20,
                    right: 15,
                    bottom: 50
                })
            dc.renderAll();
        }
    }
})();