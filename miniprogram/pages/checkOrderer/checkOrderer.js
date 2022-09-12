Page({
  data: {
    applyTake: []
  },
  onLoad() {
    this.getApplyTake();
  },

  async getApplyTake() {
    //  const res = await wx.cloud.database().collection('apply_take').get()
    const res = await wx.cloud.callFunction({
      name: 'getApplyTake',
    })
    console.log(res);
    this.setData({
      applyTake: res.result.data
    })
  },

  // 通过
  async approve(e) {
    const resTip = await wx.showModal({
      'title':'确认通过吗？'
    })
    if(resTip.cancel) return
    console.log(e.currentTarget.dataset.applicant)
    const {_openid,name,motto,phone} = e.currentTarget.dataset.applicant;
  
    // 更新用户表
    const res = await wx.cloud.callFunction({
      name: 'updateUserById',
      data: {
        _openid,
        name,
        phone,
        motto
      }
    })

    // 更新申请接单人表
      const res2 = await wx.cloud.callFunction({
        name: 'updateApplyTake',
        data: {
          _openid
        }
      })
      console.log(res2)
      this.getApplyTake();
      wx.showToast({
        title: '操作成功',
        icon: 'none'
      })

  },

  // 不通过
  async delete(e) {
    const resTip = await wx.showModal({
      'title':'确认不通过吗？'
    })
    if(resTip.cancel) return
    console.log(e);
    const openid = e.currentTarget.dataset.openid;
    const res = await wx.cloud.callFunction({
      name: 'deleteUserById',
      data: {
        openid
      }
    })
    console.log("删除结果", res)
    this.getApplyTake();
  },

  // 拨打电话
  call(e) {
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.phone,
    })
  },
  onPullDownRefresh() {
    this.getApplyTake();
    this.setData({
      applyTake: []
    })
    wx.stopPullDownRefresh();
  },
})