// pages/Device/device.js

const AV = require('../../utils/av-live-query-weapp-min');
var crypto = require('../lib/cryptojs/cryptojs.js');
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hideHeaderView: false,
    showTopTips: false,
    brandDisabled: true,
    openid: null,
    topTips: '',
    models: {},
    modelIndex: null,
    isEdit: false,
    brands: {},
    brandIndex: null,

    OSVersions: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]],
    systemVersionIndex1: 0,
    systemVersionIndex2: 0,
    systemVersionIndex3: 0,

    companyCode: 'A000',
    deviceCode: null,
    ocrSign: null,

    //在编辑状态时，
    editBrand: null,
    editModel: null,
    editOSVersion: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    if (options.isEdit) {
      wx.setNavigationBarTitle({
        title: '修改设备',
      })
    } else {
      wx.setNavigationBarTitle({
        title: '新增设备',
      })
    }

    var brands = app.globalData.brandsInfo.brands || {};
    var models = app.globalData.modelsInfo.models || {};
    var openid = app.globalData.openIdInfo.openid || {};
    var brandArr = [];
    var brandIndex = this.data.brandIndex;
    var modelIndex = this.data.modelIndex;
    var brandDisabled = this.data.brandDisabled;
    var hideHeaderView = this.data.hideHeaderView;
    var systemVersionIndex1 = this.data.systemVersionIndex1;
    var systemVersionIndex2 = this.data.systemVersionIndex2;
    var systemVersionIndex3 = this.data.systemVersionIndex3;

    //品牌字典转换成数组，并获取当前选中品牌索引
    var i = 0;
    for (var key in brands) {
      var obj = {}
      obj.brandID = parseInt(key);
      obj.brand = brands[key];
      brandArr.push(obj);
      if (options.brandID == obj.brandID) {
        brandIndex = i;
        brandDisabled = false;
      }
      i++;
    }

    //隐藏头部
    if (options.isEdit) {
      hideHeaderView = true;
    }
    //获取选中型号对应的索引
    var brandModels = models[options.brandID];
    for (var i in brandModels) {
      if (brandModels[i] == options.model) {
        modelIndex = i;
      }
    }

    //获取版本索引
    if (options.OSVersion){
      var versions = options.OSVersion.split(".") || [];
      if (versions.length == 3) {
        systemVersionIndex1 = parseInt(versions[0]) - 1;
        systemVersionIndex2 = parseInt(versions[1]);
        systemVersionIndex3 = parseInt(versions[2]);
      }
    }


    var sign = this.generateOCRSign()
    this.setData({
      openid: openid,
      brands: brandArr,
      models: models,
      ocrSign: sign,
      brandIndex: brandIndex,
      modelIndex: modelIndex,
      systemVersionIndex1: systemVersionIndex1,
      systemVersionIndex2: systemVersionIndex2,
      systemVersionIndex3: systemVersionIndex3,

      brandDisabled: brandDisabled,
      hideHeaderView: hideHeaderView,
      isEdit: options.isEdit || false,
      deviceCode: options.deviceID || null,
      companyCode: options.companyCode || null,
    })
    console.log("签名:%s", this.data.ocrSign)
  },





  //生成腾讯orc签名
  generateOCRSign: function () {
    var secretId = 'AKIDENL7i9LZVFpV6XoqqsBOTObhhTBlpEZp',
      secretKey = 'IVXN5hHguTtwJdnlYDKxY0GKFAwlQuCI',
      appid = '1256097546',
      pexpired = 86400,
      userid = 0;

    var now = parseInt(Date.now() / 1000),
      rdm = parseInt(Math.random() * Math.pow(2, 32)),
      plainText = 'a=' + appid + '&k=' + secretId + '&e=' + (now + pexpired) + '&t=' + now + '&r=' + rdm + '&u=' + userid + '&f=',
      data = crypto.Crypto.charenc.UTF8.stringToBytes(plainText),
      resBytes = crypto.Crypto.HMAC(crypto.Crypto.SHA1, plainText, secretKey, { asBytes: true }),
      bin = resBytes.concat(data);

    var sign = crypto.Crypto.util.bytesToBase64(bin);
    return sign;
  },

  bindDeviceCodeInput: function (e) {
    this.setData({
      deviceCode: e.detail.value
    })
  },

  bindCompanyCodeInput: function (e) {
    this.setData({
      companyCode: e.detail.value
    })
  },


  bindBrandChange: function (e) {

    if (e.detail.value !== this.data.brandIndex) {
      this.setData({
        brandIndex: e.detail.value,
        modelIndex: null,
        brandDisabled: false,
      })
    }
  },

  bindModelChange: function (e) {
    this.setData({
      modelIndex: e.detail.value,
    })
  },

  bindSystemVersionChange: function (e) {
    this.setData({
      systemVersionIndex1: e.detail.value[0],
      systemVersionIndex2: e.detail.value[1],
      systemVersionIndex3: e.detail.value[2]
    })
  },

  bindModelTap: function (e) {
    if (!this.data.brandIndex) {
      wx.showToast({
        title: '请先选择品牌',
        icon: 'none'
      })
    }
  },


  showTips: function (content) {
    var that = this;
    this.setData({
      showTopTips: true,
      topTips: content
    });
    setTimeout(function () {
      that.setData({
        showTopTips: false,
        topTips: ''
      });
    }, 3000);
  },

  bindSubmit: function () {

    console.log(this.data.brandIndex)

    if (this.data.deviceCode == null) {
      this.showTips('请输入设备编号');
      return;
    }

    if (this.data.companyCode == null) {
      this.showTips('请输入公司编号');
      return;
    }

    if (this.data.brandIndex == null) {
      this.showTips('请选择设备品牌');
      return;
    }

    if (this.data.modelIndex == null) {
      this.showTips('请选择设备型号');
      return;
    }

    if (this.data.systemVersionIndex1 == 0 && this.data.systemVersionIndex2 == 0 && this.data.systemVersionIndex3 == 0) {
      this.showTips('请选择系统版本');
      return;
    }

    wx.showLoading({
      title: '提交中...',
      mask:true,
    })
    var that = this;
    if (this.data.isEdit) {
      var DevicesObject = AV.Object.extend('Devices');
      var that = this;
      var query = new AV.Query(DevicesObject);
      query.equalTo('deviceID', this.data.deviceCode);
      query.equalTo('ownerID', this.data.openid);
      query.first().then(function (result) {
        var device = AV.Object.createWithoutData('Devices', result.id);

        device.set('deviceModel', that.data.models[that.data.brands[that.data.brandIndex].brandID][that.data.modelIndex])
        device.set('OSVersion', that.data.OSVersions[0][that.data.systemVersionIndex1] + "." + that.data.OSVersions[1][that.data.systemVersionIndex2] + "." + that.data.OSVersions[2][that.data.systemVersionIndex3])
        device.set('deviceID', that.data.deviceCode)
        device.set('companyCode', that.data.companyCode)
        device.set('ownerID', that.data.openid);
        device.save().then(function (device) {

          wx.hideLoading();
          wx.navigateBack({
            delta: 1
          })

          wx.showToast({
            title: '修改成功！',
            icon: 'success'
          })

          // 成功
        }, function (error) {
          wx.hideLoading();
          console.log(error)
          // 失败
          wx.showToast({
            title: '修改失败！',
            icon: 'none'
          })
        });
      }, function(error){

      });
    } else {
      var DevicesObject = AV.Object.extend('Devices');
      var that = this;
      new AV.Query(DevicesObject).equalTo('deviceID', this.data.deviceCode).find().then(function (results) {
        console.log(results);
        console.log(results.length);
        if (results.length > 0) {
          wx.showToast({
            title: '该设备已存在!',
            icon: 'none'
          });
        } else {

          var deviceObject = new DevicesObject();
          deviceObject.set('brandID', that.data.brands[that.data.brandIndex].brandID);
          deviceObject.set('deviceModel', that.data.models[that.data.brands[that.data.brandIndex].brandID][that.data.modelIndex])
          deviceObject.set('OSVersion', that.data.OSVersions[0][that.data.systemVersionIndex1] + "." + that.data.OSVersions[1][that.data.systemVersionIndex2] + "." + that.data.OSVersions[2][that.data.systemVersionIndex3])
          deviceObject.set('deviceID', that.data.deviceCode)
          deviceObject.set('companyCode', that.data.companyCode)
          deviceObject.set('ownerID', that.data.openid);
          deviceObject.save().then(function (deviceObject) {
            wx.hideLoading();
            wx.navigateBack({
              delta: 1
            })

            // 成功
            wx.showToast({
              title: '添加成功！',
              icon: 'success'
            })
          }, function (error) {
            wx.hideLoading();
            console.log(error)
            // 失败
            wx.showToast({
              title: '添加设备失败！',
              icon: 'none'
            })
          });

        }
      }, function (error) {
        wx.showToast({
          title: '服务器错误!',
          icon: 'none'
        });
      });
    }
  },

  bindScanClick: function () {
    console.log('照相机拍照')
    var that = this
    that.setData({
      modelIndex: null,
      brandIndex: null,
      systemVersionIndex1: 0,
      systemVersionIndex2: 0,
      systemVersionIndex3: 0,
      companyCode: null,
      deviceCode: null,
    })
    //相机拍照
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {


        var tempFilePaths = res.tempFilePaths;
        wx.showLoading({
          title: '资产识别中...',
        })
        wx.uploadFile({
          url: 'https://recognition.image.myqcloud.com/ocr/general',
          filePath: tempFilePaths[0],
          name: 'image',
          header: {
            "authorization": that.data.ocrSign,
          },
          formData: {
            "appid": "1256097546",
          },
          success: function (res) {
            wx.hideLoading();
            var result = JSON.parse(res.data)
            var items = result['data']['items']

            //按照x轴升序排序
            var srotYItems = items.sort(function (a, b) {
              return a.itemcoord.y - b.itemcoord.y
            })
            console.log(srotYItems)
            var flagIndex = null;
            srotYItems.forEach(function (item, index) {
              var str = item['itemstring'];
              var iscontain = str.indexOf("蓝月亮") == -1 ? false : true;
              if (iscontain) {
                flagIndex = index;
              }
            });

            if (flagIndex !== null) {
              //设备编码标签索引
              var deviceCodeIndex = 0
              if (flagIndex == 0) {
                deviceCodeIndex = flagIndex + 1
              } else {
                //取出距离y轴距离最近的元素的索引
                var offsetToPrev = Math.abs(srotYItems[flagIndex - 1]['itemcoord']['y'] - srotYItems[flagIndex]['itemcoord']['y']);
                var offsetToNext = Math.abs(srotYItems[flagIndex + 1]['itemcoord']['y'] - srotYItems[flagIndex]['itemcoord']['y']);
                deviceCodeIndex = offsetToPrev < offsetToNext ? flagIndex - 1 : flagIndex + 1;
              }
              //得到设备编码，去掉所有空格
              var deviceCode = srotYItems[deviceCodeIndex]["itemstring"].replace(/[ ]/g, "");
              //去除非数字
              deviceCode = deviceCode.replace(/[^\d.]/g, "");
              //公司编码
              var companyCodeIndex = deviceCodeIndex > flagIndex ? deviceCodeIndex + 1 : flagIndex + 1;
              var companyCode = srotYItems[companyCodeIndex]["itemstring"].replace(/[ ]/g, "");
              //将I、l换成1
              companyCode = companyCode.replace(/[Il]/g, "1");
              //型号描述
              var deviceDesc = srotYItems[companyCodeIndex + 1]["itemstring"].replace(/[ ]/g, "");
              var brandIndex = null;
              console.log("deviceDesc :%s", deviceDesc)
              that.data.brands.forEach(function (item, index) {
                console.log(item);
                var iscontain = deviceDesc.indexOf(item.brand) == -1 ? false : true;
                if (iscontain) {
                  brandIndex = index;
                }
              });

              that.setData({
                deviceCode: deviceCode,
                companyCode: companyCode,
                brandIndex: brandIndex
              })
              // wx.showToast({
              //   title: '资产识成功!',
              //   icon:'success',
              // })

            } else {
              wx.showToast({
                title: '资产识别失败,请手动填写或重新识别',
                icon: 'none'
              })
            }

          },
          fail: function () {
            wx.hideLoading();
            wx.showToast({
              title: '资产识别出错，请重新识别',
            })
          }
        })
      }
    })
  },



})


