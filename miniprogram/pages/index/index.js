const db = wx.cloud.database();
Page({

  data: {
    swiperItem: [
      'cloud://zhuoyuebang-1gx979jw039db365.7a68-zhuoyuebang-1gx979jw039db365-1313189613/pic/1.jpg',
      'cloud://zhuoyuebang-1gx979jw039db365.7a68-zhuoyuebang-1gx979jw039db365-1313189613/pic/2.jpg',
      'cloud://zhuoyuebang-1gx979jw039db365.7a68-zhuoyuebang-1gx979jw039db365-1313189613/pic/3.jpg'
    ],
    tabList: ['代取快递', '万能跑腿', '打印服务'],
    tabNow: 0,
    // 快递商家
    array: ['菜鸟驿站', '自提柜', '顺丰'],
    index: 0,
    // 尺寸大小
    size: [{
      name: '小件',
      tips: '书本大小的快递，1.98元',
      price: 1.98
    }, {
      name: '中件',
      tips: '鞋盒大小的快递，3.98元',
      price: 3.98
    }, {
      name: '大件',
      tips: '台式电脑主机大小，6.98元',
      price: 6.98
    } ],
    isName: '小件',
    // 取件码
    placeholderCon: '请输入取件码...',
    // 价格
    price: 1.98,
    // 地址
    address: {
      name: '',
      phone: '',
      detail: ''
    },
    // 取件码
    takeMsg: '',
    // 备注
    note: '',
  },
  onLoad(e) {
    this.getAddress();
  },
  onShow() {
    const address = wx.getStorageSync('address')
    if (address) {
      this.setData({
        address,
      })
    }

  },
  tabChange(e) {
    console.log(e.currentTarget.dataset.index)
    const tabNow = e.currentTarget.dataset.index;
    if (tabNow === 1) {
      wx.navigateTo({
        url: '../errand/errand',
      })
    }
    if (tabNow === 2) {
      wx.navigateTo({
        url: '../print/print',
      })
    }
  },
  async getAddress() {
    const address = await db.collection('address').where({
      default: true,
      _openid: wx.getStorageSync('openid')
    }).get();
    this.setData({
      address: address.data[0]
    })
  },
  gotoAddress() {
    wx.setStorageSync('urlNow', 'index')
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
    const size = e.currentTarget.dataset.tip
    wx.showToast({
      title: size.tips,
      icon: 'none'
    })
    this.setData({
      isName: size.name,
      price: size.price
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
    if (!this.data.takeMsg) {
      wx.showToast({
        title: '请输入取件码',
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
        totalFee: this.data.price * 100,
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
    this.getAddress();
    this.setData({
      takeMsg: '',
      note: ''
    })
    wx.stopPullDownRefresh();
  },
  onShareAppMessage: function (res) {
    return {
      title: '代取快递',
      path: 'pages/index/index',
      imageUrl: 'cloud://zhuoyuebang-1gx979jw039db365.7a68-zhuoyuebang-1gx979jw039db365-1313189613/shareImg/avatar.png'
    }
  },
  /*分享朋友圈 */
  onShareTimeline: function () {
    return {
      title: '三联学院代取快递',
      imageUrl: 'cloud://zhuoyuebang-1gx979jw039db365.7a68-zhuoyuebang-1gx979jw039db365-1313189613/shareImg/avatar.png'
    }
  },

  btn() {
    console.log(this.data.note)
  }


})