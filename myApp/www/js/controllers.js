angular.module('starter.controllers', [])
    .controller('MainController', ['$scope', '$ionicSideMenuDelegate', '$utilityFunctions', '$state', function($scope, $ionicSideMenuDelegate, $utilityFunctions, $state) {

        $scope.toggleLeftMenu = function() {
            $ionicSideMenuDelegate.toggleLeft();
        };


        $scope.loadCategory = function(locationId) {
            $utilityFunctions.getEntriesByCategory(locationId).then(function(result) {
                while ($scope.entries.length > 0) {
                    $scope.entries.pop();
                }

                for (var i = 0; i < result.length; i++) {
                    var currentReturnedEntry = result[i];


                    var youtubeId = currentReturnedEntry._id.substr(currentReturnedEntry._id.indexOf("watch?v=") + 8, currentReturnedEntry._id.length);

                    var embedUrl = "https://www.youtube.com/embed/" + youtubeId;


                    var currentEntry = {
                        id: youtubeId,
                        url: embedUrl,
                        title: currentReturnedEntry.title,
                        thumbnailUrl: currentReturnedEntry.thumbnailUrl,
                        youtubeUrl: currentReturnedEntry.url,
                        gender: currentReturnedEntry.gender,
                        minAge: currentReturnedEntry.minAge,
                        maxAge: currentReturnedEntry.maxAge,
                        locations: currentReturnedEntry.locations
                    };

                    $scope.entries.push(currentEntry);
                }
            }, function(error) {
                console.log("Error retrieving entries by category");
            });
        };



        $scope.$on('$ionicView.beforeEnter', function() {
            console.log("getting Entries");
            $scope.entries = [];
            $utilityFunctions.getEntriesByCategory(1).then(function(result) {

                console.dir(result);

                // for (var i = 0; i < result.length; i++) {
                //     var currentReturnedEntry = result[i];
                //     var currentEntry = {
                //         url: currentReturnedEntry._id,
                //         title: currentReturnedEntry.title,
                //         thumbnailUrl: currentReturnedEntry.thumbnailUrl,
                //         youtubeUrl: currentReturnedEntry.url,
                //         gender: currentReturnedEntry.gender,
                //         minAge: currentReturnedEntry.minAge,
                //         maxAge: currentReturnedEntry.maxAge,
                //         locations: currentReturnedEntry.locations
                //     };

                //     $scope.entries.push(currentEntry);
                // }


                console.log($scope.entries);
            }, function(error) {
                console.dir(error);
            });
            $scope.loadEntry = function(id) {
                console.log("adsfas");
                console.log(id);
                var item;
                for (var i = 0; i < $scope.entries.length; i++) {

                    if (id === $scope.entries[i].id) {
                        item = $scope.entries[i];
                        break;
                    }
                }
                console.log("passed item");
                console.log(item);
                parsedItem = JSON.stringify(item);
                $state.go('item', {
                    item: parsedItem
                });
            };
        });



    }]).controller('AddItemController', ['$scope', '$rootScope', '$utilityFunctions', '$ionicPopup', function($scope, $rootScope, $utilityFunctions, $ionicPopup) {

        $scope.item = {
            url: '',
            title: '',
            thumbnailUrl: '',
            youtubeUrl: '',
            gender: [],
            minAge: 0,
            maxAge: 0,
            locations: []
        };



        $scope.getThumbnail = function(youtubeURL) {
            var youtubeId = youtubeURL.substr(youtubeURL.indexOf("watch?v=") + 8, youtubeURL.length);

            var youtubeUrl = "https://www.youtube.com/embed/" + youtubeId;
            $scope.item.thumbnailUrl = "http://img.youtube.com/vi/" + youtubeId + "/0.jpg";
            $scope.item.url = youtubeURL;
            document.getElementById('youtubeIFrame').src = youtubeUrl;
        };


        $scope.addLocation = function(locationId) {

            if (locationId !== "") {
                for (var i = 0; i < $rootScope.locations.length; i++) {
                    if ($rootScope.locations[i].id == locationId) {
                        for (var j = 0; j < $scope.item.locations.length; j++) {
                            if ($scope.item.locations[j].id == locationId) {
                                break;
                            }
                        }

                        if (j == $scope.item.locations.length) {
                            $scope.item.locations.push($rootScope.locations[i]);
                        }
                    }
                }
            }
        };

        $scope.addItem = function() {
            for (var i = 0; i < $scope.genderItems.length; i++) {
                if ($scope.genderItems[i].checked) {
                    $scope.item.gender.push($scope.genderItems[i]);
                }
            }
            $scope.item.maxAge = 100 - $scope.item.maxAge;
            console.dir("Item to be sent");
            console.dir($scope.item);

            $utilityFunctions.insertItem($scope.item).then(function(insertId) {
                //console.dir(insertId);
                console.log("Item inserted successfully");

                // for (var i = 0; i < $scope.item.locations.length; i++) {
                //     $utilityFunctions.insertLocationEntry($scope.item.locations[i].id, insertId);
                // }

                $ionicPopup.alert({
                    template: 'The item has been added successfully',
                    title: 'Item Added'
                });

            }, function(error) {
                console.log("Error in insertion of items");
            });
        };
    }]).controller('ItemController', ['$scope', '$stateParams', '$utilityFunctions', function($scope, $stateParams, $utilityFunctions) {
        console.dir($stateParams);

        $scope.item = {
            title: '',
            youtubeUrl: '',
            minage: 0,
            maxage: 0,
            gender: [],
            locations: []
        };

        $scope.$on('$ionicView.afterEnter', function() {
            console.log('entered');
            var item = JSON.parse($stateParams.item);
            console.log(item);
            document.getElementById('youtubeIFrameItem').src = item.url;
            $scope.title = item.title;
            $scope.thumbnailUrl = item.thumbnailUrl;
            $scope.minage = item.minAge;
            $scope.maxage = item.maxAge;
            $scope.genderItems = item.gender;
            $scope.locations = item.locations;

            // $utilityFunctions.getEntry($stateParams.eid).then(function(result) {
            //     console.log(result);
            //     $utilityFunctions.get3gpUrl(result.youtube_url);
            //     $scope.title = result.title;


            //     document.getElementById('youtubeIFrameItem').src = result.youtube_url;
            //     $scope.thumbnailUrl = result.thumbnail_url;
            //     $scope.minage = result.minage;
            //     $scope.maxage = result.maxage;
            //     $scope.genderItems = JSON.parse(result.gender);
            //     $scope.locations = JSON.parse(result.locations);

            // }, function(error) {
            //     console.log('error retrieving row in controller');
            // });

        });
    }]);