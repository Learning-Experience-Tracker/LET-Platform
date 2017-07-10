(function () {
    'use strict';
    angular
        .module('letApp')
        .controller('AdminDashboardCtr', AdminDashboardCtr);


    AdminDashboardCtr.$inject = ['CourseService', '$rootScope', 'ngToast', '$state', '$stateParams'];

    function AdminDashboardCtr(CourseService, $rootScope, ngToast, $state, $stateParams) {
        var vm = this;

        vm.findOne = findOne;

        function findOne() {
            CourseService.get($stateParams.id).then(function (response) {
                vm.course = response.data;
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

        function initDashboard() {
            CourseService.getAdminDashbaordDate($stateParams.id).then(function (response) {
                

                drawCharts();

            }).catch(function (err) {
                console.log(err);
                ngToast.create({
                    className: 'danger',
                    content: 'Error retrieving admin dashboard Data.'
                });
            });
        }
    }
})()