---
sidebarDepth: 2
---

# ES5、ES6新特性

## const、let、var的区别

### 1. window对象

var是JS中最为原始的用于声明变量的关键字，如果在全局作用域下使用var声明的变量会被自动挂载在window对象下，但是let和const不会

```javascript
var a = 100;
let b = 200;
const c = 300;
console.log(window.a) // 100;
console.log(window.b) // undefined
console.log(window.c) // undefined
```

### 2. 变量提升

var存在变量提升，在预编译过程中会将变量声明提升至文档的最前面，并将其初始化为undefined。注意它只是提升声明，并不提升赋值。

```javascript
console.log(b); // undefined
var b = 100;
console.log(b); // 100

// 上述代码相当于
var b; // 此时b = undefined
console.log(b); // undefined
b = 100;
console.log(b); // 100
```

let和const声明的变量不会提升，其实这么说不是很准确，而是说它会提升，但是存在一个暂存性死区，导致其在前面不能被读取。

```javascript
console.log(a);
let a = 100; 
// Uncaught ReferenceError: Cannot access 'a' before initialization
```

### 3. 作用域

var声明的变量不存在块级作用域，在同一作用域（全局作用域、函数作用域）下声明的变量，都可以被访问到。而const和let都会生成一个块级作用域，块级作用域包括仅仅是一个花括号包裹的位置，也可以是循环中，或者是在if条件语句中。

```javascript
var a = 0;
if (a) {
    var b = 6;
    console.log(b); 
}
console.log(b); // undefined

{
    var c = 10;
    let d = 20;
    console.log(c); // 10
    console.log(d); // 20
}
console.log(c); // 10
console.log(d); // Uncaught ReferenceError: d is not defined
```

### 4. 重复声明和修改

var可以重复声明同一个变量，但是let和const不可以，会报错。var，let在声明之后可以修改值，但是const在声明之后就不能修改了，所以const在声明的同时要赋值，如果不赋值则会报错。

```javascript
var a = 6;
console.log(a); // 6
var a = 10;
console.log(a); // 10

// 另一个文件中
let b = 6;
console.log(b);
let b = 10;
console.log(b); 
// 直接报错，在解析过程中就出错了。
// Uncaught SyntaxError: Identifier 'b' has already been declared
```

## Symbol类型

