// pages/withdraw/withdraw.js
Page({

  data: {
    withdraws: [],
  },
  onLoad(options) {
    this.getWithdraws();
  },
  async getWithdraws() {
    const res = await wx.cloud.callFunction({
      name: 'getWithdraws',
    })
    console.log(res);
    const withdraws = res.result.data
    this.setData({
      withdraws
    })
  },

  // 复制微信号
  copyWechat(e) {
    wx.setClipboardData({
      data: e.currentTarget.dataset.wechat,
    })
  },
  // 确认提现
  async gotowithdraw(e) {
    const withdraw_user = e.currentTarget.dataset.user
    const resBalance = await wx.cloud.callFunction({
        name:'updateBalance',
        data:{
          user_id:withdraw_user.user_id,
          balance:withdraw_user.balance * (-1)
        }
    })
     console.log(resBalance)

    const res = await wx.cloud.callFunction({
      name: 'updateWithdraw',
      data: {
        _id: withdraw_user._id,
      }
    })
    console.log(res)
  }
})