angular.module('app', ['satellizer', 'ui.bootstrap', 'ui.router', 'ngAnimate', 'toastr'])
  .config(function ($authProvider, $stateProvider, toastrConfig) {

    $authProvider.twitter({
      url: '/api/user/login'
    });

    $authProvider.facebook({
      clientId: '114487072232658',
      url: '/api/user/facebookLogin'
    });

    $stateProvider.state('posts', {
      url: '/',
      templateUrl: 'myposts.html',
      controller: 'MyPostsCtrl'
    }).state('editPost', {
      url: '/post?id',
      templateUrl: 'post.html',
      controller: 'PostCtrl'
    }).state('newPost', {
      url: '/post',
      templateUrl: 'post.html',
      controller: 'PostCtrl'
    })

    toastrConfig.positionClass = 'toast-bottom-right';

  })
  .run(function ($rootScope, $window, $auth) {
    if ($auth.isAuthenticated()) {
      $rootScope.currentUser = JSON.parse($window.localStorage.currentUser);
    }
  });
