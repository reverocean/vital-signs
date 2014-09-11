app.filter("duration",function () {
    var calculateDuration = function (inuput) {
        var durationSec = parseInt(inuput, 10);
        var minutes = parseInt(durationSec / (60 * 1000), 10);
        var secs = parseInt((durationSec % (60 * 1000)) / 1000, 10);

        return minutes + " mins, " + secs + " secs";
    };
    return calculateDuration;
}).filter("notEmpty", ['underscore', function (underscore) {
    return function (input) {
        return underscore.filter(input, function (item) {
            return !!item;
        });
    };
}]).directive("jenkins", ["proxy", "timer", "$timeout", function (proxy, timer, $timeout) {
    return {
        priority:0,
        templateUrl:'/resource/html?path=plugins/jenkins/jenkins.html',
        replace:true,
        transclude:false,
        restrict:'EA',
        scope:true,
        controller:function ($scope) {
            var jenkinsUrl = $scope.dashboardConfig.jenkins.url;
            var jenkinsJobs = $scope.dashboardConfig.jenkins.jobs;

            $scope.jobsData = [];

            if (jenkinsJobs == null) {
                return;
            }
            var countOfJobs = jenkinsJobs.length;
            if (countOfJobs === undefined || countOfJobs === 0) {
                return;
            }
            var projectsByRow = 1;
            var rows = Math.ceil(countOfJobs / projectsByRow);


            $scope.newCss = {
                width:(99 / projectsByRow) + '%',
                height:97 / rows + '%',
                margin:(1 / (rows * 2)) + '% ' + (1 / (projectsByRow * 2)) + '%'
            };

            var handleJobFlag = false;

            var handleJob = function (jobData, index) {
                if("FAILURE" == jobData.result){
                    $scope.jobsData[0] = jobData;
                }else{
                    if(!handleJobFlag){
                        $scope.jobsData[0] = jobData;
                    }
                }

                handleJobFlag = true;
//                $scope.jobsData[index] = (jobData);
            };

            var getJenkinsJobs = function () {
//                $scope.jobsData[0] = {
//                    result: 'SUCCESS'
//                }


                handleJobFlag = false;
                var fun = function (index) {
                    return function (jobData) {
                        $timeout(function () {
                            handleJob(jobData, index);
                        });
                    };
                };

                for (var jobIndex = 0; jobIndex < jenkinsJobs.length; jobIndex++) {
                    proxy.get(jenkinsUrl + '/job/' + jenkinsJobs[jobIndex] +
                        '/lastBuild/api/json?pretty=true', fun(jobIndex));
                }
            };
            timer.start(getJenkinsJobs);
        }
    };
}]);
