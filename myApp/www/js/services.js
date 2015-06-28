var db;

angular.module('starter.services', []).factory('$utilityFunctions', ['$q', '$http', function($q, $http) {
    return {
        createDB: function() {
            db = openDatabase("myapp", '1.0', 'PassMan DB', 2 * 1024 * 1024);
        },
        createTables: function() {
            console.log("createing tables");
            db.transaction(function(tx) {
                //tx.executeSql("DROP TABLE IF EXISTS TABLE_ENTRY");
                //tx.executeSql("DROP TABLE IF EXISTS TABLE_CMAP");
                tx.executeSql("CREATE TABLE IF NOT EXISTS TABLE_ENTRY(eid integer PRIMARY KEY, title text, youtube_url text, thumbnail_url text, minage integer, maxage integer, gender text, locations text)", [], function(tx, sqlResultSet) {
                    console.log("Table has been created.");
                }, function(tx, sqlError) {
                    console.dir(sqlError);
                });
                tx.executeSql("CREATE TABLE IF NOT EXISTS TABLE_CMAP(lid integer , eid integer)", [], function(tx, sqlResultSet) {
                    console.log("Table has been created.");
                }, function(tx, sqlError) {
                    console.dir(sqlError);
                });

            });
        },
        insertItem: function(item) {
            var deferred = $q.defer();
            console.log(JSON.stringify(item));
            $http.post('http://advertisement-delivery-system.mybluemix.net/cloudant/insertVideoConfig?item=' + JSON.stringify(item)).success(function(data, status, headers, config) {
                console.log("item remotely inserted successfully");
                console.log(data);
                deferred.resolve();
            }).error(function(data, status, headers, config) {
                console.log("error inserting an item remotely");
                console.log(data);
                deferred.reject();
            });


            // db.transaction(function(tx) {
            //     tx.executeSql("INSERT INTO TABLE_ENTRY (title, youtube_url, thumbnail_url, minage, maxage, gender, locations) values(?, ?, ?, ?, ?, ?, ?)", [item.title, item.url, item.thumbnailUrl, item.minAge, item.maxAge, JSON.stringify(item.gender), JSON.stringify(item.locations)], function(tx, result) {
            //         console.log("rows inserted successfully");
            //         console.dir(result);
            //         deferred.resolve(result.insertId);
            //     }, function(tx, error) {
            //         console.log(error);
            //         console.log('Error in inserting item');
            //         deferred.reject();
            //     });
            // });

            return deferred.promise;
        },
        insertLocationEntry: function(lid, eid) {
            var deferred = $q.defer();

            db.transaction(function(tx) {
                tx.executeSql("INSERT INTO TABLE_CMAP (lid, eid) VALUES (?, ?)", [lid, eid], function(tx, result) {
                    console.dir(result);
                    console.log("rows inserted successfully");
                    deferred.resolve();
                }, function(tx, error) {
                    console.log(error);
                    console.log('Error in inserting location entry');
                    deferred.reject();
                });
            });

            return deferred.promise;
        },
        getAllEntries: function() {
            // var deferred = $q.defer();

            // db.transaction(function(tx) {
            //     tx.executeSql("SELECT * FROM TABLE_ENTRY", [], function(tx, result) {
            //         console.dir(result);
            //         console.log("retrieved all entries successfully");
            //         deferred.resolve(result.rows);
            //     }, function(tx, error) {
            //         console.log(error);
            //         console.log('Error in inserting item');
            //         deferred.reject();
            //     });
            // });

            // return deferred.promise;
            this.getEntriesByCategory(1);
        },
        getEntriesByCategory: function(locationId) {
            var deferred = $q.defer();

            $http.get('http://advertisement-delivery-system.mybluemix.net/cloudant/getVideoConfigForLocation?locationId=' + locationId).success(function(data, status, headers, config) {
                console.log("item remotely retrieved successfully");
                console.log(data);
                deferred.resolve(data);
            }).error(function(data, status, headers, config) {
                console.log("error remotely retrieving an item");
                console.log(data);
                deferred.reject();
            });

            // db.transaction(function(tx) {
            //     tx.executeSql("SELECT TABLE_ENTRY.eid, title, thumbnail_url, locations, lid FROM TABLE_CMAP JOIN TABLE_ENTRY ON TABLE_ENTRY.eid = TABLE_CMAP.eid WHERE TABLE_CMAP.lid = ?", [locationId], function(tx, result) {
            //         console.dir(result);
            //         console.log("retrieved all entries for category successfully");
            //         deferred.resolve(result.rows);
            //     }, function(tx, error) {
            //         console.log(error);
            //         console.log('Error in inserting item');
            //         deferred.reject();
            //     });
            // });

            return deferred.promise;
        },
        getEntry: function(eid) {
            var deferred = $q.defer();

            db.transaction(function(tx) {
                tx.executeSql("SELECT * FROM TABLE_ENTRY WHERE eid = ?", [eid], function(tx, result) {
                    console.dir(result);
                    console.log("retrieving the required entry successfully");
                    deferred.resolve(result.rows.item(0));
                }, function(tx, error) {
                    console.log(error);
                    console.log('Error in inserting item');
                    deferred.reject();
                });
            });

            return deferred.promise;
        },
        get3gpUrl : function(youtubeUrl) {
            var youtubeId = youtubeUrl.substr(youtubeUrl.indexOf("embed") + 8, youtubeUrl.length);
           
            $http.get("http://gdata.youtube.com/feeds/api/videos/" + youtubeId).success(function(data, status, headers, config) {
                console.log("success while geting 3gp url");
                jsonData = x2js.xml_str2json(data);
                console.dir(jsonData);
            }).error(function(data, status, headers, config) {
                console.log("error while retireving 3gp url");
                console.log(data);
            });
        }
    };
}]);