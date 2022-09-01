Component({
  properties:{
    note:{
      type:String,
      value:"有任何疑问都可以咨询下方微信"
    },
  },
  data:{
    tabNow:Number(0)
  }, 
  methods:{
    copyWeChat() {
      wx.setClipboardData({
        data: 'zyjava2020',
        success:()=>{
          wx.showToast({
            title: '微信复制成功',
          })
        }
      })
    },
  }
})