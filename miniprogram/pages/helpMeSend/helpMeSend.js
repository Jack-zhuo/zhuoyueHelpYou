const db = wx.cloud.database()
Page({

  data: {
    address: {
      name: '',
      phone: '',
      detail: ''
    },
    endAddress: '',
    price: 200,
    note: ''
  },
  onLoad(){
    if (!this.data.address.phone) this.getAddress();
  },
  gotoAddress() {
    wx.navigateTo({
      url: '../address/address',
    })
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
  getInputValue(e) {
    const price = e.detail.value
    this.setData({
      price:price*100
    })
  },
  async submit() {

    if (this.data.address.phone === '') {
      wx.showToast({
        title: '地址不能为空',
        icon: 'none'
      })
      return
    }
    if (this.data.endAddress === ''){
      wx.showToast({
        title: '必须输入终点',
        icon:'none'
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
      name: '帮我送',
      endAddress:this.data.endAddress,
      _id,
      // 订单公共部分
      userinfo: wx.getStorageSync('user'),
      address: this.data.address,
      price: this.data.price,
      date: new Date(),
      takeOrderer: {},
      note:this.data.note,
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
        goodName: `帮我送-${this.data.address.name}`,
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
          content:'有新订单（帮我送），赶快去接单啦~~',
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
})