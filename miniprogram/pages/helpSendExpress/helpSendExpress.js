const db = wx.cloud.database();
Page({
  data: {
    deliverAddress: '',
    price: 800,
    address: {
      name: '',
      phone: '',
      detail: ''
    },
    provinces:['江浙沪皖','其他地区','西藏，新疆'],
    index:0
  },
  async onLoad() {
    if (!this.data.address.phone) await this.getAddress();
  },
  setDeliverAddress(e){
     console.log(e)
     const deliverAddress = e.detail.value
     this.setData({
      deliverAddress
     })
  },
  bindPickerChange(e){
     const index = e.detail.value*1
     console.log(index)
     this.setData({
       index
     })
     console.log(1)
     if (index === 0) {
       this.setData({ 
         price:800
       })
      return
     }
     if (index === 1) {
      this.setData({
        price:1000
      })
      return
     }
     if (index === 2) {
      this.setData({
        price:1500
      })
      return
     }

  },
  async submit() {
    if (this.data.helpMsg === '') {
      wx.showToast({
        title: '收货地址不能为空',
        icon: 'none'
      })
      return
    }
    if (this.data.address.phone === '') {
      wx.showToast({
        title: '取件地址不能为空',
        icon: 'none'
      })
      return
    }
    if (Number(this.data.price) < 200) {
      wx.showToast({
        title: '金额不能低于两块钱',
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
      name: '快递代寄',
      deliverAddress: this.data.deliverAddress,
      _id,
      // 订单公共部分
      userinfo: wx.getStorageSync('user'),
      address: this.data.address,
      price: this.data.price,
      date: new Date(),
      takeOrderer: {},
      note:'',
      // takeGoodsCode: Math.floor(Math.random() * (900)) + 100,
      status: 0,
    }
    // 添加订单到数据库
    const addRes = await db.collection('orders').add({
      data: order,
    });

    // 付款
    const res = await wx.cloud.callFunction({
      name: 'toPay',
      data: {
        goodName: `快递代寄-${this.data.address.name}`,
        totalFee: this.data.price,
        _id
      }
    })
    wx.hideLoading()
    const payment = res.result.payment;
    try {
      const res2 = await wx.requestPayment({
        ...payment
      })
      wx.showToast({
        title: '付款成功',
        icon: 'none'
      }) 
      wx.cloud.callFunction({
        name:'sendSms',
        data:{
          content:'快递代寄',
          phone:'15922476232'
        },
        success:(res)=>{
            console.log(res)
        }
      })
      wx.switchTab({
        url: '../order/order'
      })
    } catch (err) {
      wx.showToast({
        title: '付款失败',
        icon: 'none'
      })
    }

  },
  async getAddress() {
    const res = await db.collection('address').where({
      default: true,
      _openid: wx.getStorageSync('openid')
    }).get();
    const address = res.data[0]
    if (!address) return
    this.setData({
      address
    })
  },
  gotoAddress() {
    wx.navigateTo({
      url: '../address/address',
    })
  },
  // getInputValue(e){
  //      let price = e.detail.value * 100
  //      this.setData({
  //        price
  //      })
  // },
  onShareAppMessage: function (res) {
    return {
      title: '三联学院万能跑腿，帮买，帮送，帮取，啥都可以帮的小程序~',
      path: 'pages/errand/errand',
      imageUrl: 'cloud://zhuoyuebang-1gx979jw039db365.7a68-zhuoyuebang-1gx979jw039db365-1313189613/shareImg/avatar.png'
    }
  },
  /*分享朋友圈 */
  onShareTimeline: function () {
    return {
      title: '三联学院万能跑腿，帮买，帮送，帮取，啥都可以帮的小程序~',
      imageUrl: 'cloud://zhuoyuebang-1gx979jw039db365.7a68-zhuoyuebang-1gx979jw039db365-1313189613/shareImg/avatar.png'
    }
  },
})