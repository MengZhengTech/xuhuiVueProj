/**
* Created by Administrator on 2017/11/13.
*/
<template>
    <div class="fullScreen bgw">
        <HeaderBar title="登录" :showBackBtn="false"></HeaderBar>
        <BodyContent :showBottomPadding="false" class="bgw">
            <div slot='content'>
                <!-- logo -->
                <div class="logo">
                    <img src="../assets/images/projLogo/xh.jpg" width="50%"/>
                </div>
                <!-- userName & Password -->
                <div>
                    <x-input v-model.trim="userName" placeholder="请输入用户名"></x-input>
                    <x-input v-model.trim="passWord" placeholder="请输入密码" type="password"></x-input>
                </div>
                <!-- submit -->
                <div class="p-submitBtn">
                    <x-button type="warn" :show-loading="isLoading"
                              :disabled="canLogin" action-type="button"
                              @click.native.stop.prevent="beLogin"
                    >
                        登录
                    </x-button>
                </div>
            </div>
        </BodyContent>
    </div>
</template>

<script>
    import BodyContent from '@/components/content/BodyContent';
    import HeaderBar from '@/components/header/Header';
    import { XButton, ViewBox, XInput } from 'vux';
    import apiConfig from '../server/apiConfig';
    import globalData from '../server/globalData';
    import axios from 'axios';
    export default{
        components: {
            XButton, HeaderBar, BodyContent, ViewBox, XInput,
        },
        //状态值
        data(){
            return {
                userName: null,
                passWord: null,
                isLoading: false,
            }
        },
        computed:{
            canLogin: function(){
                let flag = true;
                if(this.userName!==null && this.passWord!==null && this.userName!=="" && this.passWord!=="") flag = false;
                return flag;
            }
        },
        methods:{
            beLogin:function(){
                this.isLoading = true;
                let param = new URLSearchParams();
                param.append("userName", this.userName);
                param.append("passWord", this.passWord);
                axios.post(apiConfig.companyServer + apiConfig.login, param).then( res =>{
                    let data = res.data;
                    if(data.state === 1){
                        globalData.isLogin = true;
                        globalData.user={
                            userId: data.userId, // 用户Id
                            name: data.name,  // 用户名
                            loginName: data.loginName,
                            guid: data.guid,
                        };
                        globalData.setStorage('userInfo',data);
                        this.$router.push({name:'Home'});
                    }else{
                        this.$vux.toast.text(data.Message, 'bottom');
                    }
                    this.isLoading=false;
                }).catch(error=>{
                    console.log(error);
                    this.isLoading=false;
                });
            }
        }
    }
</script>
<style>
    .logo{
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px;
      background-color: #FFFFFF;
    }
    .p-submitBtn{
      padding: 20px;
    }
    .bgw #vux_view_box_body{
        background-color: #FFFFFF!important;
    }
</style>
