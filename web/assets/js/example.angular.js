(function(document, ponyedit, angular){
    'use strict';

    var app = angular.app('example', []);

    app.directive('ponyeditable', [
        'ponyeditService',
        function (ponyeditService) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    ponyedit.init(element);
                }
            };
        }
    ]);

    app.controller('exampleCtrl', [
        '$scope', '$attrs',
        function ($scope, $attrs) {

            // this is definitely not the best way to get the element, though
            var element = document.querySelector('.editable');
            var pony = ponyedit.find(element);

            $scope.state = {};
            $scope.setBold = pony.setBold.bind(pony);
            $scope.setItalic = pony.setItalic.bind(pony);
            $scope.decreaseSize = pony.decreaseSize.bind(pony);
            $scope.increaseSize = pony.increaseSize.bind(pony);

            pony.on('report.*', function (value, property) {
                $scope.state[property] = value;
            });
        }
    ]);
})(document, ponyedit, angular);
