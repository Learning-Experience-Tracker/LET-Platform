(function(){
    'use strict';
    angular
        .module('letApp')
        .controller('MainController',MainController);

    MainController.$inject = [];
    
    function MainController(){
       var vm = this;

       vm.msg = 'Hello World, It\'s me, the App.';
    }
})();
