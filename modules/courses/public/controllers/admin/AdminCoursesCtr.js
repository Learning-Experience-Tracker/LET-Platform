(function () {
    'use strict';
    angular
        .module('letApp')
        .controller('CoursesController', CoursesController);

    CoursesController.$inject = ['CourseService', 'OrganizationService', '$rootScope', 'ngToast', '$state', '$stateParams', 'moment'];

    function CoursesController(CourseService, OrganizationService, $rootScope, ngToast, $state, $stateParams) {
        var vm = this;

        vm.init = init;
        vm.initCreate = initCreate;
        vm.create = create;
        vm.delete = _delete;
        vm.findOne = findOne;
        vm.viewCourse = viewCourse;
        vm.viewCourseDashboard = viewCourseDashboard;
        vm.viewCourseAssessments = viewCourseAssessments;

        function init() {
            CourseService.getAll().then(function (response) {
                vm.courseList = response.data;
            }).catch(function (err) {
                console.log(err);
                ngToast.create({
                    className: 'danger',
                    content: 'Error retrieving list of Courses'
                });
            });
        }

        function initCreate() {
            OrganizationService.getAll().then(function (response) {
                vm.orgList = response.data;
            }).catch(function (err) {
                console.log(err);
                ngToast.create({
                    className: 'danger',
                    content: 'Error retrieving list of Organizations'
                });
            });
        }

        function create() {

            if (!vm.name || !vm.org || !vm.id_IRI) {
                ngToast.create({
                    className: 'danger',
                    content: 'Please fill all required fields.'
                });
                return;
            }

            CourseService.create({
                name: vm.name,
                orgId: vm.org,
                id_IRI : vm.id_IRI
            }).then(function () {
                $state.go('main.courseList');
                ngToast.create({
                    content: 'Created Successfully.'
                });
            }).catch(function (err) {
                console.log(err);
                ngToast.create({
                    className: 'danger',
                    content: 'Error creating Course.'
                });
            });
        }

        function _delete(courseId) {
            CourseService.delete(courseId).then(function () {
                vm.init();
                ngToast.create({
                    content: 'Deleted Successfully.'
                });
            }).catch(function (err) {
                console.log(err);
                ngToast.create({
                    className: 'danger',
                    content: 'Error deleteing Course.'
                });
            });
        }

        function findOne() {
            CourseService.getDetails($stateParams.id).then(function (response) {
                vm.course = response.data;
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

        function viewCourse(courseId) {
            $state.go('main.courseView', {
                id: courseId
            });
        }

        function viewCourseDashboard(courseId) {
            $state.go('main.adminCourseDashboard', {
                id: courseId
            });
        }

        function viewCourseAssessments(courseId, page) {
            $state.go('main.adminCourseAssessments', {
                id: courseId,
                page: page
            });
        }
    }
})();