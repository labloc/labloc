(function() {
    'use strict';

    angular
        .module('app.layout')
        .controller('ShellController', ShellController);

    /* @ngInject */
    function ShellController($rootScope, $timeout, config, logger, $cookies, $state, authService) {
        var vm = this;
        var auth = $cookies.get('loggedIn');
        vm.busyMessage = 'Please wait ...';
        vm.isBusy = true;
        $rootScope.showSplash = true;
        $rootScope.loggedUser = $cookies.getObject('user');
        vm.navline = {
            title: config.appTitle,
            text: ($rootScope.loggedUser)?$rootScope.loggedUser.username : '--',
            link: '/login'
        };

        activate();

        function activate() {
            logger.success(config.appTitle + ' loaded!', null);
            $.material.init();
            hideSplash();
            checkUser();
        }

        function hideSplash() {
            //Force a 1 second delay so we can see the splash.
            $timeout(function() {
                $rootScope.showSplash = false;
            }, 1000);
        }

        function checkUser(){
            if (_.isUndefined($rootScope.loggedUser)){
                $state.go('login');
            }

            if(auth){
                authService.setAuthHeader(auth);
            }

            //routeUser($rootScope.loggedUser);
        }

        function routeUser(user){
            if(_.isUndefined(user)) return;

            if (user.role === 'administrator') {
                $state.go('administrator');
            } else {
                $state.go('owner');
            }
        }
    }
})();
