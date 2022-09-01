const db = wx.cloud.database();
Page({
  data: {
    // 快递商家
    array: ['请选择','菜鸟驿站', '自提柜', '顺丰'],
    index: 0,
    // 尺寸大小
    size: [{
      name: '小件',
      tips: '小于书本，1.98元',
      price: 198
    }, {
      name: '中件',
      tips: '小于鞋盒，3.98元',
      price: 398
    }, {
      name: '大件',
      tips: '小于泡面箱，6.98元',
      price: 698
    }, {
      name: '超大件',
      tips: '大于泡面箱，18.98元',
      price: 1898
    }, ],
    isName: '小件',
    // 取件码
    placeholderCon: '请输入取件码...',
    // 价格
    price: 198,
    // 地址
    address: {
      name: '',
      phone: '',
      detail: ''
    },
    // 取件码
    takeMsg: '',
    // 取件图片
    takeImg:'',
    // 备注
    note: '',
    
  },
  onLoad() {
    this.getAddress();
  },
  addAddress() {
     
    wx.navigateTo({
      url: '../addAddress/addAddress',
    })
  },
  async getAddress() {
    const address = await db.collection('address').where({
      default: true,
      _openid: wx.getStorageSync('openid')
    }).get();
  
    if (address.data.length === 0) return
    this.setData({
      address: address.data[0]
    })
  },
  gotoAddress() {
    wx.navigateTo({
      url: '../address/address',
    })
  },
  bindPickerChange(e) {
    console.log(e.detail.value);
    this.setData({
      index: e.detail.value
    })
  },
  selectTab(e) {
    const size = e.currentTarget.dataset.size
    console.log(size)
    wx.showToast({
      title: size.tips,
      icon: 'none'
    })
    this.setData({
      isName: size.name,
      price: size.price
    })
  },
  // 选择图片
  async selectImg(){
    const res1 = await wx.chooseMedia({
       count:1,
       mediaType:['image'],
       sourceType:['album']
     })
     console.log(res1)
 
     // 获取后缀名
     const tempFilePath = res1.tempFiles[0].tempFilePath
     const index = tempFilePath.lastIndexOf(".")
     const suffix = tempFilePath.substr(index)
 
     // 上传到云数据库
     const res2 = await wx.cloud.uploadFile({
       cloudPath:'takeImg/'+new Date().getTime()+suffix,
       filePath:tempFilePath
     })
     console.log(res2)
     this.setData({
       takeImg:res2.fileID
     })
   },
   preview(){
     wx.previewImage({
       urls: [this.data.takeImg],
     })
   },
  async goPay() {
    if (!this.data.address.phone) {
      wx.showToast({
        title: '请先添加地址',
        icon: 'none'
      })
      return
    }

    if (this.data.index === 0) {
      wx.showToast({
        title: '请先选择快递商家',
        icon: 'none'
      })
      return
    }
  
    if (!this.data.takeMsg && !this.data.takeImg) {
      wx.showToast({
        title: '请输入取件码或上传截图',
        icon: 'none'
      })
      return
    }
    wx.showLoading({
      title: '准备付款中',
    })

    //生成订单号,生成规则 时间戳 加 随机四位数字
    const _id = new Date().getTime() + '' + Math.floor(Math.random() * 10000)

    const order = {
      name: '代取快递',
      _id,
      userinfo: wx.getStorageSync('user').info,
      address: this.data.address,
      merchant: this.data.array[this.data.index],
      size: this.data.isName,
      price: this.data.price,
      date: new Date(),
      takeMsg: this.data.takeMsg,
      note: this.data.note,
      takeOrderer: {},
      takeImg:this.data.takeImg,
      takeGoodsCode: Math.floor(Math.random() * (900)) + 100,
      status: 0
    }
    // 添加订单到数据库
    db.collection('orders').add({
      data: order
    });

    const res = await wx.cloud.callFunction({
      name: 'toPay',
      data: {
        goodName: `代取快递-${this.data.address.name}-${this.data.address.detail}`,
        totalFee: this.data.price,
        _id
      }
    })
    const payment = res.result.payment
    wx.hideLoading()
    wx.requestPayment({
      ...payment,
      success(res) {
        wx.showToast({
          title: '付款成功',
          icon: 'none'
        })
        wx.cloud.callFunction({
          name:'sendSms',
          data:{
            content:'有新订单（代取快递），赶快去接单啦~~',
            phone:'15922476232'
          },
          success:(res)=>{
              console.log(res)
          }
        })
        wx.switchTab({
          url: '../../pages/order/order'
        })
      },
      fail(err) {
        wx.showToast({
          title: '付款失败',
          icon: 'none'
        })
      }
    })
  },
  onPullDownRefresh() {
    this.onLoad()
    this.setData({
      takeMsg: '',
      note: ''
    })
    //隐藏loading 提示框
    wx.hideLoading();
    //隐藏导航条加载动画
    wx.hideNavigationBarLoading();
    //停止下拉刷新
    wx.stopPullDownRefresh();
  },
  onShareAppMessage: function (res) {
    return {
      title: '代取快递',
      path: 'pages/helpTp/helpTp',
      imageUrl: 'cloud://zhuoyuebang-1gx979jw039db365.7a68-zhuoyuebang-1gx979jw039db365-1313189613/avatar/1660277626031.png'
    }
  },
  /*分享朋友圈 */
  onShareTimeline: function () {
    return {
      title: '三联学院代取快递',
      imageUrl: 'cloud://zhuoyuebang-1gx979jw039db365.7a68-zhuoyuebang-1gx979jw039db365-1313189613/avatar/1660277626031.png'
    }
  },
  tabChange(e){
    console.log(e.detail)
    this.setData({
      
    })
  }
})