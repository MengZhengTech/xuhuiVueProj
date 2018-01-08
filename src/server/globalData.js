/**
 * Created by Administrator on 2017/11/13.
 */
/****系统全局数据****/
export default {
    isWebView: false,  // 是否当着站点载入
    isLogin: false,
    screen:{
        w: window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
        h: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
    },
    user:{
        //houbo
        // guid:"582b063a5e492108dcb26339",
        // userId: 847, // 用户Id
        // name: 'houbo',  // 用户名
        // avatar: null,  //头像
        // admin
        // guid:"5406bebbb0909c60e47752df",
        // userId: 1, // 用户Id
        // name: 'admin',  // 用户名
        // avatar: null,  //头像
    },
    tabSelected:0,
    flow:{
        actList:null, // 流程操作列表，例如：通过，驳回，加签...
        flowId:null,
        flowInstanceId:null,
        stepId:null,
        actId:null,
    },
    fileType:{
        img:['.png','.jpg','.gif','.bmp','.jpeg'],
        other:['.pdf','.doc','.xls','.ppt','.docx','.xlsx','.pptx']
    },
  /**
   * URL 编码
   * @param name
   * @returns {string|null}
   */
    getUrlKey:function(name){
        return decodeURIComponent((new RegExp('[?|&]'+name+'='+'([^&;]+?)(&|#|;|$)').exec(location.href)||[,""])[1].replace(/\+/g,'%20'))||null;
    },
    /**
     * 设置存储的数据
     * @param key String
     * @param value String
     * @param limit Boolean 是否过期（true ： 浏览器关闭后自动销毁）
     * 此处数据存储 不做低版本兼容（默认都支持）
     */
    setStorage: function(key,value,limit){
        const valueStr = this.setValue2String(value);
        if(limit){ // sessionStorage
            sessionStorage.setItem(key, valueStr);
        }else{ // localStorage
            localStorage.setItem(key,valueStr);
        }
    },
    /**
     * 获取key对应的value
     * @param key
     * @returns {*}
     */
    getStorage: function(key){
        if(key){
            var val;
            if(localStorage.hasOwnProperty(key)){
                val = localStorage.getItem(key);
            }else if(sessionStorage.hasOwnProperty(key)){
                val = sessionStorage.getItem(key);
            } else {
                return { state: 'error', msg: '找不到数据！' }
            }
            return { state: 'success', data: val ,msg: '数据获取成功！'}
        }
    },
    /**
     * 删除已存储的数据
     * @param key
     */
    removeData:function(key){
        if(key){
            if(localStorage.hasOwnProperty(key)){
                localStorage.removeItem(key);
            }else if(sessionStorage.hasOwnProperty(key)){
                sessionStorage.removeItem(key);
            }else{
                return {state: 'error', msg: '找不到数据！'}
            }
            return {state: 'success', msg: '删除成功！'}
        }else{
            sessionStorage.length && sessionStorage.clear();
            localStorage.length && localStorage.clear();
            return {state: 'success', msg: '数据已全部清除！'}
        }
    },
    /**
     * 转换为字符串
     * @param value
     * @returns {*}
     */
    setValue2String:function(value){
        if(Object.prototype.toString.call(value) == "[object Array]"){ // 数组
            return JSON.stringify(value);
        } else if(typeof value == "object"){
            return JSON.stringify(value);
        }else if(typeof value == "string"){
            return value;
        }else{
            return JSON.stringify(value);
        }
    },
  /**
   * 数据请求前确保用户数据可用
   */
    beforeLoadCheckUser(){
        if(!this.user.guid){// 数据丢失
            const userInfo = this.getStorage('userInfo');
            if(userInfo.state=='success'&& this.isJSONStr(userInfo.data)){
                // 模拟一次用户登录
                let user = JSON.parse(userInfo.data);
                this.user.guid = user.guid;
                this.user.userId = user.userId;
                this.user.name = user.name;
                this.user.name = user.loginName;
                return true;
            }else{ // 错误页

            }
        }
        return true;
    },
    isJSONStr:function(str) {
        if (typeof str == 'string') {
            try {
                var obj=JSON.parse(str);
                return true;
            } catch(e) {
                return false;
            }
        }
    }
}
