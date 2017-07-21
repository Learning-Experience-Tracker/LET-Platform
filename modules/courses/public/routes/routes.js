(function () {

  'use strict';
  angular
    .module('letApp')
    .config(configState);


  configState.$inject = ['$stateProvider', '$urlRouterProvider'];


  function configState($stateProvider, $urlRouterProvider) {

    // states
    $stateProvider
      .state('main.courseList', {
        url: '/admin/courses/all',
        data: {},
        views: {
          '': {
            templateUrl: '/courses/views/admin/list_admin.html',
            controller: 'CoursesController',
            controllerAs: 'courseCtr'
          }
        }
      }).state('main.courseCreate', {
        url: '/admin/courses/create',
        data: {},
        views: {
          '': {
            templateUrl: '/courses/views/admin/create.html',
            controller: 'CoursesController',
            controllerAs: 'courseCtr'
          }
        }
      }).state('main.courseView', {
        url: '/admin/course/:id',
        data: {},
        views: {
          '': {
            templateUrl: '/courses/views/admin/view_admin.html',
            controller: 'CoursesController',
            controllerAs: 'courseCtr'
          }
        }
      }).state('main.adminCourseAssessments', {
        url: '/admin/course/:id/assessments/',
        data: {},
        views: {
          '': {
            templateUrl: '/courses/views/admin/course-elements/assessments-list.html',
            controller: 'AdminCourseElementsCtr',
            controllerAs: 'courseElementsCtr'
          }
        }
      }).state('main.adminCourseRecources', {
        url: '/admin/course/:id/resources/',
        data: {},
        views: {
          '': {
            templateUrl: '/courses/views/admin/course-elements/resources-list.html',
            controller: 'AdminCourseElementsCtr',
            controllerAs: 'courseElementsCtr'
          }
        }
      }).state('main.adminCourseActivities', {
        url: '/admin/course/:id/activities/',
        data: {},
        views: {
          '': {
            templateUrl: '/courses/views/admin/course-elements/activities-list.html',
            controller: 'AdminCourseElementsCtr',
            controllerAs: 'courseElementsCtr'
          }
        }
      }).state('main.adminCourseStudents', {
        url: '/admin/course/:id/students/',
        data: {},
        views: {
          '': {
            templateUrl: '/courses/views/admin/course-elements/students-list.html',
            controller: 'AdminCourseElementsCtr',
            controllerAs: 'courseElementsCtr'
          }
        }
      }).state('main.adminCourseDashboard', {
        url: '/admin/course/:id/dashboard',
        data: {},
        views: {
          '': {
            templateUrl: '/courses/views/admin/dashboard_admin.html',
            controller: 'AdminDashboardCtr',
            controllerAs: 'dashboardCtr'
          }
        }
      }).state('main.import', {
        url: '/admin/course/:id/import',
        data: {},
        views: {
          '': {
            templateUrl: '/courses/views/admin/import.html',
            controller: 'ImportController',
            controllerAs: 'importCtr'
          }
        }
      }).state('main.studentCourseList', {
        url: '/student/courses/all',
        data: {},
        views: {
          '': {
            templateUrl: '/courses/views/student/list_student.html',
            controller: 'StudentCoursesController',
            controllerAs: 'courseCtr'
          }
        }
      }).state('main.studentCourseDashboard', {
        url: '/student/course/:id/dashboard',
        data: {},
        views: {
          '': {
            templateUrl: '/courses/views/student/dashboard_student.html',
            controller: 'StudentDashboardCtr',
            controllerAs: 'dashboardCtr'
          }
        }
      })
  }

})();