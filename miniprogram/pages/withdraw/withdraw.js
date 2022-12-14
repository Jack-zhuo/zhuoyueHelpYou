// pages/withdraw/withdraw.js
Page({

  data: {
    withdraws: [],
    tabNow: 0,
    takeOrderers: []
  },
  onLoad(options) {
    this.getWithdraws();
  },

  // 获取提现信息
  async getWithdraws() {
    wx.showLoading({
      title: '加载中',
    })
    const res = await wx.cloud.callFunction({
      name: 'getWithdraws',
    })
    const withdraws = res.result.data
    this.setData({
      withdraws
    })
    wx.hideLoading()
  },

  call(e) {
    const {
      phone
    } = e.currentTarget.dataset
    wx.makePhoneCall({
      phoneNumber: phone,
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
    const res2 = await wx.showModal({
      content: '确认提现吗？',
    })
    if (res2.cancel) return
    
    wx.showLoading({
      title: '处理中',
    })
    const withdraw_user = e.currentTarget.dataset.user
    const resBalance = await wx.cloud.callFunction({
      name: 'updateBalance',
      data: {
        user_id: withdraw_user.user_id,
        balance: withdraw_user.balance * (-1)
      }
    })
    console.log(resBalance)

    const res = await wx.cloud.callFunction({
      name: 'updateWithdraw',
      data: {
        _id: withdraw_user._id,
      }
    })
    wx.hideLoading()
    wx.showToast({
      title: '提现成功',
      success: () => {
        this.getWithdraws()
      }
    })
  },
  async getTakeOrderers() {
    wx.showLoading({
      title: '加载中',
    })
    const res = await wx.cloud.callFunction({
      name: 'getUser',
    })
    const takeOrderers = res.result.data
    this.setData({
      takeOrderers
    })
    wx.hideLoading()
  },
  // tab切换
  tabChange(e) {
    console.log(e.detail)
    const tabNow = e.detail
    this.setData({
      tabNow
    })
    if (tabNow === 0) {
      this.getWithdraws();
    }
    if (tabNow === 1) {
      this.getTakeOrderers()
    }
  },
  onPullDownRefresh() {
    const tabNow = this.data.tabNow
    if (tabNow === 0) {
      console.log('刷新了‘未处理’tab')
      this.setData({
        withdraws: []
      })
      this.getWithdraws();
    }
    if (tabNow === 1) {
      console.log('刷新了‘全部’tab')
      this.setData({
        takeOrderers: []
      })
      this.getTakeOrderers();
    }
    //隐藏loading 提示框
    wx.hideLoading();
    //隐藏导航条加载动画 
    wx.hideNavigationBarLoading();
    //停止下拉刷新
    wx.stopPullDownRefresh();
  },
})