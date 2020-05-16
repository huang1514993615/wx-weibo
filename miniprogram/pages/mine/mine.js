let app = getApp();
let userInfo = ''
let openid = ""

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    modalShow: false,  // 控制底部弹出层显示隐藏
    myImage: "../../images/mine/picture.png",
    myName: "未登入",
    myCountry: "未知",
    myBlogCount: 0,
    fans: 0,
    attention: 0,
    vip: false,
    vipImage: "../../images/mine/vip.png",
    superVipImage: "../../images/mine/supervip.png",
    mineMoreOne: [
      {
        photo: "../../images/mine/album.png",
        mean: "我的相册"
      },
      {
        photo: "../../images/mine/story.png",
        mean: "我的故事"
      },
      {
        photo: "../../images/mine/good.png",
        mean: "我的赞"
      },
      {
        photo: "../../images/mine/fans.png",
        mean: "粉丝服务"
      }
    ],
    mineMoreTwo: [
      {
        photo: "../../images/mine/money.png",
        mean: "微博钱包"
      },
      {
        photo: "../../images/mine/optimization.png",
        mean: "微博优选"
      },
      {
        photo: "../../images/mine/headline.png",
        mean: "粉丝头条"
      },
      {
        photo: "../../images/mine/service.png",
        mean: "客服"
      }
    ],

  },
  goMineBlog() {
    wx.navigateTo({
      url: "/pages/myBlog/myBlog?openid=" + openid
    })
  },
  setMineInfo() {
    wx.navigateTo({
      url: `/pages/setMineInfo/setMineInfo`,
    });
  },
  findFriend() {
    wx.navigateTo({
      url: `/pages/find/find`,
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    let that = this
    wx.getUserInfo({
      success: function (res) {
        userInfo = res.userInfo
        console.log(res);
        that.setData({
          myImage: userInfo.avatarUrl,
          myName: userInfo.nickName,
          myCountry: userInfo.country,
          modalShow: false,
          isLogin: true
        })
        wx.cloud.callFunction({
          name: "login",
        }).then(res => {
          openid = res.result.openid
          wx.showLoading({
            title: '加载中....',
          });
          wx.cloud.callFunction({
            name: "blog",
            data: {
              openid,
              $url: 'myCount'
            }
          }).then((res) => {
            that.setData({
              myBlogCount: res.result.total
            })
            wx.hideLoading();
          })
        })
      }
    })

  },
  // 用户登入成功
  onloginSuccess(event) {
    userInfo = event.detail.userInfo
    this.setData({
      // myImage: true
      myImage: event.detail.userInfo.avatarUrl,
      myName: event.detail.userInfo.nickName,
      myCountry: event.detail.userInfo.country,
      isLogin: true
    })
    wx.cloud.callFunction({
      name: "login",
    }).then(res => {
      openid = res.result.openid
      wx.showLoading({
        title: '加载中....',
      });
      wx.cloud.callFunction({
        name: "blog",
        data: {
          openid,
          $url: 'myCount'
        }
      }).then((res) => {
        this.setData({
          myBlogCount: res.result.total
        })
        wx.hideLoading();
      })
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
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (this.data.isLogin == false) {
      // console.log('发起授权');
      // 判断用户是否授权  
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userInfo']) { // 授权
            // 获取用户信息
            wx.getUserInfo({
              success: (res) => {
                // 表是登录成功；执行登录成功的方法
                this.onloginSuccess({
                  detail: res
                });
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
    }
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