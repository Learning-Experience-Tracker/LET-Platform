(function(){
    'use strict';
    angular
        .module('letApp')
        .controller('StudentDashboardCtr', StudentDashboardCtr);

    StudentDashboardCtr.$inject = ['CourseService', 'OrganizationService', '$rootScope', 'ngToast', '$state', '$stateParams'];
    
    function StudentDashboardCtr(CourseService, OrganizationService, $rootScope, ngToast, $state, $stateParams){
       var vm = this;

       vm.init = init;

       function init(){
        
       }
    }
})();
