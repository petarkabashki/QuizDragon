'use strict';

/* App Module */

var quizApp = angular.module('quizApp', ['ngRoute', 'ngLocale']).run(function($rootScope){
    $rootScope.brand = "QuizDragon";
});

quizApp.service('QuizService', ['$http', function ($http) {
    var quizes = null;

    var quizMapper = function (quizes) {
        return  _.map(quizes, function (v) {
            return {id: v.id, title: v.title}
        });
    };

    this.getQuizes = function (callback) {
        if (quizes) {
            callback(quizes);
        }
        else {
            $http({method: 'GET', url: 'js/questions.json.js'}).
                success(function (data, status, headers, config) {
                    quizes = data;
                    callback(quizes);
                });
        }
    };
    

    this.getQuiz = function (qzId, callback) {
        this.getQuizes(function (quizes) {
            callback(_.find(quizes, { 'id': qzId }));
        });
    };

    this.getQuestionRing = function(qzId, callback){
        this.getQuiz(qzId, function(quiz){

            var questionRing = {
                first: {},
                bag: {}
            };

            var first = {};

            var i = 0;

            questionRing.last = _.foldl(quiz.questions, function(accumulator, value, index, collection){
                var item = {
                    id: value.id,
                    value: value,
                    prev: accumulator,
                    index: i++
                };

                accumulator.next = item;

                questionRing.bag[value.id] = item;

                return item;
            }, first);

            questionRing.first = first.next;
            delete questionRing.first.prev;

            callback(questionRing);
        });

    };

    this.getQuizQuestion = function (quizId, questionId, callback) {
        this.getQuiz(quizId, function (quiz) {
            callback(_.find(quiz.questions, { 'id': questionId }));
        });

    };

}]);

quizApp.controller('HomeController', ['$scope', '$location', 'QuizService',
        function ($scope, $location, quizService) {
            quizService.getQuizes(function (quizes) {
                $scope.quizes = quizes;
            })

            $scope.createQuiz = function(title){
                var newQuiz = {
                    id: '' + Math.random(),
                    title: title,
                    questions: []
                };

                $scope.quizes.push(newQuiz);
                var path = "/qz-" + newQuiz.id + "/edit";
                $location.path(path);
            };
        }]
);

quizApp.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/', {
                templateUrl: 'partials/home.html',
                controller: 'HomeController'
            }).
            when('/qz-:qzId/edit', {
                templateUrl: 'partials/edit-quiz.html',
                controller: 'EditQuizController'
            }).
            when('/qz-:qzId/qn-:qnId/edit', {
                templateUrl: 'partials/edit-question.html',
                controller: 'EditQuestionController'
            }).
            when('/q/:qId', {
                templateUrl: 'partials/question.html',
                controller: 'QuestionController1'
            }).
            when('/qz-:qzId', {
                templateUrl: 'partials/run-quiz.html',
                controller: 'RunQuizController'
            }).
            when('/qz-:qzId/qn-:qnId', {
                templateUrl: 'partials/run-quiz-question.html',
                controller: 'RunQuizQuestionController'
            }).
            otherwise({
                redirectTo: '/'
            });
    }
]);

quizApp.controller('EditQuizController', ['$scope', '$location', '$routeParams', 'QuizService',
        function ($scope, $location, $routeParams, quizService) {

            quizService.getQuiz($routeParams.qzId, function (quiz) {
                $scope.quiz = quiz;
            });

            $scope.addQuestion = function(title){
                var newQuestion = {
                    title: title,
                    id: '' + Math.random(),
                    type: 'single',
                    answers: [
                    ]
                };

                $scope.quiz.questions.push(newQuestion);

                $scope.newQTitle = null;

                var path = "/qz-" + $scope.quiz.id + "/qn-" + newQuestion.id + "/edit";
                console.log(path);
                $location.path(path);

            };

        }]
);

quizApp.controller('EditQuestionController', ['$scope', '$routeParams', 'QuizService',
        function ($scope, $routeParams, quizService) {

            quizService.getQuiz($routeParams.qzId, function (quiz) {
                $scope.quiz = quiz;
            });

            quizService.getQuizQuestion($routeParams.qzId, $routeParams.qnId, function (question) {
                $scope.question = question;
            });

            $scope.addAnswer = function () {
                if (!this.newAnswer) return;
                $scope.question.answers.push(this.newAnswer);
                this.newAnswer = null;
            };

            $scope.removeAnswer = function (index) {
                $scope.question.answers.splice(index, 1)
            };
        }]
);

quizApp.controller('RunQuizController', ['$scope', '$routeParams', 'QuizService',
        function ($scope, $routeParams, quizService) {
            quizService.getQuiz($routeParams.qzId, function (quiz) {
                $scope.quiz = quiz;
            });
        }]
);

quizApp.controller('RunQuizQuestionController', ['$scope', '$routeParams', 'QuizService',
        function ($scope, $routeParams, quizService) {

            quizService.getQuiz($routeParams.qzId, function (quiz) {
                $scope.quiz = quiz;
            });

            quizService.getQuestionRing($routeParams.qzId, function (qRing) {
                $scope.current = qRing.bag[$routeParams.qnId];
            });

            quizService.getQuizQuestion($routeParams.qzId, $routeParams.qnId, function (question) {
                $scope.question = question;
            });

        }]
);

quizApp.directive('EditQuestion', function () {
    return {
        restrict: 'E',
        scope: {
            question: "="
        },
        templateUrl: 'partials/edit-question.html'
    };
});


quizApp.directive('pkPanel', function () {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            title: "=title"
        },
        template: '<div class="panel panel-default"><div class="panel-heading"><h4><strong>{{title}}</strong></h4></div><div class="panel-body" ng-transclude></div></div>'

    };
});


quizApp.directive('pkFormGroup', function () {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            title: "=title"
        },
        template: '<div class="form-group"><label class="">{{title}}</label><div class="input-group" ng-transclude=""></div></div>'

    };
});

/*
quizApp.directive('pkTextAdd', function () {
    return {
        restrict: 'E',
        transclude: true,
        replace: true,
        scope: {
            placeholder: "="
        },
        template: '<div><input type="text" class="form-control" ng-model="newQTitle" placeholder="placeholder"><div class="input-group-btn"><button class="btn btn-default" type="button"><i class="glyphicon glyphicon-plus"></i></button></div></div>'

    };
});*/
