// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])

.run(['$ionicPlatform', '$utilityFunctions', '$rootScope', function($ionicPlatform, $utilityFunctions, $rootScope) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    $utilityFunctions.createDB();
    $utilityFunctions.createTables();

  });

  $rootScope.genderItems = [{
      id: 1,
      value: "M",
      label: "Male",
      checked: false,
      icon : 'ion-man'
  }, {
      id: 2,
      value: "F",
      label: "Female",
      checked: false,
      icon : 'ion-woman'
  }];

  $rootScope.locations = [{
      id: 1,
      label: "Near Theatres",
      icon : "ion-film-marker"
  }, {
      id: 2,
      label: "Near Shopping Malls",
      icon : 'ion-bag'
  }, {
      id: 3,
      label: "Near Signals",
      icon : 'ion-model-s'
  },{
      id: 5,
      label: "Near Airports",
      icon : 'ion-plane'
  },{
      id: 6,
      label: "Party Halls",
      icon : 'ion-beer'
  },{
      id: 7,
      label: "Cafe Centers",
      icon : 'ion-at'
  }];
  x2js = new X2JS();
}])
.config(function($stateProvider, $urlRouterProvider) {


  $stateProvider
    .state('main', {
    url: "/main",
    templateUrl: "templates/main.html",
    controller : "MainController"
  })
    .state('add_item', {
      url : "/add_item",
      templateUrl : "templates/add_item.html",
      controller : "AddItemController"
    })
    .state('item', {
      url : '/item:item',
      templateUrl : "templates/item.html",
      controller: "ItemController"
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/main');

});
