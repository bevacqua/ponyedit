(function(document, ponyedit, angular){
    'use strict';

    var app = angular.module('example', []);

    app.directive('ponyeditable', [
        '$rootScope',
        function ($rootScope) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var dom = element[0];
                    ponyedit.init(dom);
                    $rootScope.$broadcast('pony', dom);
                }
            };
        }
    ]);

    app.controller('exampleCtrl', [
        '$scope',
        function ($scope) {
            $scope.$on('pony', function (e, element) {
                var pony = ponyedit(element);

                $scope.state = {};
                $scope.setBold = pony.setBold.bind(pony);
                $scope.setItalic = pony.setItalic.bind(pony);
                $scope.decreaseSize = pony.decreaseSize.bind(pony);
                $scope.increaseSize = pony.increaseSize.bind(pony);

                pony.on('report.*', function (value, property) {
                    $scope.state[property] = value;

                    if (!$scope.$$phase) {
                        $scope.$apply();
                    }
                });
            });
        }
    ]);
})(document, ponyedit, angular);
