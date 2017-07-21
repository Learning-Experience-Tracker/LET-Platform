(function () {
    'use strict';
    angular
        .module('letApp')
        .controller('ImportController', ImportController);

    ImportController.$inject = ['$rootScope', 'ngToast', '$state', '$stateParams', 'Upload'];

    function ImportController($rootScope, ngToast, $state, $stateParams, Upload) {
        var vm = this;

        vm.submit = submit;

        function submit() {
            Upload.upload({
                url: '/api/admin/course/' + $stateParams.id + '/import',
                data: {
                    file: vm.file,
                    type: vm.type
                }
            }).then(function (response) {
                var type = vm.type;
                $('#file').val('');
                vm.type = "";
                ngToast.create({
                    className: 'success',
                    content: type + ' data imported successfully'
                });
            }).catch(function (response) {
                console.log(response);
            });
        }
    }
})();