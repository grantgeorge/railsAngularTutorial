(function() {
  'use strict';

  angular
    .module('angularRails')
    .run(runBlock);

  /** @ngInject */
  function runBlock($log) {

    $log.debug('runBlock end');
  }

})();
