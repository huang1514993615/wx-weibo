let app = getApp();
let userInfo = app.userInfo
let keyword = '' // 表示索索条件
let db = wx.cloud.database();
// 获取数据的总长度 （建议在云函数中做）
let videoCount = 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoList: [],
    isSend: true,
    modalShow: false,
    blogUpContent: '点击加载更多'
  },
  onUpLoad() {
    if (this.data.isSend) {
      if (this.data.videoList.length == videoCount) {
        this.setData({
          blogUpContent: "没有更多内容了...",
          isSend: false
        })
        return
      }
      this.loadVideoList(this.data.videoList.length)
    }
  },
  onloginSuccess() {
    wx.navigateTo({
      url: "/pages/writeVideo/writeVideo"
    })
  },
  goVideoDetail(event) {
    wx.navigateTo({
      url: "/pages/video-detail/video-detail?videoId=" + event.currentTarget.dataset.videoid
    })
  },
  wrtiePlay() {
    // 判断用户是否授权  
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) { // 授权
          // 获取用户信息
          wx.getUserInfo({
            success: (res) => {
              userInfo = res.userInfo
              wx.navigateTo({
                url: "/pages/writeVideo/writeVideo"
              })
            },
          });
        } else {
          // 没有授权；弹出底部弹出成；获取用户信息
          this.setData({
            modalShow: true,
          })
        }
      },
      fail: () => { },
      complete: () => { }
    });
  },
  // 用户没授权
  onloginFail() {
    wx.showModal({
      title: '授权用户才能发布视频',
      content: '',
      showCancel: true,
      cancelText: '取消',
      cancelColor: '#000000',
      confirmText: '确定',
      confirmColor: '#1296db',
      success: (result) => {
        if (result.confirm) {
          this.setData({
            modalShow: true,
          })
        }
      },
    });
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
    this.loadVideoList()
    wx.cloud.callFunction({
      name: "video",
      data: {
        $url: 'count'
      }
    }).then((res) => {
      videoCount = res.result.total
    })
  },
  // this.loadBlogList(this.data.videoList.length)
  // 获取博客列表数据
  loadVideoList(start = 0) {
    wx.showLoading({
      title: '加载中....',
    });
    wx.cloud.callFunction({
      name: "video",
      data: {
        keyword,
        start,
        count: 10,
        $url: 'list'
      }
    }).then((res) => {
      // 更新videoList
      this.setData({
        // 分页加载数据，--->累加过程 -->合并数组方式
        videoList: this.data.videoList.concat(res.result)
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
    this.setData({
      videoList: [],
      blogUpContent: "点击加载更多"
    })
    this.loadVideoList()
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