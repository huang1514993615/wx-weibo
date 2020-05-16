let app = getApp();

Component({

  properties: {
    modalShow: {
      type: Boolean,
      value: false
    }
  },


  data: {

  },


  methods: {
    onGetUserInfo(event) {
      const userInfo = event.detail.userInfo;
      // app.userInfo = userInfo
      // wx.setStorage({
      //   key: "userInfo",
      //   data: userInfo
      // })
      // 允许授权
      if (userInfo) {
        this.setData({
          modalShow: false
        })
        // 告诉所有使用Login的组件 登录成功
        this.triggerEvent('loginsuccess', {
          userInfo
        })
      } else {
        // 告诉所有使用login 的组件 登录失败  
        this.triggerEvent('loginfail')
      }
    }
  },

})
