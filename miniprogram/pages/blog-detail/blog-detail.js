import formatTime from '../../until/formatTime'
let userInfo = {}
let openid = ''
let db = wx.cloud.database();
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		blog: {},
		commentList: {},
		talkContent: '',
		loginShow: false,
		modalShow: false,
		isGoods: false,
		isClick: true
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		this.setData({
			blogId: options.blogId
		})
		this.getBlogDetail()
	},
	giveGoods() {
		// 点赞
		// 判断用户是否授权  
		wx.getSetting({
			success: (res) => {
				if (res.authSetting['scope.userInfo']) { // 授权
					if (this.data.isClick) {
						this.setData({
							isClick: false
						})
						let goods = this.data.blog.goods
						if (!openid) {
							wx.cloud.callFunction({
								name: "login",
							}).then(res => {
								openid = res.result.openid
							})
						}
						let flag = true
						goods.forEach((item, index) => {
							if (item == openid) {
								flag = false
								goods.splice(index, 1)
								wx.cloud.callFunction({
									name: "blog",
									data: {
										goods: goods,
										_id: this.data.blog._id,
										$url: 'giveGoods'
									}
								}).then(res => {
									this.setData({
										isGoods: false,
										isClick: true
									})
								})
								return
							}
						})
						if (flag) {
							goods.push(openid)
							wx.cloud.callFunction({
								name: "blog",
								data: {
									goods: goods,
									_id: this.data.blog._id,
									$url: 'giveGoods'
								}
							}).then(res => {
								this.setData({
									isGoods: true,
									isClick: true
								})
							})
						}
					} else {
						wx.showToast({
							title: '正在提交数据，请稍后',
							duration: 1500,
						});
					}
				} else {
					// 没有授权；弹出底部弹出成；获取用户信息
					this.setData({
						loginShow: true,
					})
				}
			}
		});
	},
	talkComment() {
		// 判断用户是否授权  
		wx.getSetting({
			success: (res) => {
				if (res.authSetting['scope.userInfo']) { // 授权
					// 获取用户信息
					wx.getUserInfo({
						success: (res) => {
							userInfo = res.userInfo
							this.setData({
								modalShow: true
							})
						},
					});
				} else {
					// 没有授权；弹出底部弹出成；获取用户信息
					this.setData({
						loginShow: true,
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
	onFocus(event) {
		// 模拟器获取的高度为0
		this.setData({
			footerBottom: event.detail.height    // 键盘的高度
		})
	},
	onBlur() {
		// 失去焦点 底部固定定位 0
		this.setData({
			footerBottom: 0,
		})
	},
	// 发布评论
	onsend(event) {
		// 插入数据库  用户信息  评论内容  博客ID  评论的时间
		let content = event.detail.value.content;
		if (content.trim() == '') {
			wx.showModal({
				title: '评论内容不能为空',
				content: ''
			})
			return
		}
		wx.showLoading({
			title: "评论中...",
			mask: true
		})
		db.collection("blog-comment").add({
			data: {
				content,
				createTime: db.serverDate(),
				blogId: this.data.blog._id,
				nickName: userInfo.nickName,
				avatarUrl: userInfo.avatarUrl
			}
		}).then((res) => {
			let comment = this.data.blog.comment
			comment.push(res._id)
			wx.cloud.callFunction({
				name: "blog",
				data: {
					comment: comment,
					_id: this.data.blog._id,
					$url: 'updateTalk'
				}
			}).then(res => { })
			wx.hideLoading();
			wx.showToast({
				title: '评论成功',
				duration: 1500,
			});
			this.setData({
				modalShow: false,
				talkContent: ''  // 数据双向绑定
			})
			// 父元素刷新评论页面
			this.getBlogDetail()
		})
	},
	// 获取博客详情；评论信息
	getBlogDetail() {
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
			let commentList = res.result.commentList.data;
			commentList.forEach(element => {
				// 时间格式化
				element.createTime = formatTime(new Date(element.createTime))
			});
			this.setData({
				blog: res.result.detail[0],
				commentList: res.result.commentList.data
			})
			if (openid != '') {
				this.data.blog.goods.forEach(item => {
					if (item == openid) {
						this.setData({
							isGoods: true,
							// isClick: false,
						})
						return
					}
				})
			} else {
				wx.getSetting({
					success: (res) => {
						if (res.authSetting['scope.userInfo']) { // 授权
							// 获取用户信息
							wx.cloud.callFunction({
								name: "login",
							}).then(res => {
								openid = res.result.openid
								this.data.blog.goods.forEach(item => {
									if (item == openid) {
										this.setData({
											isGoods: true
										})
										return
									}
								})
							})
						}
					},
				});

			}
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