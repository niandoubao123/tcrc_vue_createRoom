<template>
      <div> 
      <el-row>
        <el-col :span="12" :offset="6">
          <el-card click="alert('aa');userInfo.role=0" :body-style="{ padding: '0px' }" :shadow="userInfo.role==0?'always':'never'">
            <img style="height:200px" src="teacher.jpeg" class="image">
            <div style="padding: 14px;">
              <span>我是老师，准备开课。</span>
              <div class="bottom clearfix"> 
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
        <el-form style="margin:36px" label-width="80px" :model="userInfo">
          <el-form-item label="我的名字">
            <el-input v-model="userInfo.name"></el-input>
          </el-form-item> 
          <el-form-item label="手机号">
            <el-input v-model="userInfo.phone"></el-input>
          </el-form-item> 
            <el-form-item>
              <el-button type="primary" @click="enterRoom()"> 进入课堂 </el-button> 
            </el-form-item>
        </el-form>
      </div> 
</template>
<script>
import {RoomControl} from './../TRTC.Service';  
import {userInfo} from './../TRTC.Service'; 
export default {
  name: 'LoginBox',
  props: {
    msg: String
  },  
  data:function(){
    return {  
      userInfo:{role:0,name:"My Name",phone:"0001"}
    };
  },
  created:function(){
        userInfo.name = this.userInfo.name;
  },
  methods:
    { 
      enterRoom:function(){
        userInfo.name = this.userInfo.name;
        userInfo.phone = this.userInfo.phone;
        RoomControl.createClassRoom(this.userInfo.phone,()=>{ 
          this.$emit("enterroom");
        });     
      }
    }
}
</script> 
<style scoped>
 
</style>