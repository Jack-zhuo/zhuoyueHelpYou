
const db_user = wx.cloud.database().collection('user')
Page({
  user:{},
  data: {
    user: {}
  },
  onLoad(options) {
    this.user = wx.getStorageSync('user')
    this.setData({
      user:this.user
    })
  },
  async changeAvatar() {
    const res = await wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      camera: 'front'
    });
    const tempPath = res.tempFiles[0].tempFilePath
    const res2 = await wx.cloud.uploadFile({
      cloudPath:'avatar/'+new Date().getTime()+'.png',
      filePath:tempPath
    })
    console.log('上传完成后的返回结果',res2);
    this.user.info.avatar = res2.fileID
    this.setData({
     user:this.user 
    })
    
  },
  changeName(e){
    console.log(e.detail.value);
    this.user.info.name = e.detail.value
    this.setData({
      user:this.user
    })
  },
 async getPhoneNumber(e){
      const cloudID = e.detail.cloudID;
      const res = await wx.cloud.callFunction({
        name:'getPhoneNumber',
        data:{
          cloudID
        }
      })
      const phone = res.result.list[0].data.phoneNumber;
      this.user.info.phone = phone
      this.setData({
        user:this.user
      })
  },
  async submit(e){
    wx.setStorageSync('user', this.user)
   const res = await db_user.where({
     _openid:wx.getStorageSync('opneid')
   }).update({
      data:{ info:this.user.info }
    })
   wx.navigateBack({
     delta:1
   });
  }
})