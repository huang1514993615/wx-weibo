module.exports = (date)=>{
    // 声明一个字符串时间结构 在使用正则替换字符换
    let fmt = 'yyyy-MM-dd hh:mm:ss';
    let o = {
        'M+':date.getMonth()+1,  // 月
        'd+':date.getDate(),     // 日
        "h+":date.getHours(),    // 时
        'm+':date.getMinutes(),  // 分
        's+':date.getSeconds(),  // 秒
    }

    if(/(y+)/.test(fmt)){
        fmt = fmt.replace(RegExp.$1,date.getFullYear())
    }
    for(let x in o){
        if(new RegExp('('+x+')').test(fmt)){
            fmt = fmt.replace(RegExp.$1,o[x].toString().length==1 ? '0'+o[x]:o[x])
        }
    }

    return fmt
}
/**
 * 时间个格式化插件
 * 1：接受时间对象
 * 2：定义时间格式化的字符串
 * 3：分别定义每一个时间  年、月、日、时、分、秒，通过日期对象分别获取...
 * 4: 通过正则拼配  定义的每一个时间  
 * 5：用获取到的时间；使用正则匹配时间结构中的字符，替换结构中的字符
 */