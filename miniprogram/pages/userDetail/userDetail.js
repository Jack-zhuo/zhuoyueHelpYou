import {
  getUser
} from "../../utils/getUser"

// pages/userDetail/userDetail.js
Page({
  data: {
    user: {}
  },
  async onLoad(options) {
    // console.log(options)
    const args = {
        options,
        i:0
    }
    this.getUser(args)
  },
  //  获取用户信息
  async getUser(args) {
    const res = await wx.cloud.callFunction({
      name: 'getUserOfSingle',
      data: {
        _openid: args.options._openid,
        i:0
      }
    })
    console.log(res)
    this.setData({
      user: res.result.data[0]
    })
  },

  onShareAppMessage() {

  }
})