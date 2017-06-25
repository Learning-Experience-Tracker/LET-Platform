(function(){
'use strict';

angular
    .module('letApp')
    .factory('UserService', UserService);

    UserService.$inject = ['$rootScope', '$http', '$location', '$stateParams', '$q', '$timeout','$window', '$localStorage', '$state'];

    function UserService ($rootScope, $http, $location, $stateParams, $q, $timeout,$window, $localStorage, $state) {

            var self;

            function UserServiceKlass() {
                this.name = 'guest';
                this.user = {};
                this.loggedin = false;
                this.isAdmin = false;
                this.loginError = null;
                self = this;
            }


            var UserServiceK = new UserServiceKlass();
            
            UserServiceKlass.prototype.login = login;
            UserServiceKlass.prototype.onIdentity = onIdentity;
            UserServiceKlass.prototype.onIdFail = onIdFail;
            UserServiceKlass.prototype.logout = logout;
            UserServiceKlass.prototype.signup = signup;
            
            return UserServiceK;

            function login(user) {                                
                $http.post('/api/login', {
                        username: user.username,
                        password: user.password
                    }).then(function(res) {
                        self.onIdentity(res.data);
                    })
                    .catch(function(err) {
                        self.onIdFail(err);
                    });
            }

            function onIdentity(response){
                console.log('success');
                console.log(response);

                self.loggedin = true;
                self.name = response.user.name;
                self.user = response.user;

                //local storage jwt                
                $localStorage.token = response.token;
                $localStorage.user = response.user;
                $localStorage.authenticated = true;

                //setup Authorization header
                $http.defaults.headers.common.Authorization = 'JWT ' + response.token;

                $rootScope.$emit('loginSuccess');  
            }

            function onIdFail(err){
                console.log('fail ' + err);
                $rootScope.$emit('loginFailed');  
            }

            function logout(){
                self.loggedin = false;
                self.name = '';
                self.user = {};

                //local storage jwt                
                $localStorage.$reset();

                //setup Authorization header
                $http.defaults.headers.common.Authorization = '';

                $rootScope.$emit('logoutSuccess');  
            }

            function signup(user){
                $http.post('/api/register', {
                        username: user.username,
                        password: user.password,
                        name : user.name
                    }).then(function(res) {
                        self.onIdentity(res.data);
                    })
                    .catch(function(err) {
                        console.log(err);
                        $rootScope.$emit('signupFailed');
                    });
            }
    }


})();
