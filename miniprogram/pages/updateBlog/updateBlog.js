import formatTime from '../../until/formatTime'
let userInfo = {}
let openid = ''
let db = wx.cloud.database();
let content = ""
let beginContent = ""
Page({

  /**
   * 页面的初始数据
   */
  data: {
    blog: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      blogId: options.blogId
    })
    this.getVideoDetail()
  },
  deleteMineBlog() {
    let img = this.data.blog.img
    let that = this
    wx.showModal({
      title: '提示',
      content: '是否要删除这个博客',
      success(res) {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: "blog",
            data: {
              _id: that.data.blogId,
              $url: 'deleteMineBlog'
            }
          }).then(res => {
            wx.cloud.deleteFile({
              fileList: img
            }).then(res => {
              wx.hideLoading();

            }).catch(error => {
              // handle error
            })
            wx.navigateBack();
          })
        } else if (res.cancel) {

        }
      }
    })
  },
  changMineBlog() {
    let that = this
    if (beginContent == content) {
      wx.showModal({
        title: '数据没有更改',
        content: '',
      });
    } else {
      if (content.trim() == "") {
        wx.showModal({
          title: '内容不能为空',
          content: '',
        });
      } else {
        wx.showModal({
          title: '提示',
          content: '是否更改个博客',
          success(res) {
            if (res.confirm) {
              wx.showLoading({
                title: '更改中...',
                mask: true, // 蒙层
              });
              wx.cloud.callFunction({
                name: "blog",
                data: {
                  content,
                  _id: that.data.blogId,
                  $url: 'updataContent'
                }
              }).then(res => {
                wx.hideLoading();
                // 发布成功后-->调到发现页 --> 并让发现也刷新
                wx.navigateBack();
              })
            } else if (res.cancel) {

            }
          }
        })

      }
    }
  },
  changContent(e) {
    content = e.detail.value;
  },
  // 获取博客详情；评论信息
  getVideoDetail() {
    wx.showLoading({
      title: '加载中...',
      mask: true,
    });
    wx.cloud.callFunction({
      name: 'blog',
      data: {
        blogId: this.data.blogId,
        $url: 'detail'
      }
    }).then((res) => {
      res.result.detail[0].createTime = formatTime(new Date(res.result.detail[0].createTime))
      this.setData({
        blog: res.result.detail[0],
      })
      content = this.data.blog.content
      beginContent = this.data.blog.content
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