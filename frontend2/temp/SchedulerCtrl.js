angular.module('app').controller('PostCtrl', function ($scope, $http) {

  $scope.post = function () {

    var datetime = new Date($scope.date.getFullYear(), $scope.date.getMonth(), $scope.date.getDate(), $scope.time.getHours(), $scope.time.getMinutes());

    console.log($scope.time);
    console.log($scope.date);
    console.log(datetime);

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
