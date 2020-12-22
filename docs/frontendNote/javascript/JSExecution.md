---
sidebarDepth: 2
---

# JS执行机制

## 预编译

> 参考博客：
>
> [JavaSrcipt - 预编译 @MonkeyChennn](https://www.jianshu.com/p/a91cddc5c705)
>
> [JavaScript预编译 @罗祥](https://zhuanlan.zhihu.com/p/50236805)

### 概述

JS的运行过程分为**预编译**和**执行**两个阶段，在预编译阶段，会将变量和函数的声明提前到脚本的最前面执行，这里仅限于使用`var`和`function`的声明，`let`和`const`声明的变量不会有提升。这是对预编译最简单的理解。

而且对于每一个函数，在执行的时候也会有预编译的过程。过程和全局的预编译类似。

```javascript
console.log(a); // undefined
console.log(b); // f b(){}
var a = 3; 
function b(){};
console.log(a); // 3
console.log(b); // f b(){}
```

### 详解

**预编译前奏**

在预编译之前，js会将一切全局变量和未经声明的变量，全部挂载到window下。当然，`let`和`const`声明的变量不会挂载到window下。

```javascript
var a = 123;
console.log(window.a); // 123;
function test() {
    var b = c = 234;
    console.log(b); // 234;
    console.log(c); // 234;
}
test();
console.log(window.c); // 234;
```

**预编译步骤**

1. 创建AO对象(Activation Object)，执行期上下文。全局情况下创建GO对象（Global Object）全局对象。
2. 找形参和变量声明，全局情况下找变量声明，将变量和形参名作为AO/GO的属性名，值都为undefined。
3. 将形参值和形参统一，全局情况下没有这一步。
4. 查找函数声明，作为AO/GO的属性，赋值为函数体。

**例1：**函数与变量同名

函数的声明会优先与变量的声明（可以这么理解），但是实际上是函数声明的查找在变量提升之后，因此当函数与变量重名的时候，无论函数在全局作用域的哪个位置，只要在变量赋值之前使用，foo都是函数。

```javascript
console.log(foo); // f foo(){}
var foo = 1;
console.log(foo); // 1
function foo(){};
```

**例2：**用表达式声明与变量同名的函数。

这种情况下，foo实质上还是一个变量，所以后面的赋值显然会取代前面的赋值。

```javascript
console.log(foo);
var foo = 333;
var foo = function(){}
console.log(foo);
```

**例3：**在函数中声明一个和全局变量同名的变量。

此时涉及到了AO的建立和销毁，首先来分析一下GO创建的过程

1. 创建GO对象，找到变量声明，在全局作用域中声明了一个`global`，赋值为undefined。
2. 查找函数声明，在全局作用域下有一个函数声明`test`，赋值为函数体。
3. 然后开始执行同步代码，将`global`赋值为100。
4. 执行`test()`；此时创建AO对象，

接下来分析AO的创建过程

1. 创建AO；查找形参和变量声明，在这个函数中没有形参，于是只有`global`，赋值为undefined。
2. 所以第一个`console.log(global)`打印出的是`undefined`
3. 统一形参和实参（没有形参，跳过）
4. 查找函数声明（函数中没有函数声明了）

继续分析代码的执行

1. `global`赋值为200，所以第二个打印出的是`200`;
2. 函数中最后将global赋值为300；
3. 但是在执行完函数之后，AO会被销毁，所以走出了`test()`函数之后，能够访问到的`global`是GO中的值。
4. 因此最后的打印是100。

```javascript
global = 100;
function test() {
    console.log(global);
    var global = 200;	
    console.log(global);
    var global = 300;
}
test();
var global;
console.log(global);
```

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

