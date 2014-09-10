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
                                result[m.key] = m.frmt_val;
                                result[m.key+"value"] = m.val;
//                                if(sonarMetricsCache[g.name]){
//                                    var metrics = sonarMetricsCache[g.name];
//                                    if(g.compare == "less"){
//                                        if(metrics[m.key+"value"] < m.val){
//                                            result.status = "failed"
//                                        }
//                                    }
//
//                                    if(g.compare == "greater"){
//                                        if(metrics[m.key+"value"] > m.val){
//                                            result.status = "failed"
//                                        }
//                                    }
//
//                                }
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
