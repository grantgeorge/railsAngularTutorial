(function() {
  'use strict';

  angular.module('angularRails')
    .controller('ArticlesController', function ($scope, Articles) {

      Articles.query(function (res) {
        console.log(res);
        $scope.articles = res;
      })

    });
})();
