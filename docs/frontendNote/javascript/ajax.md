# ajax

它的中文解释叫：异步的JavaScript和XML。用来在网站中发起异步请求使用的方法，在请求一个页面之后，可以通过ajax从后台获取数据，然后将数据渲染到网页中去。

## 1. 原生ajax

### 1.1 初始化ajax请求

原生ajax是所有异步请求的基础，一切的ajax库都是基于它开发的。要想创建一个异步请求，首先要创建一个`XMLHttprequest`对象，调用它的open()方法来初始化一个请求，open方法接收两个参数，第一个参数为http请求的方法（`GET`、`POST`......），第二个参数为请求的目的地址url。初始化请求之后，需要调用send()方法来发送请求，只有调用这个方法才能将请求发送出去。send()方法将接受一个参数，这个参数是请求发送时带的请求体，如果请求是GET方法或者HEAD方法，则这个请求体为null。

```javascript
// GET请求
let xhr = new XMLHttpRequest();
xhr.open('GET', url);
xhr.send();

// POST请求
let data = {
    username: "Tom", 
    passwords: "Tom123"
};
let xhr = new XMLHttpRequest();
xhr.open('POST', url);
xhr.send(data);
```

### 1.2 监听请求返回

发送请求的过程就是这样的，但是发送了请求，总得有方法来监听返回吧？所以我们还需要用到监听一个`readystatechange`事件，这个事件在xhr对象的请求状态码改变时触发。一个请求分为五个状态：`UNSENT`、`OPENED`、`HEADER_RECEIVED`、`LOADING`、`DONE`。五个状态对应的值和描述如下表所示。当`readyState==4`时说明请求已经完成，此时可以去检查`xhr.status`，它记录了请求的响应状态，即返回的HTTP状态码，根据状态码做不同的处理。

| 值   | 状态             | 描述                                         |
| ---- | ---------------- | -------------------------------------------- |
| 0    | UNSENT           | 代理被创建，但尚未调用open()方法             |
| 1    | OPENED           | open()方法已经被调用                         |
| 2    | HEADERS_RECEIVED | send()方法已被调用，且头部和状态已经可以获得 |
| 3    | LOADING          | 下载中；responseText属性已经包含部分数据     |
| 4    | DONE             | 下载操作已经完成                             |

```javascript
// 监听请求状态码的改变
xhr.addEventListener('readystatechange', () => {
    if (xhr.readyState == 4) {
        if (xhr.status === 200) {
            // 成功返回200状态码时的处理
        } else {
            // 返回除了200之外的状态码时的处理
        }
    }
})
```

### 1.3 处理返回结果

返回结果可以在`xhr.responseText`中获取。一般返回的结果是json格式的数据，可以使用`JSON.parse(xhr.responseText)`来对返回数据进行解析和存储。

```javascript
if (xhr.status === 200) {
    // 成功返回200状态码时的处理
    console.log("successed");
    console.log(JSON.parse(xhr.responseText));
} else {
    // 返回除了200之外的状态码时的处理
    console.log("failed")
    console.log(JSON.parse(xhr.responseText));
}
```

## 2. 封装成Promise

一个网页通常不止发一次异步请求，会请求很多部分的数据，也经常会有某个请求需要等待另一个请求返回之后再执行，这样就会产生回调地狱。可以使用Promise进行封装来解决回调地狱的问题。

```javascript
function $ajax(method, url, data) {
    return new Promise((resolved, rejected) => {
		let xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.addEventListener('readystatechange', () => {
            if (xhr.readyState == 4) {
                if (xhr.status === 200) {
                    resolve(xhr.responseText)
                } else {
                    reject(xhr.responseText)
                }
            }
        })
        xhr.send(data);
    })
}
```

使用：

```javascript
$ajax("GET", "http://www.test.com/")
	.then((res)=>{
    	console.log(res);
    	let data  = {
            userName: "Tom",
            passWord: "Tom123"
        }
    	return $ajax("POST", "http://www.test.com", data)
	})
	.then((res)=>{
    	console.log(res);
	})
```