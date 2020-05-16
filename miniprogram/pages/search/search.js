let context = ""
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowSearch: false,
    blogList: []
  },
  goBlogDetail(event) {
    wx.navigateTo({
      url: "/pages/blog-detail/blog-detail?blogId=" + event.currentTarget.dataset.blogid
    })
  },
  onInput(event) {
    context = event.detail.value;
  },
  searchBtn() {
    // 先清空 在加载搜索结果
    this.setData({
      blogList: [],
    })
    this.loadBlogList()
    // 当blogList 的长度为0 的时候；表示么有搜索到内容
    // ------> 等获取博客列表异步 结束时候 在进行判断
    setTimeout(() => {
      if (this.data.blogList.length === 0) {
        this.setData({
          isNolist: true
        })
      }
    }, 3000)
  },
  loadBlogList(start = 0) {
    wx.showLoading({
      title: '加载中....',
    });
    wx.cloud.callFunction({
      name: "blog",
      data: {
        keyword: context, // 搜索条件
        start,
        count: 10,
        $url: 'list'
      }
    }).then((res) => {
      // 更新blogList
      this.setData({
        // 分页加载数据，--->累加过程 -->合并数组方式
        blogList: this.data.blogList.concat(res.result),
        // isReachBottom: false,
        // isNolist: false
      })
      this.setData({
        isShowSearch: false
      })
      wx.hideLoading();
    })
  },
  searchShow() {
    this.setData({
      isShowSearch: true
    })
  },
  searchHiddle() {
    this.setData({
      isShowSearch: false
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})