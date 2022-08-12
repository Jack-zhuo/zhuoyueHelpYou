const db = wx.cloud.database();
Page({
  data: {
    array: ['菜鸟驿站', '自提柜', '顺丰'],
    index: 0,
    size: [{
      name: '小件',
      tips: '小于书本，3元',
      price: 3
    }, {
      name: '中件',
      tips: '小于鞋盒，6元',
      price: 6
    }, {
      name: '大件',
      tips: '小于泡面箱，9元',
      price: 9
    }, {
      name: '超大件',
      tips: '大于泡面箱，18元',
      price: 18
    }, ],
    isName: '小件',
    placeholderCon: '请输入取件码...',
    price: 3,
    address: {
      name: '',
      phone: '',
      detail: ''
    },
    takeMsg: '',
    note: ''
  },
  onLoad() {
    this.getAddress();
  },
  onShow() {
    this.onLoad();
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
    this.setData({
      address: address.data[0]
    })
  },
  cleanHolder() {
    this.setData({
      placeholderCon: ''
    })
  },
  addHolder() {
    this.setData({
      placeholderCon: '请输入取件码...'
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

    const order = {
      name: '代取快递',
      userinfo: wx.getStorageSync('user').info,
      address: this.data.address,
      merchant: this.data.array[this.data.index],
      size: this.data.isName,
      price: this.data.price,
      date: new Date(),
      takeMsg: this.data.takeMsg,
      note: this.data.note,
      takeOrderer: {},
      takeGoodsCode: Math.floor(Math.random()*(900))+100,
      status: 1
    }

    const res = await wx.cloud.callFunction({
      name: 'toPay',
      data: {
        goodName: `代取快递-${this.data.address.name}-${this.data.address.detail}`,
        totalFee: this.data.price * 100
      }
    })
    const payment = res.result.payment
    wx.hideLoading()
    wx.requestPayment({
      ...payment,
      success(res) {
        // 添加订单到数据库
        wx.showToast({
          title: '付款成功',
          icon: 'none'
        })
        db.collection('orders').add({
          data: order,
          success: (res) => {
            wx.switchTab({
              url: '../order/order'
            })
          }
        });
      },
      fail(err) {
        wx.showToast({
          title: '付款失败',
          icon: 'none'
        })
      }
    })
  },
  onPullDownRefresh(){
    this.onLoad()
    this.setData({
      takeMsg:'',
      note:''
    })
     //隐藏loading 提示框
     wx.hideLoading();
     //隐藏导航条加载动画
     wx.hideNavigationBarLoading();
     //停止下拉刷新
     wx.stopPullDownRefresh();
  },
})