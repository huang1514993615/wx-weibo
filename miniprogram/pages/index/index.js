let keyword = '' // 表示索索条件
let db = wx.cloud.database();
// 获取数据的总长度 （建议在云函数中做）
let blogCount = 0
let app = getApp();
let userInfo = ''

Page({
  /**
   * 页面的初始数据
   */
  data: {
    listNum: 0,
    navList: ['关注', '推荐'],
    blogUpContent: '点击加载更多',
    isSend: true,
    isShow: true,
    blogList: [],
    backToTop: 0,
    modalShow: false
  },
  onloginSuccess() {
    wx.navigateTo({
      url: '/pages/wrtieBlog/wrtieBlog'
    })
  },
  goBlogDetail(event) {
    wx.navigateTo({
      url: "/pages/blog-detail/blog-detail?blogId=" + event.currentTarget.dataset.blogid
    })
  },
  // 用户没授权
  onloginFail() {
    wx.showModal({
      title: '授权用户才能发布博客',
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
  onPullDownRefresh: function () {
    this.setData({
      blogList: []
    })
    this.loadBlogList()

  },
  wrtieBlog() {
    // 判断用户是否授权  
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userInfo']) { // 授权
          // 获取用户信息
          wx.getUserInfo({
            success: (res) => {
              userInfo = res.userInfo
              wx.navigateTo({
                url: '/pages/wrtieBlog/wrtieBlog'
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
  changeNum(event) {
    this.setData({
      listNum: event.detail.current
    })
  },
  changeListNum(event) {
    this.setData({
      listNum: event.target.dataset.index
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadBlogList()
    wx.cloud.callFunction({
      name: "blog",
      data: {
        $url: 'count'
      }
    }).then((res) => {
      blogCount = res.result.total
    })
  },
  // 获取博客列表数据
  loadBlogList(start = 0) {
    wx.showLoading({
      title: '加载中....',
    });
    wx.cloud.callFunction({
      name: "blog",
      data: {
        keyword,
        start,
        count: 10,
        $url: 'list'
      }
    }).then((res) => {
      // 更新blogList
      this.setData({
        // 分页加载数据，--->累加过程 -->合并数组方式
        blogList: this.data.blogList.concat(res.result)
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
      blogList: [],
      blogUpContent: "点击加载更多"
    })
    this.loadBlogList()
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  onUpLoad() {
    if (this.data.isSend) {
      if (this.data.blogList.length == blogCount) {
        this.setData({
          blogUpContent: "没有更多内容了...",
          isSend: false
        })
        return
      }
      this.loadBlogList(this.data.blogList.length)
    }
  },
  goTop() {
    this.setData({
      backToTop: 0
    })
  },
  scrolltop(event) {
    let top = event.detail.scrollTop; // 当前滚动条位置
    if (top > 800 && this.data.isShow) {
      this.setData({
        isShow: false
      })
    }
    if (top <= 800 && !this.data.isShow) {
      this.setData({
        isShow: true
      })
    }
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})