/**
 * Created by Administrator on 2016/10/15.
 */
(function () {
  'use strict';

  angular
    .module('shopApp')
    .controller('StoreShopHomeController', StoreShopHomeController)
    .controller('StoreShopHomeContactController', StoreShopHomeContactController)
    .controller('StoreShopHomeBankController', StoreShopHomeBankController)
    .controller('StoreShopHomeAptitudeController', StoreShopHomeAptitudeController);

  /** @ngInject */
  function StoreShopHomeController(shopHome, cbAlert) {
    var vm = this;
    vm.dataBase = {};

    /**
     * 获取商铺所有数据
     */
    shopHome.manager().then(function (results) {
      if (results.data.status == '0') {
        vm.dataBase = results.data.data;
        vm.dataBase.store.photos = vm.dataBase.store.photos.split(',');
        vm.dataBase.store.countIsshow = results.data.countIsshow;
      } else {
        cbAlert.error(results.data.data);
      }
    });
    vm.getScopeStatus = function (item, list) {
      return angular.isDefined(_.find(list, function (key) {
        return key.id == item.id;
      }));
    };
    /**
     * 修改商户介绍
     * @param data
     */
    vm.reviewHandler = function (data) {
      if (data.status == '0') {
        shopHome.saveDescription({
          description: data.content
        }).then(function (results) {
          if (results.data.status == '0') {
            cbAlert.tips("修改商户介绍成功");
            vm.dataBase.store.description = data.content;
          } else {
            cbAlert.error(results.data.data);
          }
        });
      }
    };

    /**
     * 店招图片配置和上传保存到服务器
     * @type {{config: {uploadtype: string, title: string}, handler: StoreShopHomeController.uploadModel.handler}}
     */
    vm.uploadModel = {
      config: {
        uploadtype: "storeCase",
        title: "上传店招图片"
      },
      handler: function(data){

      }
    };

    vm.uploadHandler = function (data, index) {
      if (data.status == 0) {
        if (angular.isDefined(index)) {
          vm.dataBase.store.photos[index] = data.data[0].url;
        } else {
          angular.forEach(data.data, function (item) {
            vm.dataBase.store.photos.push(item.url);
          });
        }
      }
    };

    vm.removePhotos = function (index) {
      var data = angular.copy(vm.dataBase.store.photos);
      data.splice(index, 1).join(",");
      shopHome.savePhotos({
        photos: data
      }).then(function (results) {
        if (results.data.status == '0') {
          cbAlert.tips("修改店招图片成功");
          vm.dataBase.store.photos.splice(index, 1);
        } else {
          cbAlert.error(results.data.data);
        }
      });
    };
    /**
     * 修改营业时间
     * @param data
     */
    vm.hoursHandler = function (data) {
      if (data.status == '0') {
        shopHome.saveTime(data.data).then(function (results) {
          if (results.data.status == '0') {
            cbAlert.tips("修改营业时间成功");
            vm.dataBase.store.opentime = data.data.opentime;
            vm.dataBase.store.closetime = data.data.closetime;
          } else {
            cbAlert.error(results.data.data);
          }
        });
      }
    };
    /**
     * 修改客服电话
     * @param data
     */
    vm.telephoneHandler = function (data) {
      if (data.status == '0') {
        shopHome.saveTelephone({telephone: data.data}).then(function (results) {
          if (results.data.status == '0') {
            cbAlert.tips("修改客服电话成功");
            vm.dataBase.store.telephone = data.data;
          } else {
            cbAlert.error(results.data.data);
          }
        });
      }
    }
  }

  /** @ngInject */
  function StoreShopHomeAptitudeController(shopHome, cbAlert) {
    var vm = this;
    vm.dataBase = {};
    /**
     * 获取店铺资质所有信息
     * 只展示不做任何修改
     */
    shopHome.getStoreAptitude().then(function (results) {
      if (results.data.status == '0') {
        vm.dataBase = results.data.data;
      } else {
        cbAlert.error(results.data.data);
      }
    });
  }

  /** @ngInject */
  function StoreShopHomeBankController(shopHome, cbAlert) {
    var vm = this;
    vm.dataBase = {};
    shopHome.getBanks().then(function (results) {
      if (results.data.status == '0') {
        vm.binkStore = results.data.data;
      } else {
        cbAlert.error(results.data.data);
      }
    });

    vm.submitBtn = function () {
      shopHome.saveStoreAccount(vm.dataBase).then(function (results) {
        if (results.data.status == '0') {
          cbAlert.tips("修改成功！");
        } else {
          cbAlert.error(results.data.data);
        }
      });
    }
  }

  /** @ngInject */
  function StoreShopHomeContactController($filter, shopHome, cbAlert) {
    var vm = this;
    vm.dataLists = [];
    var temporaryData = null;
    var contactType = ['0', '1'];    // 联系人类型列表
    angular.forEach(contactType, function (item) {
      vm.dataLists.push({
        "type": item,
        "contactname": "",
        "telephone": "",
        "email": "",
        "guid": ""
      });
    });

    function list() {
      shopHome.getStoreContact().then(function (results) {
        if (results.data.status == '0') {
          setDataLists(results.data.data);
        } else {
          cbAlert.error(results.data.data);
        }
      });
    }
    list();


    /**
     * 适配获取的数据
     * @param list
     */
    function setDataLists(list){
      list.length && angular.forEach(list, function (item) {
        var index = _.findIndex(vm.dataLists, function(key){
          return key.type == item.type;
        });
        console.log(index, item);

        vm.dataLists[index] = item;
      });
      temporaryData = angular.copy(vm.dataLists);
    }

    /**
     * 获取提交给后台的数据
     * @param list
     * @returns {Array}
     */
    function getDataLists(list){
      var results = [];
      angular.forEach(list, function (item) {
        item = angular.extend({}, item);
        results.push(item);
      });
      return results;
    }

    function isAllowed() {
      var result = {
        validate: false,
        message: ""
      };
      angular.forEach(vm.dataLists, function (item) {
        console.log(item);
        var contactname = $filter("formatStatusFilter")(item.type, "storeContactPeople");
        if(item.email && !item.telephone && !item.contactname){
          result = {
            validate: true,
            message:  contactname + "姓名和电话未填写"
          }
        }
        if(item.telephone && !item.contactname){
          result = {
            validate: true,
            message: contactname + "姓名未填写"
          }
        }
      });
      return result;
    }

    /**
     * 验证电话  手机或者座机
     * @param data
     * @param validate
     */
    vm.isTelephone = function(data, validate){
      if(!!data.telephone && validate.$dirty){
        data.$$isTelephone = validate.$error.telephoneAll || validate.$error.telephoneFixed || validate.$error.telephonePhone;
      }
      vm.isDisabled();
    };

    /**
     * 验证邮箱
     * @param data
     * @param validate
     */
    vm.isEmail = function(data, validate){
      console.log(data, validate);
      if(!!data.email && validate.$dirty){
        data.$$isEmail = validate.$error.pattern;
      }else{
        data.$$isEmail = validate.$error.pattern;
      }
      vm.isDisabled();
    };

    /**
     * 检查是否没有通过验证的
     * @returns {boolean}
     */
    vm.isDisabled = function(){
      var isDisabled = 0;
      angular.forEach(vm.dataLists, function (item) {
        if(item.$$isTelephone || item.$$isEmail){
          isDisabled++;
        }
      });
      return isDisabled > 0;
    };

    /**
     * 提交数据
     */
    vm.submitBtn = function(){
      if(isAllowed().validate){
        cbAlert.alert(isAllowed().message);
        return ;
      }
      if(angular.equals(temporaryData, vm.dataLists)) {
        cbAlert.confirm("您没有修改内容是否继续保存？", function(isConfirm){
          if(isConfirm){
            cbAlert.tips("修改成功！");
          }else{
            cbAlert.close();
          }
        }, "", "warning");
        return;
      }
      shopHome.saveStoreContact(getDataLists(vm.dataLists)).then(function (results) {
        if (results.data.status == '0') {
          cbAlert.tips("修改成功！");
          list();
        } else {
          cbAlert.error(results.data.data);
        }
      });
    }
  }
})();
