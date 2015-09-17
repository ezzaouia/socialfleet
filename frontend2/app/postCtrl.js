angular.module('app').controller('PostCtrl', function ($scope, $state, $http, $location, toastr) {

      var id = $location.search().id;

      $scope.delete = deletePost;

      $scope.isEditing = isEditingPost;

      $scope.time = new Date();

      $scope.minDate = new Date();

      $scope.opened = false;

      $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = !$scope.opened;
      }

      if (isEditingPost()) {
        getPost();
        $scope.save = editPost;
        $scope.saveOrEdit = 'Edit';
      } else {
        $scope.save = newPost;
        $scope.saveOrEdit = 'Save';
      }

      function newPost() {
        var datetime = new Date($scope.date.getFullYear(), $scope.date.getMonth(), $scope.date.getDate(), $scope.time.getHours(), $scope.time.getMinutes());

        $http.post('/api/post/post', {
          message: $scope.message,
          datetime: datetime
        }).then(function () {
          toastr.success('New post have created.');
        });
      }

      function getPost() {
        $http.get('/api/post/' + id).then(function (post) {
          $scope.message = post.data.message;
          $scope.date = new Date(post.data.datetime);
          $scope.time = new Date(post.data.datetime);
        });
      }

      function editPost() {
        var datetime = new Date($scope.date.getFullYear(), $scope.date.getMonth(), $scope.date.getDate(), $scope.time.getHours(), $scope.time.getMinutes());

          $http.post('/api/post/update/' + id, {
            message: $scope.message,
            datetime: datetime
          }).then(function () {
            toastr.info('New post have been edited.');
          });
        $state.go('posts');
        }

        function deletePost() {
          $http.post('/api/post/destroy/' + id).then(function () {
              toastr.warning('the post have been deleted.');
          });
          $state.go('posts');
        }

        function isEditingPost() {
          return id;
        }


      });

angular.module('app').directive('datepickerPopup', function () {
	return {
		restrict: 'EAC',
		require: 'ngModel',
		link: function (scope, element, attr, controller) {
			//remove the default formatter from the input directive to prevent conflict
			controller.$formatters.shift();
		}
	}
})