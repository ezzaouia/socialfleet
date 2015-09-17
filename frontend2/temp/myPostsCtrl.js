angular.module('app').controller('MyPostsCtrl', function ($scope, $http) {
  $http.get('api/post/myPosts').then(function (posts) {
    $scope.posts = posts.data;
    console.log(posts.data)
  })
});
