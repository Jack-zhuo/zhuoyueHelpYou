const db = wx.cloud.database();
Page({
  data: {
    helpMsg: '',
    price: 200,
    address: {
      name: '',
      phone: '',
      detail: ''
    },
    // 性别限制
    
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


})