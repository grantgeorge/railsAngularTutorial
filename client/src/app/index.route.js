(function() {
  'use strict';

  angular
    .module('angularRails')
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainController',
        controllerAs: 'main'
      })
      .state('articles', {
        url: '/articles',
        templateUrl: 'app/components/articles/articles.html',
        controller: 'ArticlesController'
      });

    $urlRouterProvider.otherwise('/');
  }

})();
