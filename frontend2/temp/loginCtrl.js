angular.module('app').controller('LoginCtrl', function ($scope, $window, $rootScope, $auth, $http) {
  $scope.login = function (provider) {
    $auth.authenticate(provider).then(function (response) {
      //console.log(response);
      $window.localStorage.currentUser = JSON.stringify(response.data.user);
      $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
    });
  }

  $scope.isAuthenticated = $auth.isAuthenticated;

  $scope.logout = function () {
    $auth.logout();
  }

  $scope.displayName = $auth.getPayload()
})
