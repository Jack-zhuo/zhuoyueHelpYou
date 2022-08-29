 import { ml_showToast } from '../../utils/showTips.js'
Page({
  data: {
    name: '',
    phone: '',
    cla:''
  },
  // 输入名字
  inputName(e) {
    const name = e.detail.value
    this.setData({
      name
    })
  },
  // 输入班级
  inputClass(e) {
    const cla = e.detail.value
    this.setData({
      cla
    })
  },
  // 获取手机号
  async getPhoneNumber(e) {
    const cloudID = e.detail.cloudID;
    const res = await wx.cloud.callFunction({
      name: 'getPhoneNumber',
      data: {
        cloudID
      }
    })
    const phone = res.result.list[0].data.phoneNumber;
    this.setData({
      phone
    })
  },
  //  提交申请
  async submit() {
    if (this.data.name === '') {
      wx.showToast({
        title: '姓名不能为空',
        icon: 'error'
      })
      return
    }
    if (this.data.phone === '') {
      wx.showToast({
        title: '请获取手机号',
        icon: 'error'
      })
      return
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    const res1 = await wx.cloud.database().collection('apply_take').get()
    console.log();
    if(res1.data.length !== 0){
       wx.hideLoading();
     const res3 = await ml_showToast('你已申请卓越帮你忙接单员，请耐心等待审核。不要重复申请.')
      console.log(res3)

      setTimeout(()=>
      {
        wx.navigateTo({
          url: '../takeOrders/takeOrders',
        })
      }, 2000)
     
       return 
    }

    const res2 = await wx.cloud.database().collection('apply_take').add({
      data: {
        name: this.data.name,
        phone: this.data.phone,
        class:this.data.cla,
        isPass:false
      }
    })
    if (res2.errMsg === "collection.add:ok") {
      wx.hideLoading()
      await ml_showToast('申请成功，请耐心等待管理员审核')
      setTimeout(()=>{
        wx.navigateTo({
          url: '../takeOrders/takeOrders',
        })
      }, 2000)
    }
  }
})