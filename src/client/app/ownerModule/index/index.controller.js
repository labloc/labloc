(function () {
    'use strict';

    angular
        .module('app.owner')
        .controller('oIndexController', IndexController);

    /* @ngInject */
    function IndexController($cookies, ngDialog, dataservice) {
        var vm = this;
        var id = $cookies.getObject('user').id;
        vm.consumptions = [];
        vm.title = 'Index';

        vm.addNewModal = addNewModal;
        vm.editModal = editModal;
        vm.getIndexHistory = getIndexHistory;
        vm.consumers = [];
        vm.monthsList = ['Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie', 'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'];

        getConsumers();

        function addNewModal() {
            var dialog = ngDialog.open({
                template: 'app/ownerModule/index/addIndex.html',
                data:{id: id, consumers: vm.consumers},
                controller: function ($scope, dataservice, logger) {
                    $scope.index = {};
                    $scope.addIndex = addIndex;
                    var id= $scope.ngDialogData.id;

                    function addIndex(index) {
                        var reqObj = _.reduce(index.consume, function(result, item, key){
                            if(item){
                                result.push({
                                    month: moment(index.date).format('YYYY-MM-DD'),
                                    index: parseInt(item),
                                    consumer: parseInt(key)
                                });
                            }
                            return result;
                        },[]);

                        _.forEach(reqObj, function (item){
                            var request = {consumption: item};
                            makeRequest(request);
                        });

                        $scope.closeThisDialog();

                    }

                    function makeRequest(obj){
                        dataservice.owners.addIndex(id, obj)
                            .then(function (res) {
                                logger.success('Saved!');
                            })
                            .catch(function (err) {
                                if( err.data){
                                    logger.error(err.data[0]);
                                } else {
                                    logger.error(err);
                                }
                            });
                    }
                }
            });

            dialog.closePromise.then(function () {
                getIndexHistory();
            });
        }

        function getConsumers() {
            dataservice.owners.getConsumers()
                .then(function (res) {
                    vm.consumers = res.consumer;
                    getIndexHistory();
                })
                .catch(function (err) {
                    if( err.data){
                        logger.error(err.data[0]);
                    } else {
                        logger.error(err);
                    }
                });;
        }

        function getIndexHistory() {
            dataservice.owners.getIndex(id)
                .then(function (res) {
                    _.forEach(res.consumption, function (item) {
                        if (item.month) {
                            item.monthNumber = moment(item.month).month();
                        }
                    });
                    vm.consumptions = res.consumption;
                });

        }

        function editModal(con){
            var dialog = ngDialog.open({
                template: 'app/ownerModule/index/editIndex.html',
                data:{id: id, con: con},
                controller: function ($scope, dataservice, logger) {
                    var id= $scope.ngDialogData.id;
                    $scope.index = $scope.ngDialogData.con;
                    var conId = $scope.index.id;
                    $scope.index.new = {
                        month: new Date($scope.index.month),
                        index: parseInt($scope.index.index),
                        consumer: parseInt($scope.index.consumer.id)
                    };

                    $scope.saveIndex = saveIndex;

                    function saveIndex(index) {
                        var obj= {consumption: {
                            month: moment(index.month),
                            index: parseInt(index.index),
                            consumer: parseInt($scope.index.consumer.id)
                        }};
                        dataservice.owners.putIndex(id, conId, obj)
                            .then(function (res) {
                                logger.success('Saved!');
                                $scope.closeThisDialog();
                            })
                            .catch(function (err) {
                                if( err.data){
                                    logger.error(err.data[0]);
                                } else {
                                    logger.error(err);
                                }
                            });
                    }
                }
            });

            dialog.closePromise.then(function () {
                getIndexHistory();
            });
        }

    }
})();
