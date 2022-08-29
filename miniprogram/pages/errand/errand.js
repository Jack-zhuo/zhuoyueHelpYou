const db = wx.cloud.database();
Page({
  data: {
    helpMsg: '',
    price: 200,
    address: {
      name: '',
      phone: '',
      detail: ''
    }
  },
  async onLoad() {
    if (!this.data.address.phone) await this.getAddress();
  },
  setHelpMsg(e){
     console.log(e)
     const helpMsg = e.detail.value
     this.setData({
       helpMsg
     })
  },
  async submit() {
    if (this.data.helpMsg === '') {
      wx.showToast({
        title: '帮助内容不能为空',
        icon: 'none'
      })
      return
    }
    if (this.data.address.phone === '') {
      wx.showToast({
        title: '地址不能为空',
        icon: 'none'
      })
      return
    }
    if (Number(this.data.price) < 2) {
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
      name: '万能跑腿',
      helpMsg: this.data.helpMsg,
      _id,
      // 订单公共部分
      userinfo: wx.getStorageSync('user').info,
      address: this.data.address,
      price: this.data.price,
      date: new Date(),
      takeOrderer: {},
      takeGoodsCode: Math.floor(Math.random() * (900)) + 100,
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
        goodName: `万能跑腿-${this.data.address.name}`,
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
          content:'有新订单（跑腿），赶快去接单啦~~',
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
  getInputValue(e){
       let price = e.detail.value * 100
       this.setData({
         price
       })
  },
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