Component({
  /**
   * 组件的属性列表
   */
  properties: {
    video: {
      type: Object
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    content: '',
    isShow: true
  },
  observers: {
    'video': function () {
      if (this.data.video.content.length > 60) {
        this.setData({
          content: this.data.video.content.slice(0, 58) + '...'
        })
      } else {
        this.setData({
          content: this.data.video.content
        })
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    runVideo(){},
    bindSendDanmu() {
      this.videoContext.sendDanmu({
        text: this.inputValue,
        color: getRandomColor()
      })
    },

  }
})
