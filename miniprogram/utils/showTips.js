export const ml_showToast = (title) => {
  return new Promise((resolve) => {

    wx.showToast({
      title,
      icon: 'none',
      mask: true,
      duration: 2000,
      success:resolve
    })
  })
}