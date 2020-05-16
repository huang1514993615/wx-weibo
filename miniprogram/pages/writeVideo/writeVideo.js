let app = getApp();
let userInfo = ""
const db = wx.cloud.database();
let MAX_TITLE_NUM = 30
let MAX_WORDS_NUM = 140
let titlieContext = ''
let context = ''
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoUrl: '',
    selectPhoto: true,
    titleNum: '',
    wordsNum: '',
    footerBottom: 0
  },

  onFocus(event) {
    this.setData({
      footerBottom: event.detail.height    // 键盘的高度
    })
  },
  onBlur() {
    this.setData({
      footerBottom: 0,
    })
  },
  onTitlieInput(event) {
    titlieContext = event.detail.value;
    let titleNum = event.detail.cursor;
    this.setData({
      titleNum: "标题： " + titleNum,
    })
  },
  onInput(event) {
    context = event.detail.value;
    let wordsNum = event.detail.cursor;
    this.setData({
      wordsNum: "内容： " + wordsNum,
    })
  },
  send() {
    if (titlieContext.trim() == "") {
      wx.showModal({
        title: '请输入内容',
        content: '',
      });
    } else {
      wx.showLoading({
        title: '发布中...',
        mask: true, // 蒙层
      });
      let suffix = /\.\w+$/.exec(this.data.videoUrl)[0]
      //上传视频
      wx.cloud.uploadFile({
        cloudPath: 'video/' + Date.now() + '-' + Math.random() * 1000000 + suffix, // 文件在云存储中地址
        filePath: this.data.videoUrl,
        success: (res) => {
          //上传成功后隐藏加载框
          console.log(userInfo, 111);

          db.collection('video').add({
            data: {
              ...userInfo,
              title: titlieContext,
              content: context,
              fileID: res.fileID,
              share: [],
              comment: [],
              goods: [],
              createTime: db.serverDate()   // 服务器时间  服务器时间比客户端时间准
            }
          }).then((res) => {
            wx.hideLoading();
            wx.showToast({
              title: '发布成功',
            });
            // 发布成功后-->调到发现页 --> 并让发现也刷新
            wx.navigateBack();
            const pages = getCurrentPages();  // 获取页面栈 在栈中可以获取返回页面的；页面对象；---> 可以调用这个页面中的方法
            // pages[0] 是 blog 页面对象 
            pages[0].setData({
              videoList: []  // 先清空列表 在获取博客列表
            })
            pages[0].loadVideoList()  // 在一个页面中执行另一个页面中的方法

          }).catch((res) => {
            wx.hideLoading();
            wx.showToast({
              title: '发布失败',
            });
          })
        },
        fail: function (res) {
          console.log("图片上传失败" + res);
          wx.hideLoading();
        }
      })
    }
  },
  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {

  },
  bindVideoEnterPictureInPicture() {
    console.log('进入小窗模式')
  },

  bindVideoLeavePictureInPicture() {
    console.log('退出小窗模式')
  },

  bindPlayVideo() {
    console.log('1')
    this.videoContext.play()
  },
  bindSendDanmu() {
    this.videoContext.sendDanmu({
      text: this.inputValue,
      color: getRandomColor()
    })
  },

  videoErrorCallback(e) {
    console.log('视频错误信息:')
    console.log(e.detail.errMsg)
  },
  onChooseVideo() {
    let that = this;
    wx.showLoading({
      title: '加载中...',
      icon: 'loading',
    });
    wx.chooseVideo({
      sourceType: ['album', 'camera'], //视频选择的来源
      //sizeType: ['compressed'],
      compressed: false,//是否压缩上传视频
      camera: 'back', //默认拉起的是前置或者后置摄像头
      success: function (res) {
        wx.hideLoading();
        //上传成功，设置选定视频的临时文件路径
        that.setData({
          videoUrl: res.tempFilePath,
          selectPhoto: false
        });
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中....',
    });
    wx.getUserInfo({
      success: function (res) {
        userInfo = res.userInfo
      }
    })
    wx.hideLoading();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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