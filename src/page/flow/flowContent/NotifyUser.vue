<template>
    <div class="fullScreen">
        <HeaderBar title="选择知会人员" :customLeft="true">
            <span slot="customLeft" @click="goBack">
                <i class="left-arrow"></i>
                <span class="back">返回</span>
            </span>
        </HeaderBar>
        <BodyContent>
            <div slot="content">
                <div class="comment">
                    <group title="填写知会意见：">
                        <x-textarea v-model="comment" :max="200" :show-counter="false" :height="200"></x-textarea>
                    </group>
                </div>
                <div class="mt1" v-if="users.length > 0">
                    <ul>
                        <li class="fl" v-for="(item,index) in users" :key="index">{{item.userName}}</li>
                    </ul>
                </div>

                <div class="mt2">
                    <x-button @click.native="showSearchBar" style="border-radius:99px;">
                        <i class="fa fa-plus"></i>
                        选择知会人员
                    </x-button>
                </div>
                <div class="fixedBottom">
                    <flexbox>
                        <flexbox-item>
                            <x-button type="warn"
                             @click.native="submitNotify"
                             :disabled="users.length > 0?false:true">
                                确认知会
                            </x-button>
                        </flexbox-item>
                    </flexbox>
                </div>
                <div v-if="userSelectModal">
                    <SelectUser
                        @listenToToggleSearchBar="syncToggleState"
                        @listenSelectedUserList="getUserFromChild"
                    />
                </div>
            </div>
        </BodyContent>
    </div>
</template>
<script>
import HeaderBar from '@/components/header/Header'
import BodyContent from "@/components/content/BodyContent"
import SelectUser from './SelectUser.vue'
import apiConfig from '../../../server/apiConfig';
import axios from 'axios';
import globalData from '../../../server/globalData'
import { Group,XTextarea,XButton,Flexbox,FlexboxItem  } from 'vux'
export default {
    data(){
        return{
            actType:13,
            userSelectModal:false,
            users:[], // 知会人员
            FlowId:null,
            FlowInstanceId:null,
            givenUserIds:null,  // 知会人员ID
            grantUserId:null,
            comment:'',
        }
    },
    methods:{
        showSearchBar: function(){
            this.userSelectModal = !this.userSelectModal;
        },
        syncToggleState: function(newState){ // 同步用户选择状态
            this.userSelectModal = newState;
        },
        getUserFromChild: function(data){
            // console.log('以下是从组件获取的人员信息！');
            // console.log(data);
            if(this.users.length == 0){
                this.users.push(data);
            }else{
                var count = 0;
                this.users.forEach((i,key)=>{
                    if(i.userName != data.userName){
                        count++;
                        if(count == this.users.length){
                            this.users.push(data);
                        }
                    }
                })
            }
        },
        submitNotify(){
            var IdsArr = [];
            this.users.forEach((i)=>{
                IdsArr.push(i.userId);
            });
            this.givenUserIds = IdsArr.join(',');
            let param = new URLSearchParams();
            param.append("flowId", this.FlowId);
            param.append("givenUserIds", this.givenUserIds);
            param.append("grantUserId", this.grantUserId);
            param.append("remark", this.comment);
            axios.post(apiConfig.companyServer + apiConfig.CirculateToUser + this.FlowInstanceId,param)
                .then(res=>{
                    console.log(res);
                    this.$vux.toast.show({
                        text: '操作成功'
                    });
                    this.$router.push({name:'Flow'});
                }).catch(err=>{
                    console.log(err)
                });
        },
        goBack(){
            this.$router.push({name:'Flow'});
        }
    },
    beforeMount(){
        this.FlowId = globalData.flow.flowId;
        this.FlowInstanceId = globalData.flow.flowInstanceId;
        this.grantUserId = globalData.user.userId;
    },
    components:{
        HeaderBar,
        BodyContent,
        SelectUser,
        Group,
        XTextarea,
        XButton,
        Flexbox,
        FlexboxItem
    }
}
</script>
<style scoped>

    .mt1{
        margin-top: 1rem;
        padding: 0 1rem;
    }
    .mt2{
        margin-top: 2rem;
        padding: 0 3rem;
    }
    .fl{
        float: left;
        margin: 0 0.5rem 0.5rem 0;
        background-color: #D33E39;
        color: #fff;
        padding: 0.2rem 0.5rem;
        border-radius: 0.8rem;
    }
</style>
