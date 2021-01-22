<template>
	<div>
		<!--视频组件容器-->
    <div class="content">
    	<!--左边成员列表名单-->
      <div class="left">
      	<div id="warp" class="userlist">
      		<!--本地流-->
        	<div id='local_stream' class="local_stream" @click="switchMain"></div>
          <div id='mask' class="local_stream" v-show="!isVedio"></div>
      	</div>
      	<!--远端流-->
      	<div class="userlist"  v-for="item in list" :key="item.id"  :class="{active: activeId==item.id}" @click="activeId=item.id">
        	<div :id="item.id" class="distant-stream" v-html="item.remoteStream" @click="getVideo(item.id)">222</div>
      	</div>
      </div>
      <!--右边视频盒子-->
      <div class="right" id="right">
      	<!--相关的操作-->
        <div class="operator">
           <!-- @click="muteLocalAudio" -->
          <div class="item">
          	<div class="img-warp">
              <span  id="audio" class="img" v-show="isAudio">01语音</span>
              <span  id="unaudio" class="img" v-show="!isAudio">06取消静音</span>

          		<!-- <img id="audio" class="img" src="../../static/images/01语音@2x.png" alt="语音" v-show="isAudio"/> -->
          		<!-- <img id="unaudio" class="img" src="../../static/images/06取消静音@2x.png" alt="语音" v-show="!isAudio"/> -->
          	</div>
            <span>{{ isAudio ? '静音' : '取消静音' }}</span>
          </div>
           <!-- @click="muteLocalVideo" -->
          <div class="item">
          	<div class="img-warp">
              <span  class="img" v-show="isVedio">02视频</span>
              <span class="img" v-show="!isVedio">07打开摄像头</span>
          		<!-- <img class="img" src="../../static/images/02视频@2x.png" alt="视频" v-show="isVedio"/> -->
          		<!-- <img class="img" src="../../static/images/07打开摄像头@2x.png" alt="视频" v-show="!isVedio"/> -->
          	</div>
            <span>{{ isVedio ? '关闭摄像头' : '打开摄像头' }}</span>
          </div>
          <div class="item">
          	<div class="img-warp">
              <span  class="img" @click="closeRoom">04挂断</span>

          		<!-- <img class="img" src="../../static/images/04挂断@2x.png" alt="离开会议"/> -->
          	</div>
            <span @click="closeRoom">离开会议</span>
          </div>
        </div>
      </div>
    </div>
	</div>
</template>

