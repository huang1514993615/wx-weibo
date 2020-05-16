let start = 0
let count = 10
let mineBlogCount = 0

Page({

  /**
   * 页面的初始数据
   */
  data: {
    openid: '',
    myBlog: [],
    blogUpContent: '等待加载更多中...',
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      myBlog: [],
      blogUpContent: "点击加载更多"
    })
    this.getMineBlog()
  },
  goUpdateBlogg(e) {
    wx.navigateTo({
      url: "/pages/updateBlog/updateBlog?blogId=" + e.currentTarget.dataset.blogid
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      openid: options.openid
    })
    wx.cloud.callFunction({
      name: "blog",
      data: {
        openid: options.openid,
        $url: 'mineCount'
      }
    }).then((res) => {
      // console.log(res);
      mineBlogCount = res.result.total
    })
    this.getMineBlog()
  },
  getMineBlog(start = 0) {
    wx.showLoading({
      title: '加载中....',
    });
    let openid = this.data.openid
    wx.cloud.callFunction({
      name: "blog",
      data: {
        start,
        count: 10,
        openid,
        $url: 'myBlog'
      }
    }).then((res) => {
      // console.log(res);
      this.setData({
        myBlog: res.result
      })
      wx.hideLoading();
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      myBlog: [],
      blogUpContent: "点击加载更多"
    })
    this.getMineBlog()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.myBlog.length == mineBlogCount) {
      this.setData({
        blogUpContent: "没有更多内容了...",
      })
      return
    }
    this.getMineBlog(this.data.myBlog.length)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})