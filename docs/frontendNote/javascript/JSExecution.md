---
sidebarDepth: 2
---

# JS执行机制

## 预编译

> 参考博客：
>
> [JavaSrcipt - 预编译 @MonkeyChennn](https://www.jianshu.com/p/a91cddc5c705)

JS的运行过程分为**预编译**和**执行**两个阶段，

## 事件循环

> 参考博客：
>
> [阮一峰教程](http://www.ruanyifeng.com/blog/2013/10/event_loop.html)
>
> [详解JavaScript中的Event Loop（事件循环）机制 @暮雨清秋](https://zhuanlan.zhihu.com/p/33058983)

搞清楚JavaScript中Event-loop机制是分析js程序执行过程的重要一环，在浏览器端的eventloop和node上的eventloop还是有一些区别的。我们先以浏览器端的eventloop为例着手了解eventloop机制。

在谈浏览器的eventloop之前，先看看一些概念性的问题。

### 同步任务和异步任务

首先需要明确的是，JavaScript是一种单线程语言，意味着js不可能在同时处理两个不同的任务，当在执行一个异步任务（如异步请求，定时器等）的时候，会现将它们挂起，等到它们返回结果的时候才会继续执行回调函数。

### 执行栈与事件队列

对于**同步任务**，执行栈的栈底存储的是全局的执行上下文，每执行到一个方法时，会将当前的方法的上下文放入执行栈，并进入这个上下文执行方法，在方法执行完之后会将这个上下文弹出执行栈，然后进入上一个方法的上下文中继续执行上一个方法。

对于**异步任务**，当异步事件返回结果之后，js会将它的回调方法放在任务队列中，当执行栈为空时，才会任务队列中取出第一个任务放入执行栈中，再按照上述的方法执行。

于是就形成了一个循环，同步任务\-\-\-\>清空执行栈\-\-\-\>取出事件队列中的第一个\-\-\->执行同步任务，这个循环就叫做**事件循环。**

可以用这章图来描述：

![img](../../.vuepress/public/img/eventLoop.png)

### 宏任务和微任务

宏任务和微任务是用来描述不同的异步代码的执行顺序的，宏任务是macro task，微任务是micro task。

执行异步任务的时候，会先判断微任务队列是否为空，不为空则执行所有的微任务，为空则去调用一个宏任务队列，调用完之后再判断

浏览器环境下和node环境下的宏任务和微任务的区别如下表：

|            任务             | 浏览器 | node |
| :-------------------------: | :----: | :--: |
|         **宏任务**          |        |      |
|         setTimeout          |   √    |  √   |
|         setInterval         |   √    |  √   |
|        setImmediate         |   ×    |  √   |
|    requestAnimationFrame    |   √    |  ×   |
|         **微任务**          |        |      |
| Promise的then/catch/finally |   √    |  √   |
|      process.nextTick       |   ×    |  √   |
|      MutationObserver       |   √    |  ×   |

例题：

> 摘自：[博客园 by 牧羊狼](https://www.cnblogs.com/edwardwzw/p/12033935.html)

求输出的结果

```javascript
async function async1() {
    console.log("async1 start");
    await async2();
    console.log("async1 end");
    return 'async return';
}
 
async function async2() {
    console.log("async2");
}
 
console.log("script start");
 
setTimeout(function() {
    console.log("setTimeout");
}, 0);
 
async1().then(function (message) { console.log(message) });
 
new Promise(function(resolve) {
    console.log("promise1");
    resolve();
}).then(function() {
    console.log("promise2");
});
 
console.log("script end");
```

最终输出：

```javascript
/* 
script start
async1 start
async2
promise1
script end
async1 end
promise2
async return
setTimout
*/
```

解析：

1. 首先毫无疑问是`script start`，此时将setTimeout放入宏任务队列中去。
2. 然后继续执行同步代码`async1()`，因此会打印一个`async1 start`。
3. 由于有await关键字，因此会先执行`async2()`。打印一个`async2`。并将`async1`后半段的代码放到微任务队列中去，相当于Promise.then，因为await的返回值是一个Promise对象。**注意这里不是将`async1`的then放入**。
4. `await1.then`也被放入微任务队列中去。继续执行同步代码，Promise对象在new的时候传入的函数是同步（立即）执行的，因此打印`promise1`。
5. 新的Promise对象的then被放入微任务队列中，继续执行同步代码，打印`script end`。
6. 此时同步任务全部执行完毕，会去检查微任务队列，此时微任务队列的第一个是`async1`的后半段，所以打印`sasync1 end` 。这时候`async1`终于执行完有`return`了，此时将`async1`的`then`放入微任务队列中
7. 微任务队列仍然不为空，下一个微任务是新的Promise实例的`then`，因此打印`promise2`。
8. 这时候微任务队列只剩下`async1`的`then`了，执行，打印`async return`。
9. 微任务队列清空，去找宏任务，宏任务中有一个`setTimeout()`，执行其回调，打印`setTimeout`。

