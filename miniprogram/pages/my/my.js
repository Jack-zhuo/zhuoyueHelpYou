// pages/my/my.js
Page({

  data: {
    info: {},
    openid:''
  },
  onLoad() {
    const info = wx.getStorageSync('info');
    if (info) {
      this.setData({
        info
      })
    }
    const openid = wx.getStorageSync('openid');
    console.log('唯一标识：',openid)
      this.setData({
        openid
      })
    
  },
  onShow(){
    this.onLoad();
  },
  getUserProfile() {
    wx.getUserProfile({
      desc: 'desc',
      success: (result) => {

        this.setData({
          info: result
        })
        wx.setStorageSync('info', result);
        wx.cloud.callFunction({
          name: 'login',
          success: (res) => {
            //  获取openid
            console.log(res.result.openid);
            const openid = res.result.openid;
            wx.setStorageSync('openid', openid);
           this.setData({
             openid
           })
          }
        })
      }
    })
  },
  getPhoneNumber(e) {
    console.log(e);
    wx.cloud.callFunction({
      name: 'getPhoneNumber',
      data: {
        cloudID: e.detail.cloudID
      },
      success(res) {
        console.log(res)
        const phone = res.result.list[0].data.phoneNumber

        wx.setStorageSync('phone', phone)
      }
    })
  },
  gotoAddress(){
    wx.navigateTo({
      url: '../address/address',
    })
  },
  openService(){
    wx.setClipboardData({
      data: 'zyjava2020',
      success:()=>{
        wx.showToast({
          title: '复制成功！',
          icon:'none'
        })
      }
    })
  }
})