<script>
import LibGenerateTestUserSig from '../../public/js/lib-generate-test-usersig.min.js'
import $ from '../../public/js/jquery-3.2.1.min.js'
import TRTC from 'trtc-js-sdk'
export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data () {
    return {
      activeId: '', // 当前视频的播放id
      list: [], // 远端流列表
      userId: '76720261', // 用户id --可更改
      roomId: 888888, // 房间号--加入相同房间才能聊
      client: '', // 客户端服务
      remoteStream: '', // 远方播放流
      localStream: '', // 本地流,
      isVedio: true, // 当前本地是否打开摄像头
      isAudio: true, // 当前本地是否打开麦克风
      members_: new Map(), // 成员
      isHave: false, //当前列表是否有该成员
    }
  },
  mounted(){
    this.createClient ('76720261')
  },
  methods:{
    // 创建链接
    createClient (userId) {
      // 获取签名
      const config = this.genTestUserSig(userId)
      const sdkAppId = config.sdkAppId
      const userSig = config.userSig
      this.client = TRTC.createClient({
        mode: 'rtc',
        sdkAppId,
        userId,
        userSig
      })
      // 初始化后才能加入房间
      this.joinRoom()
    },
    // 获取用户签名
    genTestUserSig (userID) {
      const SDKAPPID = 1400455126
      const EXPIRETIME = 604800
      const SECRETKEY =
        '488f4739ac08fb9c8d59435f687f0bbb070a071f435860a99e44600b2818fe8a'

      // a soft reminder to guide developer to configure sdkAppId/secretKey
      if (SDKAPPID === '' || SECRETKEY === '') {
      	return false
      }
      const generator = new LibGenerateTestUserSig(SDKAPPID, SECRETKEY, EXPIRETIME)
      const userSig = generator.genTestUserSig(userID)
      return {
        sdkAppId: SDKAPPID,
        userSig: userSig
      }
    },
    // 加入房间
    async joinRoom () {
      await this.client.join({ roomId: this.roomId })// Number(this.videoInfo.roomNumber)
        .then(() => {
          // 创建本地流
          this.createStream()
          // 播放远端流
          this.playStream()
        })
        .catch((error) => {
          console.error('进房失败 ' + error)
        })

      // 注册远程监听
      this.subscribeStream()
    },
    // 创建本地音视频流
    createStream () {
      this.localStream = TRTC.createStream({ userId: this.userId, audio: true, video: true })

      this.localStream.initialize().then(() => {
        console.log('初始化本地流成功')
        // 本地流播放 local_stream 是本地流div的id
        this.localStream.play('local_stream')
        
        // 创建好后才能发布
        this.publishStream()
        this.updateStream()
      })
        .catch((error) => {
          console.error('初始化本地流失败 ' + error)
        })
    },
    // 发布本地音视频流
    publishStream () {
      this.client
        .publish(this.localStream)
        .catch((error) => {
          console.error('本地流发布失败 ' + error)
        })
        .then(() => {
        	// $('#local_stream').addClass('mainVedio').parent().addClass('active')
          console.log('本地流发布成功')
        })
    },
    // 远端监听
    updateStream () {
    	this.client.on('stream-removed', (event) => {
			  const remoteStream = event.stream
			  // $(`${'#mask_' + remoteStream.getId()}`).hide()
			  // $(`${'#status_' + remoteStream.getId()}`).show()
      })
      // 关闭摄像头
	    this.client.on('mute-video', (evt) => {
      	let streamId = this.getUidByStreamId(evt.userId)
	      if (streamId) {
	        // $('#mask_' + streamId).show()
	      }
	    })
      // 打开摄像头
	    this.client.on('unmute-video', (evt) => {
      	let streamId = this.getUidByStreamId(evt.userId)
	      if (streamId) {
	        // $('#mask_' + streamId).hide()
	      }
	    })
      // 关闭语音
	    this.client.on('mute-audio', (evt) => {
      	let streamId = this.getUidByStreamId(evt.userId)
      	// $(`${'#user_' + streamId}`).find('#audio_' + streamId).hide().next().show()
	    })
      // 打开语音
	    this.client.on('unmute-audio', (evt) => {
      	let streamId = this.getUidByStreamId(evt.userId)
      	// $(`${'#user_' + streamId}`).find('#unaudio_' + streamId).hide().prev().show()
	    })
    },
    // 根据id获取uid
	  getUidByStreamId (streamId) {
	    for (let [uid, stream] of this.members_) {
	      if (stream.getUserId() == streamId) {
	        return uid
	      }
	    }
	  },
    // 订阅远端流--加入房间之前
    subscribeStream () {
      this.client.on('stream-added', (event) => {
        const remoteStream = event.stream
    		this.isHave = false
		    for (let [uid, stream] of this.members_) {
		    	if (stream.getUserId() === remoteStream.getUserId()) {
	        	// $('#user_' + stream.getId()).remove()
		    		this.members_.delete(stream.getId())
        		this.isHave = true
		    	}
		    }
		    this.members_.set(remoteStream.getId(), remoteStream)
        console.log('远端流增加: ', remoteStream.getUserId())
        // 订阅远端流
        this.client.subscribe(remoteStream)
      })
    },

    // 播放远端流
    playStream () {
      this.client.on('stream-subscribed', (event) => {
        const remoteStream = event.stream
        console.log('远端流订阅成功：' + remoteStream.getId())
        // 创建远端流标签

      	const id = remoteStream.getId()
        this.remoteStream = `<view id="${'remote_stream-' + id}" style="width:300px;height:300px"></view>`
        if (!this.isHave) {
	        this.list.push({
	        	id,
	        	userId: remoteStream.getUserId(),
	        	remoteStream: this.remoteStream,
	        	origin: remoteStream
	        })
        } else {
	        this.list.splice(this.list.findIndex((v) => v.userId === remoteStream.getUserId()), 1, {
	        	id,
	        	userId: remoteStream.getUserId(),
	        	remoteStream: this.remoteStream,
	        	origin: remoteStream
	        })
        }
        // 做了dom操作 需要使用$nextTick(),否则找不到创建的标签无法进行播放
        this.$nextTick(() => {
          // 播放
          remoteStream.play('remote_stream-' + id)
          let audio = $('#audio').clone()
          audio.attr('id', 'audio_' + id)
          audio.css({    
          	'width': '14px',
    				'height': '21px',
    				'background': 'none',
    				'margin-left': 'auto'
    			})
          let unaudio = $('#unaudio').clone()
          unaudio.attr('id', 'unaudio_' + id)
          unaudio.css({    
          	'width': '14px',
    				'height': '21px',
    				'background': 'none',
    				'margin-left': 'auto'
    			})

		      let mask = $('#mask').clone()
		      mask.text('')
		      mask.attr('id', 'mask_' + id)
		      mask.css({
		      	'width': '100%',
		      	'height': '100%',
		      	'text-align': 'center',
		      	'z-index': '99'
		      })
		      mask.appendTo($('#player_' + id))
		      mask.hide()

		      let status = $('<div>', {
		      	id: 'status_' + id
		      })
		      status.css({
		      	'width': '100%',
		      	'height': '100%',
		      	'text-align': 'center',
		      	'color': '#fff',
    				'display': 'flex',
    				'align-items': 'center',
    				'justify-content': 'center'
		      })
		      status.html('<span>已离开会议<span>')
		      status.appendTo($('#player_' + id))
		      status.hide()
					console.log(4198649, $('#audio').clone())
		      $('#player_' + id).css({'position': 'relative'})
				  let bottom = $('<div/>', {id: 'user_' + id})
				  bottom.html(`<span style="white-space: nowrap;text-overflow: ellipsis;overflow: hidden;">${remoteStream.getUserId()}</span>`)
				  bottom.css({
				  	'width': '100%',
				  	'height': '20%',
				  	'line-height': '35px',
				  	'color': '#fff',
				  	'background': '#3c3d40',
    				'display': 'flex',
    				'align-items': 'center',
    				'z-index': '99',
    				'margin-top': 'auto'
				  })
				  audio.appendTo(bottom)
				  unaudio.appendTo(bottom)
		      bottom.appendTo($('#' + id).parent())
        })
      })
    },
    async closeRoom () {
    	await this.client.unpublish(this.localStream)

	    // leave the room
	    await this.client.leave()
	    this.localStream.stop()
	    this.localStream.close()
	    this.localStream = null
	    // this.isJoined_ = false;
      $('#local_stream').parent()
        .children('.info')
        .remove()
    },
  	// 将自己切换到主视频
  	switchMain () {
      console.log(1)
		if ($('#local_stream').hasClass('mainVedio')) { return }
		$('.mainVedio').removeClass('mainVedio').parent().removeClass('active')
        $('#local_stream').addClass('mainVedio')
        $('#warp').addClass('active')
  	},
  	getVideo (id) {
  		if ($('#' + id).hasClass('mainVedio')) { return }
  		$('.mainVedio').removeClass('mainVedio').parent().removeClass('active')
        $('#' + id).addClass('mainVedio').css({'height':'93%'}).parent().addClass('active')
  	},
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.local_stream{
  width:300px;
  height:300px;
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
