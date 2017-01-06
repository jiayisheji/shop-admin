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
  function StoreShopHomeController($log, shopHome, cbAlert) {
    var vm = this;
    vm.dataBase = {};
    vm.editor = "sadas";
    shopHome.manager().then(function (results) {
      if (results.data.status == '0') {
        vm.dataBase = results.data.data;
        vm.dataBase.store.photos = vm.dataBase.store.photos.split(',');
      } else {
        cbAlert.error(results.data.rtnInfo);
      }
    });
    vm.getScopeStatus = function (item, list) {
      return angular.isDefined(_.find(list, function (key) {
        return key.id == item.id;
      }));
    };
    vm.reviewHandler = function (data) {
      if (data.status == '0') {
        shopHome.saveDescription({
          description: encodeURI(data.content)
        }).then(function (results) {
          if (results.data.status == '0') {
            cbAlert.tips("修改商户介绍成功");
            vm.dataBase.store.description = data.content;
          } else {
            cbAlert.error(results.data.rtnInfo);
          }
        });
      }
    };

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
          cbAlert.error(results.data.rtnInfo);
        }
      });
    };
    vm.hoursHandler = function (data) {
      if (data.status == '0') {
        shopHome.saveTime(data.data).then(function (results) {
          if (results.data.status == '0') {
            cbAlert.tips("修改营业时间成功");
            vm.dataBase.store.opentime = data.data.opentime;
            vm.dataBase.store.closetime = data.data.closetime;
          } else {
            cbAlert.error(results.data.rtnInfo);
          }
        });
      }
    };
    vm.telephoneHandler = function (data) {
      if (data.status == '0') {
        shopHome.saveTelephone({telephone: data.data}).then(function (results) {
          if (results.data.status == '0') {
            cbAlert.tips("修改客服电话成功");
            vm.dataBase.store.telephone = data.data;
          } else {
            cbAlert.error(results.data.rtnInfo);
          }
        });
      }
    }
  }

  /** @ngInject */
  function StoreShopHomeAptitudeController($log, shopHome, cbAlert) {
    var vm = this;
    vm.dataBase = {};
    shopHome.getStoreAptitude().then(function (results) {
      if (results.data.status == '0') {
        vm.dataBase = results.data.data;
      } else {
        cbAlert.error(results.data.rtnInfo);
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
  function StoreShopHomeContactController(shopHome, cbAlert) {
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

    shopHome.getStoreContact().then(function (results) {
      if (results.data.status == '0') {
        setDataLists(results.data.data);
      } else {
        cbAlert.error(results.data.data);
      }
    });

    /**
     * 适配获取的数据
     * @param list
     */
    function setDataLists(list){
      list.length && angular.forEach(list, function (item) {
        var index = _.findIndex(vm.dataLists, function(key){
          return key.type == item.type;
        });
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
        results.push({
          "type": item.type,
          "contactname": item.contactname,
          "telephone": item.telephone,
          "email": item.email,
          "guid": item.guid
        });
      });
      return results;
    }

    function isChange(){
      var result = 0;
      angular.forEach(temporaryData, function (key) {
        angular.forEach(vm.dataLists, function (item) {
          if(key.contactname === item.contactname && key.telephone === item.telephone && key.email === item.email && key.guid === item.guid){
            result++;
          }
        });
      });
      return result > 0;
    }

    vm.submitBtn = function(){
      if(isChange()){
        cbAlert.alert("没有修改联系人姓名，电话，邮箱");
        return ;
      }

      shopHome.saveStoreContact(getDataLists(vm.dataLists)).then(function (results) {
        if (results.data.status == '0') {
          setDataLists(results.data.data);
          cbAlert.tips("修改成功！");
        } else {
          cbAlert.error(results.data.data);
        }
      });
    };
  }
})();
