import TRTC from 'trtc-js-sdk'; 
import { genTestUserSig } from "./GenerateTestUserSig";
   
export let roomId = null;
export let userSig = null;
export const streamInfo = {};
export const userInfo = {name:"MyName"};
export let sdkAppId = null; 
export let client = null; 
 
export const createLocalStream = function(userId,callback){
    console.log("create local stream "+userId);
    streamInfo.localStream = TRTC.createStream({ userId:userId, audio: true, video: true }); 
    streamInfo.localStream.setVideoProfile('480p'); 
    streamInfo.localStream.initialize().then(() => {  
       callback(streamInfo.localStream);
    });
    return streamInfo.localStream;
};

export const createNewLiveClient = function(userId){
    return TRTC.createClient({ sdkAppId, userId, userSig, mode: 'live'});
};

// 房间控制器
export const RoomControl = {
    //创建课堂房间
    createClassRoom : function( roomId_,callback){
        console.log("createClassRoom "+roomId_);
        roomId = roomId_;
        const UserSig = genTestUserSig(roomId);
        sdkAppId = UserSig.sdkAppID;
        userSig = UserSig.userSig;
        client = TRTC.createClient({
            'mode': 'rtc',
            'sdkAppId':sdkAppId,
            'userId':roomId,
            'userSig':userSig
        });
        callback(client);
        return client;
    },
    // 进入课堂
    enterClassRoom:function(roomId,callback){
        client.join({ 'roomId':roomId })
        .catch(error => {
          console.error('进房失败 ' + error);
        })
        .then(() => {
          console.log('进房成功 '+roomId+" "+userSig); 
          callback(client);
        });
    },
    exitClassRoom : function(callback){
        if(window.confirm("确定退出课堂吗？")){ 
           callback();
        }
    }
}