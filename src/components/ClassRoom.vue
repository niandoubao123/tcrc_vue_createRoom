<script>
import Vue from 'vue'; 
import WhiteBoard from './TeacherWhiteBoard.vue';
import TeacherLocalVideo from './TeacherLocalVideo.vue'; 
import StudentVideo from './StudentVideo.vue';

import {createLocalStream} from './../TRTC.Service';  
import {RoomControl} from './../TRTC.Service';  
import {userInfo} from './../TRTC.Service';  

import {roomId} from './../TRTC.Service'; 
import {client} from './../TRTC.Service'; 
let Base64 = require('js-base64').Base64;
export default {
  name: 'TeacherClassRoom',
   components: {
    WhiteBoard, 
    TeacherLocalVideo,
    StudentVideo
  },
  props: {
    
  },
  created:function(){
    
    // 房间内容有新链路加入事件
    client.on('stream-added', event => {
      console.log('stream added ');
      this.students.push(event); 
      this.onStudentEnterRoom(event);
    });
    // 房间内容有新链路退出事件
    client.on('stream-removed', event => {
      console.log('stream removed ');
      this.onStudenExitRoom(event);
    }); 
    RoomControl.enterClassRoom(roomId,()=>{
      this.visitURI = window.location.href+"#"+ Base64.encode( roomId+"|"+userInfo.name);
      createLocalStream(roomId,(stream)=>{
          Vue.nextTick(()=>{  
            stream.play("local_stream");
            client.publish(stream).then(() => { 
              console.log('publish'); 
                callback(stream);
            }); 
          });
      }); 
    });
    
  },
  methods:{
    onStudenExitRoom:function(event){ 
        console.log('onStudenExitRoom ');
    },
    onStudentEnterRoom:function(event){ 
        console.log('onStudentEnterRoom ');
    }
  },
  data:function(){
    return {   
      visitURI:"", 
      students:[]
    };
  }
}
</script>