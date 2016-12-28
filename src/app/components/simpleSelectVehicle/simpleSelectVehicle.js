/**
 * Created by Administrator on 2016/12/28.
 */
/**
 * Created by Administrator on 2016/11/8.
 */
(function () {
  'use strict';
  angular
    .module('shopApp')
    .directive('simpleSelectVehicle', simpleSelectVehicle);

  /**
   * data         获取交互数据
   * config       配置信息
   * selectItem   返回数据
   */

  /** @ngInject */
  function simpleSelectVehicle($filter, $timeout, $window, vehicleSelection) {
    function getSeriesTitle(collection, target){
      var regular = new RegExp('^'+target);
      return regular.test(collection) ? collection : collection + " " + target;
    }
    /**
     * 设置格式化数据，供页面好操作
     * @param level
     * @param data
     * @param item
     */
    var setFormatData = function(level, data, item){
      console.log('setFormatData', level, data, item);

      _.forEach(data, function(value){
        value.level = level;
        if(!value.title && value.level == 1){
          value.title = value.brand;
        }else if(!value.title && value.level == 2){
          value.title = getSeriesTitle(value.series, item.brand);
        }else if(!value.title && value.level == 3){
          value.title = item.title +" "+ value.year;
        }else if(!value.title && value.level == 4){
          value.title = item.title +" "+ value.output;
        }else if(!value.title && value.level == 5){
          value.title = value.model;
        }
        if(angular.isUndefined(value.logo)){
          value.logo = item.logo;
        }
        if(angular.isUndefined(value.firstletter)){
          value.firstletter = item.firstletter;
        }
        if(angular.isUndefined(value.brand)){
          value.brand = item.brand;
        }
        if(angular.isUndefined(value.brandid) && value.level == 1){
          value.brandid = value.id;
        }else{
          value.brandid = item.brandid;
        }
        if(angular.isUndefined(value.seriesid) && value.level > 1){
          if(item && item.seriesid){
            value.seriesid = item.seriesid
          }else{
            value.seriesid = value.id;
          }
        }
        if(angular.isUndefined(value.series) && value.level > 1){
          value.series = item.series;
        }
        if(angular.isUndefined(value.yearid) && value.level > 2){
          if(item && item.yearid){
            value.yearid = item.yearid
          }else{
            value.yearid = value.id;
          }
        }
        if(angular.isUndefined(value.year) && value.level > 2){
          value.year = item.year;
        }
        if(angular.isUndefined(value.outputid) && value.level > 3){
          if(item && item.outputid){
            value.outputid = item.outputid
          }else{
            value.outputid = value.id;
          }
          if(angular.isUndefined(value.output)){
            value.output = item.output;
          }
        }
      });
      return data;
    };

    /**
     * 根据等级来定义删除项
     * @param item     当前项
     * @param key      列表当前项
     * @param level    当前等级
     */
    var isRemoveChecked = function(item, key, level){
      return {
        "1": key.brandid == item.brandid && angular.isUndefined(key.seriesid),
        "2": key.brandid == item.brandid && key.seriesid == item.seriesid && angular.isUndefined(key.year),
        "3": key.brandid == item.brandid && key.seriesid == item.seriesid && key.year == item.year && angular.isUndefined(key.outputid),
        "4": key.brandid == item.brandid && key.seriesid == item.seriesid && key.year == item.year && key.outputid == item.outputid && angular.isUndefined(key.modelid),
        "5": key.brandid == item.brandid && key.seriesid == item.seriesid && key.year == item.year && key.outputid == item.outputid && key.modelid == item.modelid
      }[level];
    };

    /**
     * 是否可以添加
     * @param item
     * @param key
     * @param level
     * @returns {*}
     */
    var isAddChecked = function (item, key, level) {
      return {
        1: key.brandid == item.brandid,
        2: key.brandid == item.brandid,
        3: key.brandid == item.brandid && key.seriesid == item.seriesid,
        4: key.brandid == item.brandid && key.seriesid == item.seriesid && key.year == item.year,
        5: key.brandid == item.brandid && key.seriesid == item.seriesid && key.year == item.year && key.outputid == item.outputid
      }[level];
    };
    return {
      restrict: "A",
      scope: {
        select: "="
      },
      templateUrl: "app/components/simpleSelectVehicle/simpleSelectVehicle.html",
      link: function (scope, iElement, iAttrs) {
        console.log(1);

        /**
         * 缓存数组
         * @type {Array}
         */
        var list = [];

        /**
         * 获取车辆品牌列表
         */
        vehicleSelection['brand']().then(function (data) {
          list = data.data.data;
          scope.brandList = setFormatData(1, data.data.data);
          scope.list = [];
          if (!angular.isUndefined(scope.select)) {
            if(angular.isArray(scope.select)){
              getSelect(scope.select);
            }else{
              getSelect($window.eval(decodeURI(scope.select)));
            }
          }
        });




        /**
         * 设置列表
         * 自动去重排序返回一个新列表
         * @param list
         */
        function setList(list) {
          scope.list.push(list);
          scope.list = _.sortBy(_.uniq(scope.list), 'brandid');
        }


        var clearSubkeys = {
          'series': function () {
            scope.seriesList = [];
            scope.yearList = [];
            scope.outputList = [];
            scope.modelList = [];
            return scope.brandList;
          },
          'year': function () {
            scope.yearList = [];
            scope.outputList = [];
            scope.modelList = [];
            return scope.seriesList;
          },
          'output': function () {
            scope.outputList = [];
            scope.modelList = [];
            return scope.yearList;
          },
          'model': function () {
            scope.modelList = [];
            return scope.outputList;
          }
        };
        var getSubmitData = {
          'series': function (item) {
            return {
              brandid: item.brandid
            };
          },
          'year': function (item) {
            return {
              brandid: item.brandid,
              seriesid: item.seriesid
            };
          },
          'output': function (item) {
            return {
              brandid: item.brandid,
              seriesid: item.seriesid,
              year: item.year
            };
          },
          'model': function (item) {
            return {
              brandid: item.brandid,
              seriesid: item.seriesid,
              year: item.year,
              outputid: item.outputid
            };
          }
        };
        /**
         * 加载子数据
         * @param level    当前等级
         * @param item     当前项
         * @param type     当前类型
         * @param listType 当前列表类型
         * @param callback 回调函数
         * @constructor
         */
        function loadingSubData(level, item, type,listType, callback){
          vehicleSelection[type](getSubmitData[type](item)).then(function (data) {
            item.items = setFormatData(level, data.data.data, item);
            scope[listType] = setFormatData(level, data.data.data, item);
            callback && callback();
          });
        }
        scope.selectitle = "";
        scope.selecthandle = function (level, item, type, listType) {
          if(level === 6){
            _.forEach(scope.modelList, function (key) {
              key.$$open = false;
            });
            console.log(6,item);
            scope.select = getResults(item);
          }else{
            _.forEach(clearSubkeys[type](), function (key) {
              key.$$open = false;
            });

            if (angular.isArray(item.items)) {
              scope[listType] = item.items;
            } else {
              loadingSubData(level, item, type, listType);
            }
          }
          scope.selectitle = item.title;
          item.$$open = !item.$$open;
        };

        /**
         * 获取结果数据
         * @param data
         */
        function getResults(data) {
          var result = {};
          /*_.forEach(data, function (item) {
            if (!brand[item.brandid]) {
              brand[item.brandid] = [];
            }
            brand[item.brandid].push(item);
          });*/
          console.log(data);

          return result;
        }
      }
    }
  }
})();