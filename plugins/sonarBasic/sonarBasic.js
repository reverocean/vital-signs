//var sonarMetricsCache = {};
app.directive("sonarBasic", ["proxy", "timer", "$timeout", "underscore", function (proxy, timer, $timeout, underscore) {
    return {
        priority: 0,
        templateUrl: '/resource/html?path=plugins/sonarBasic/sonarBasic.html',
        replace: true,
        transclude: false,
        restrict: 'EA',
        scope: true,
        controller: function ($scope) {
            $scope.sonarBasic = $scope.dashboardConfig.sonarBasic || {};
            var checker = function () {
                angular.forEach($scope.sonarBasic.group, function (group) {
                    var keySet = underscore.map(group.cols, function (c) {
                        return c.key;
                    });
                    var metrics = keySet.join(",");
                    var url = $scope.sonarBasic.url + "api/resources?resource=" + $scope.sonarBasic.resource + "&metrics=" + metrics;
                    var success = function (g) {
                        return function (data) {
                            var result = {};
                            result.status = "success";
                            angular.forEach(data[0].msr, function (m) {
                                result[m.key] = {};
                                result[m.key].value = m.frmt_val;
                                result[m.key].status = "success";
                                var value = m.val;
                                var col = underscore.where(group.cols, {key: m.key})[0];
                                if( col.compare && "less" == col.compare){
                                    if(value > col.benchmark){
                                        result[m.key].status = "failed";
                                    }
                                }

                                if( col.compare && "greater" == col.compare){
                                    if(value < col.benchmark){
                                        result[m.key].status = "failed";
                                    }
                                }

                            });
                            $timeout(function () {
                                g.result = result;

//                                sonarMetricsCache[g.name] = result;
                            });
                        };
                    };
                    proxy.get(url, success(group));
                });
            };
            timer.start(checker);
        }
    };
}]);
