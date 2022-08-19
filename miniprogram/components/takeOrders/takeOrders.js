Component({
  properties: {
    item: {
      type: Object,
      value: {}
    }
  }, 
  data: {
    isShowTakeCode: false
  },
  methods: {
    call() {
      this.triggerEvent('call', {
        phone: this.properties.item.address.phone
      });
    },
    take() {
      this.triggerEvent('take', {
        id: this.properties.item._id
      })
    },
    completed() {
      this.setData({
        isShowTakeCode: true
      })
    },
    input(e) {
      const inputCode = Number(e.detail.value)
      const originalCode = this.properties.item.takeGoodsCode
      if (inputCode === originalCode) {
        wx.showToast({
          title: '匹配成功啦',
          icon: 'none'
        })
        wx.cloud.callFunction({
          name: 'updateOrderbyIdToCompleted',
          data: {
            id: this.properties.item._id
          },
          success: (res) => {
            wx.cloud.database().collection('user').where({
              _openid: "这是bug吗？"
            }).update({
              data: {
                balance: wx.cloud.database().command.inc(Number(this.properties.item.price))
              }
            })
            this.triggerEvent('refresh');
          }
        })
      }

    },
    async downloadFile() {
      wx.showLoading({
        title: '正在下载中',
      })
      const {
        fileID
      } = this.properties.item

      const res = await wx.cloud.downloadFile({
        fileID
      })
      console.log(res.tempFilePath)
      const fileManager = wx.getFileSystemManager();
      fileManager.saveFile({
        tempFilePath: res.tempFilePath,
        success:(res2)=>{
          console.log(res2)
          wx.hideLoading()
          wx.showToast({
            title: '下载成功',
          })
          wx.openDocument({
            filePath: res2.savedFilePath,
            showMenu:true
          })
        },
        fail:()=>{
          wx.hideLoading()
          wx.showToast({
            title: '下载失败',
          })
        }
      })
   
    }
  }
})