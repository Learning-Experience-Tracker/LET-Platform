(function () {
    'use strict';
    angular
        .module('letApp')
        .controller('AdminCourseElementsCtr', AdminCourseElementsCtr);

    AdminCourseElementsCtr.$inject = ['CourseElementsService', 'CourseService', '$rootScope', 'ngToast', '$state', '$stateParams', 'moment'];

    function AdminCourseElementsCtr(CourseElementsService, CourseService, $rootScope, ngToast, $state, $stateParams) {
        var vm = this;

        vm.pageSize = "10";
        vm.currentPage = 0;

        vm.getAssessmentsList = getAssessmentsList;
        vm.getAssessmentsPage = getAssessmentsPage;
        vm.viewAssessmentDashboard = viewAssessmentDashboard;


        vm.getResourcesList = getResourcesList;
        vm.getResourcesPage = getResourcesPage;
        vm.viewResourceDashboard = viewResourceDashboard;

        vm.getActivitiesList = getActivitiesList;
        vm.getActivitiesPage = getActivitiesPage;

        vm.getStudentsList = getStudentsList;
        vm.getStudentsPage = getStudentsPage;
        vm.viewStudentDashboard = viewStudentDashboard;


        function findCourse(callback) {
            CourseService.get($stateParams.id).then(function (response) {
                vm.course = response.data;
                callback();
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

        function getAssessmentsList() {
            findCourse(getAssessmentsPage);
        }

        function getAssessmentsPage(text, page, pageSize, total) {
            (!page) ? page = 0: page--;

            CourseElementsService.getCourseAssessments($stateParams.id, page, vm.pageSize).then(function (response) {
                vm.assessmentsList = response.data.rows;
                vm.assessmentsCount = response.data.count;
            }).catch(function (err) {
                console.log(err);
                ngToast.create({
                    className: 'danger',
                    content: 'Error retrieving list of course assessments'
                });
            });

        }

        function viewAssessmentDashboard(assessmentId) {
            $state.go('main.assessmentDashboard', {
                id: assessmentId
            });
        }

        function getResourcesList() {
            findCourse(getResourcesPage);
        }

        function getResourcesPage(text, page, pageSize, total) {
            (!page) ? page = 0: page--;

            CourseElementsService.getCourseResources($stateParams.id, page, vm.pageSize).then(function (response) {
                vm.resourcesList = response.data.rows;
                vm.resourcesCount = response.data.count;
            }).catch(function (err) {
                console.log(err);
                ngToast.create({
                    className: 'danger',
                    content: 'Error retrieving list of course rescourse'
                });
            });

        }

        function viewResourceDashboard(resourceId) {
            $state.go('main.resourceDashboard', {
                id: resourceId
            });
        }

        function getActivitiesList() {
            findCourse(getActivitiesPage);
        }

        function getActivitiesPage(text, page, pageSize, total) {
            (!page) ? page = 0: page--;

            CourseElementsService.getCourseActivities($stateParams.id, page, vm.pageSize).then(function (response) {
                vm.activitiesList = response.data.rows;
                vm.activitiesCount = response.data.count;
            }).catch(function (err) {
                console.log(err);
                ngToast.create({
                    className: 'danger',
                    content: 'Error retrieving list of course activities'
                });
            });
        }

        function showActivityDetails(xapi_statemnt) {
            console.log(xapi_statemnt);
        }

        function getStudentsList() {
            findCourse(getStudentsPage);
        }

        function getStudentsPage(text, page, pageSize, total) {
            (!page) ? page = 0: page--;

            CourseElementsService.getCourseStudents($stateParams.id, page, vm.pageSize).then(function (response) {
                vm.studentsList = response.data.rows;
                vm.studentsCount = response.data.count;
            }).catch(function (err) {
                console.log(err);
                ngToast.create({
                    className: 'danger',
                    content: 'Error retrieving list of course students'
                });
            });
        }


        function viewStudentDashboard(studentId) {
            $state.go('main.resourceDashboard', {
                id: studentId
            });
        }
    }
})();