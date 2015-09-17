angular.module('app').controller('SchedulerCtrl', function ($scope, $http) {

  $scope.post = function () {

    var datetime = new Date($scope.date.getFullYear, $scope.date.getMonth, $scope.date.getDay, $scope.getHours, $scope.date.getMinutes, $scope.date.getSeconds);

    $http.post('/api/post/post', {
      message: $scope.message,
      datetime: datetime
    }).then(function () {

    });
  }

  $scope.time = new Date();

  $scope.minDate = new Date();

  $scope.opened = false;

  $scope.open = function ($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = !$scope.opened;
  }
})
