// pages/aboutus/aboutus.js
Page({
  goCopy(){
    wx.setClipboardData({
      data: 'zyjava2020',
      success:()=>{
        wx.showToast({
          title: '微信复制成功',
          icon:'success'
        })
      }
    })
  }
})