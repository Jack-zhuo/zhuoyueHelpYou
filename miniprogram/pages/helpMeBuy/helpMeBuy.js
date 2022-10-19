const db = wx.cloud.database();
Page({
  data: {
    address: {
      name: '',
      phone: '',
      detail: ''
    },
    // 性别限制
    array:['不限性别','仅限男性','仅限女性'],
    index:0,
    // 购买商品
    buyWhat:'',
    // 预估费用
    estimatedCost:'',
    // 跑腿费，默认两块钱
    errandCost:200
  },
  onLoad() {
    if (!this.data.address.phone) this.getAddress();
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
  addAddress() {
    wx.navigateTo({
      url: '../addAddress/addAddress',
    })
  },
  bindPickerChange(e){
    console.log(e)
    const index = e.detail.value;
    this.setData({
      index
    })
  },
  // 输入跑腿费
  inputErrandCost(e){
       console.log(e)
       let errandCost = e.detail.value*100
       this.setData({
         errandCost
       })
  },
 async goPay(){
   const that = this.data
    if (!that.address.phone) {
      wx.showToast({
        title: '请先添加地址',
        icon: 'none'
      })
      return
    }
    if (!that.buyWhat) {
      wx.showToast({
        title: '请输入要买的东西',
        icon: 'none'
      })
      return
    }
    if (that.errandCost < 200) {
      wx.showToast({
        title: '跑腿费不能低于两块钱',
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
      // 公共项
      name: '帮我买',
      _id,
      price: that.errandCost,
      userinfo: wx.getStorageSync('user'),
      date: new Date(),
      address: that.address,
      takeOrderer: {},
      status: 0,
      // 特有项
      limitGender:that.array[that.index],
      buyWhat:that.buyWhat,
      estimatedCost:that.estimatedCost,
    }
    // 添加订单到数据库
    db.collection('orders').add({
      data: order
    });

    const res = await wx.cloud.callFunction({
      name: 'toPay',
      data: {
        goodName: `帮我买-${that.address.name}-${that.address.detail}`,
        totalFee: that.errandCost,
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
            content:'帮我买',
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

})