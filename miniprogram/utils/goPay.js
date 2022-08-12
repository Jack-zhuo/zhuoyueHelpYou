const db = wx.cloud.database();
export const pay = async (id, name, price) => {
  const res = await wx.cloud.callFunction({
    name: 'toPay',
    data: {
      goodName: name,
      totalFee: price * 100
    }
  })
  const payment = res.result.payment
  wx.hideLoading()
  wx.requestPayment({
    ...payment,
    success(res) {
      db.collection('orders').doc(id).update({
        data: {
          status: 1
        },
        success: (res) => {
          wx.showToast({
            title: '付款成功',
            icon: 'none'
          })
          wx.switchTab({
            url: '../order/order'
          })
        }
      });
    },
    fail(err) {
      wx.showToast({
        title: '付款失败',
        icon: 'none'
      })
    }
  })

}