> 参考链接：
>
> [MDN文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol)
>
> [简书 by 贵在随心](https://www.jianshu.com/p/425148370333)

### 概述

Symbol类型用来生成独一无二的一个值，它接收一个字符串作为参数，相同的字符串也会生成不一样的值。它相当于一个函数来使用，但是不能使用new操作符。它是ES6中的一种新的原始类型。

```javascript
let s1 = Symbol('sss');
let s2 = Symbol('sss');
console.log(s1 === s2); // false
```

在ES5之前，对象的键名只能是字符串类型，但是在ES5之后，对象的键名可以是Symbol类型的变量，这使得对象能够不重复地创建键名。

### 特性

1. 不能使用new操作符

```javascript
var s1 = new Symbol(); // Uncaught TypeError: Symbol is not a constructor
```

2. 它是一种原始类型

```javascript
   typeof Symbol('a'); // 'symbol'
```

3. 每个Symbol()返回的值是唯一的

```javascript
Symbol('aaa') === Symbol('aaa'); // false
```

4. 全局共享的Symbol

   使用Symbol.for()可以根据给定的键名，在symbol注册表中找到对应的symbol，如果能找到则返回它，如果不行则新建一个symbol，并放入全局symbol注册表中去。

```javascript
var s1 = Symbol.for('a');
var s2 = Symbol.far('a');
console.log(s1 == s2); // true
```

### 属性和方法

有很多的symbol属性和方法在ES5之前是没有暴露给开发者的，它们描述的是语言内部的一些行为，被其他的一些内置方法使用。先说一下Symbol本身的属性和方法。

#### Symbol.length

这个长度属性的值为0。

#### Symbol.prototype

symbol构造函数的原型。

#### Symbol.for()

这个上面说过了，使用指定的key搜索现有的symbol。

#### Symbol.keyFor()

从全局symbol注册表中，为给定的symbol检索一个共享的symbol key。

------

下面是一些内置在其他对象中的symbols

#### 迭代symbols

*Symbol.iterator*

一个返回一个对象默认迭代器的方方法，被for...of使用。

```javascript
var myIterator = {};
myIterator[Symbol.iterator] = function* () {
    yield 1;
    yield 2;
    yield 3;
};
[...myIterator] // [1, 2, 3]
```

*Symbol.asyncIterator*

一个返回对象默认的异步迭代器的方法，被for await of使用。

```javascript
const myAsyncIterable = new Object();
myAsyncIterable[Symbol.asyncIterator] = async function*() {
    yield "hello";
    yield "async";
    yield "iteration!";
};

(async () => {
    for await (const x of myAsyncIterable) {
        console.log(x);
        // expected output:
        //    "hello"
        //    "async"
        //    "iteration!"
    }
})();
```

#### 正则表达式symbols

*Symbol.match*

常用来标识对象是否具有正则表达式的行为，在`String.prototype.startsWith()`、`String.prototype.endsWith()`和`String.prototype.includes()`这些方法会检查第一个参数是否是正则表达式，是的话会抛出错误，但是可以将它设置为false，这样就不会将该对象当做一个正则表达式对象了。

```javascript
var re = /foo/;
re[Symbol.match] = false;
"/foo/".startsWith(re); // true
"/baz/".endsWith(re);   // false
```

*Symbol.replace*

一个替换匹配字符串的子串的方法，被String.prototype.replace()使用

*Symbol.search*

一个返回一个字符串中与正则表达式相匹配的索引的方法，被String.prototype.search()使用

*Symbol.split*

一个在匹配正则表达式的索引处拆分一个字符串的方法，被String.prototype.split()使用

还有一些其他的关于Symbol的用法，可以去[MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Symbol)上看看

## async/await

> 参考链接：
>
> [MDN文档](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/async_function)
>
> [阮一峰教程](http://www.ruanyifeng.com/blog/2015/05/async.html)

在JavaScript中解决异步操作一直是一件挺麻烦的事情，在async之前有Promise和Generator来解决异步回调问题，那么什么是async/await呢？其实async就是Generator的语法糖。

### 定义

根据MDN上的定义：async函数是使用`async`关键字声明的函数。 async函数是`AsyncFunction`构造函数的实例， 并且其中允许使用`await`关键字。

说白了就是async表示了接下来这个函数中可以使用异步操作，而在函数中可以使用await关键字来表示等待一个异步操作的结果返回，当异步操作返回之后才接着向下执行，await实际上相当于迭代器中的yield。

### 优点

下面引自阮一峰教程：

async 函数对 Generator 函数的改进，体现在以下三点。

*内置执行器。* Generator 函数的执行必须靠执行器，所以才有了 co 函数库，而 async 函数自带执行器。也就是说，async 函数的执行，与普通函数一模一样，只要一行。

```javascript
var result = asyncReadFile();
```

*更好的语义。* async 和 await，比起星号和 yield，语义更清楚了。async 表示函数里有异步操作，await 表示紧跟在后面的表达式需要等待结果。

*更广的适用性。* co 函数库约定，yield 命令后面只能是 Thunk 函数或 Promise 对象，而 async 函数的 await 命令后面，可以跟 Promise 对象和原始类型的值（数值、字符串和布尔值，但这时等同于同步操作）。

### 用法

```javascript
async function foo() {
    // result1、result2可以看做一个异步操作返回的结果（如读取文件或者ajax）
    const result1 = await new Promise((resolve) => setTimeout(() => resolve('1')));
    console.log(result1);
    const result2 = await new Promise((resolve) => setTimeout(() => resolve('2')));
    console.log(result2);
}
var re = foo()
```

async函数的返回值是一个Promise对象

```javascript
// 继续使用上述代码
console.log(re);// Promise {<fulfilled>: undefined}
```

详解下上面的那段代码，async函数在执行过程中会以await为分界，将函数划分成若干份，在执行foo的时候，会先执行至第一个resolve函数，然后暂停执行这函数，等待到await后面的函数执行完（Promise状态为fullfilled）再继续执行下面的代码。这里实际上是将第一个await后面的函数看做一个then()，将其放到了微任务中去。

### 注意事项

await 命令后面的 Promise 对象，运行结果可能是 rejected，所以最好把 await 命令放在 try...catch 代码块中。

### 关于async在事件循环中的问题

可以参见后面这篇笔记：[事件循环](./JSExecution.md#事件循环)