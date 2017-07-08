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
    }
})();
