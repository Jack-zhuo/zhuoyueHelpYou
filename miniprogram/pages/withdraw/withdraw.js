// pages/withdraw/withdraw.js
Page({

  data: {
    users: [],
  },
  onLoad(options) {
    this.getUser();
  },
  async getUser() {
    const res = await wx.cloud.callFunction({
      name: 'getUser'
    })
    const users = res.result.data
    users.forEach(item => {
      item.realWithdraw =  Math.round(item.balance * 80)/100
      item.profit = Math.round(item.balance * 20)/100
    });
    this.setData({
      users
    })
  },
  call(e) {
    console.log(e)
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone,
    })
  },
  async gotoWithdraw(e) {
    console.log(e.currentTarget.dataset.openid)
    const openid = e.currentTarget.dataset.openid
    const res = await wx.showModal({
      content: '确定要提现吗？'
    })
    if (res.confirm) {
    
     const res2 = await wx.cloud.callFunction({
        name:'updateBalance',
        data:{
          openid,
        }
      })
      this.getUser();

    }
  },
  onPullDownRefresh(){
    this.setData({
      users:[]
    })
    this.getUser();
    wx.stopPullDownRefresh() 
  }

})