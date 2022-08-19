const db = wx.cloud.database();
Page({
  data: {
    helpMsg: '',
    price: '',
    address: {
      name: '',
      phone: '',
      detail: ''
    }
  },
  async onLoad(e) {
    if (!this.data.address.phone) await this.getAddress();
    const address = wx.getStorageSync('address');
    if (address.phone) {
      this.setData({
        address
      })
    }
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

    const order = {
      name: '万能跑腿',
      helpMsg: this.data.helpMsg,

      // 订单公共部分
      userinfo: wx.getStorageSync('user').info,
      address: this.data.address,
      price: this.data.price,
      date: new Date(),
      takeOrderer: {},
      takeGoodsCode: Math.floor(Math.random() * (900)) + 100,
      status: 1,
    }

    // 付款
    const res = await wx.cloud.callFunction({
      name: 'toPay',
      data: {
        goodName: `万能跑腿-${this.data.address.name}`,
        totalFee: this.data.price * 100
      }
    })
    const payment = res.result.payment;
    wx.hideLoading()
    try {
      const res2 = await wx.requestPayment({
        ...payment
      })
      wx.showToast({
        title: '付款成功',
        icon: 'none'
      })
      // 添加订单到数据库
      db.collection('orders').add({
        data: order,
        success: (res) => {
          wx.switchTab({
            url: '../order/order'
          })
        }
      });
    } catch (err) {
      wx.showToast({
        title: '付款失败',
        icon: 'none'
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
    wx.setStorageSync('urlNow', 'errand')
    wx.navigateTo({
      url: '../address/address',
    })
  }
})