const db = wx.cloud.database();
Page({
  data: {
    price: '',
    address: {
      name: '',
      phone: '',
      detail: ''
    },
    fileID: '',
    fileName: '',
    pageNum: 0,
    count: 0,
    note: '',
    array: ['单面', '双面'],
    index: 0,
    totalPrice: 2
  },
  async onLoad() {
    if (!this.data.address.phone) await this.getAddress();
  },

  setCount(e) {
    const count = Number(e.detail.value)
    this.setData({
      count,
      totalPrice: (2 + (this.data.pageNum * 0.3 * count) / (this.data.index + 1)).toFixed(2)*1
    })
  },
  setPageNum(e) {
    const pageNum = Number(e.detail.value)
    this.setData({
      pageNum,
      totalPrice: (Number(2) + (pageNum * 0.3 * Number(this.data.count)) / (Number(this.data.index) + 1)).toFixed(2)*1
    })
  },
  bindPickerChange(e) {
    const index = Number(e.detail.value)
    this.setData({
      index,
      totalPrice: (Number(2) + (Number(this.data.pageNum) * 0.3 * Number(this.data.count)) / (index + 1)).toFixed(2)*1
    })
  },
  async upFile() {
    wx.showLoading({
      title: '正在上传中',
    })
    try {
      const res = await wx.chooseMessageFile({
        count: 1,
        type: 'file',
      })
      const filepath = res.tempFiles[0].path
      const fileName = res.tempFiles[0].name

      const res2 = await wx.cloud.uploadFile({
        cloudPath: `print/${fileName}`,
        filePath: filepath
      })
      const fileID = res2.fileID;
      this.setData({
        fileID,
        fileName
      })
      wx.hideLoading();
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: '你取消了上传',
        icon: 'none'
      })
    }

  },
  
  async submit() {
    if (this.data.address.phone === '') {
      wx.showToast({
        title: '必须选择地址',
        icon: 'none'
      })
      return
    }
    if (this.data.fileName === '') {
      wx.showToast({
        title: '必须上传文件',
        icon: 'none'
      })
      return
    }
    if (!this.data.pageNum) {
      wx.showToast({
        title: '必须输入页数',
        icon: 'none'
      })
      return
    }
    if (!this.data.count) {
      wx.showToast({
        title: '必须输入份数',
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
      name: '打印服务',
      _id,
      fileID: this.data.fileID,
      note: this.data.note,
      pageNum: this.data.pageNum,
      count: this.data.count,
      bothPrint: this.data.array[this.data.index],
      fileName: this.data.fileName,

      // 订单公共部分
      userinfo: wx.getStorageSync('user').info,
      address: this.data.address,
      price:Number(this.data.totalPrice),
      date: new Date(),
      takeOrderer: {},
      takeGoodsCode: Math.floor(Math.random() * (900)) + 100,
      status: 0,
    }
    // 添加订单到数据库
    const addRes = await db.collection('orders').add({
      data: order
    });

   

    // 付款
    const res = await wx.cloud.callFunction({
      name: 'toPay',
      data: {
        goodName: `打印服务-${this.data.address.name}`,
        totalFee: Math.round(this.data.totalPrice * 100),
        _id
      }
    })
    const payment = res.result.payment;
    wx.hideLoading()
    try {
      await wx.requestPayment({
        ...payment
      })
      wx.showToast({
        title: '付款成功',
        icon: 'none'
      })
      // 跳转到订单页面
      wx.switchTab({
        url: '../order/order'
      })
    } catch (err) {
      console.log(err);
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
    wx.setStorageSync('urlNow', 'print')
    wx.navigateTo({
      url: '../address/address',
    })
  },
  copyWeChat() {
    wx.setClipboardData({
      data: 'zyjava2020',
    })
  },
  onShareAppMessage: function (res) {
    return {
      title: '三联学院云打印，0配送费，秒送寝室',
      path: 'pages/print/print',
      imageUrl: 'cloud://zhuoyuebang-1gx979jw039db365.7a68-zhuoyuebang-1gx979jw039db365-1313189613/shareImg/avatar.png'
    }
  },
  /*分享朋友圈 */
  onShareTimeline: function () {
    return {
      title: '三联学院云打印，0配送费，秒送寝室',
      imageUrl: 'cloud://zhuoyuebang-1gx979jw039db365.7a68-zhuoyuebang-1gx979jw039db365-1313189613/shareImg/avatar.png'
    }
  },
})