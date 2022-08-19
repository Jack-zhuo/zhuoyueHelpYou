Component({
  properties:{
    item:{
      type:Object,
      value:{}
    }
  },
  methods:{
    getWeChat(){
        wx.setClipboardData({
          data: 'zyjava2020',
          success: () => {
            wx.showToast({
              title: '复制客服微信成功！',
              icon: 'none'  
            })
          }
        })
    },
    call(){
      wx.makePhoneCall({
        phoneNumber: this.properties.item.takeOrderer.info.phone,
      })
    }
    
  }
})