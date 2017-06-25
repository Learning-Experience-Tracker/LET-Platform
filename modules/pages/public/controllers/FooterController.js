(function(){
    'use strict';
    angular
        .module('letApp')
        .controller('FooterController',FooterController);

    FooterController.$inject = [];
    
    function FooterController(){
       var vm = this;

       vm.msg = 'Hello World, It\'s me, the App.';
    }
})();
