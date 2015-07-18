(function() {
  'use strict';

  angular.module('angularRails')
    .controller('ArticlesController', function ($scope, Articles) {

      Articles.query(function (res) {
        $scope.articles = res;
      });

    });
})();
