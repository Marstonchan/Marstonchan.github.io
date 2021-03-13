# JS 数据类型

js是一种动态类型、弱类型语言，我们永远不需要显式地声明变量的类型，js在运行过程中会对变量的类型进行推断，且一个变量的类型在执行过程中可以被隐式地修改。

## 1. JS数据类型概述

> 关于数据类型和数据结构的底层原理的解读可以[参考一下这篇博客](https://www.cnblogs.com/zhoulujun/p/10881639.html)

先来看看都有哪些数据类型。js的数据类型分为两个大类，一种叫原始类型，一种叫引用类型。

### 1.1 原始类型

原始类型变量的特点是，它们存储在栈内存中，每种数据类型占用的内存空间大小是确定的。

原始类型分为：

* null 空类型
* undefined类型
* number 数字类型
* string 字符串类型
* boolean 布尔类型
* symbol类型

### 1.2 引用类型

引用类型变量特点是，它们的指针存储在栈内存中，但是它们包含的数据存储在堆内存中，我们想要从引用类型变量中取值，需要先从栈中取出指针，再通过指针去堆内存中访问数据。

引用类型只有Object类型一种，但是它可以派生出无数的类，所有类的祖先都是Object。

## 2. 变量类型的检查

### 2.1 typeof运算符

我们可以用typeof运算符进行原始类型的检查，所有的引用类型都会返回`object`。typeof运算符的输出只有6种`undefined`、`number`、`string`、`boolean`、`symbol`、`object`。一般对象和null的检测都将是object，这是js的bug。

```javascript
let a1 =  undefined;	// typeof a1 == undefined
let a2 = "1";			// typeof a2 == string
let a3 = 1;				// typeof a3 == number
let a4 = false;			// typeof a4 == boolean
let a5 = Symbol("1");	// typeof a5 == symbol
let a6 = {};			// typeof a6 == object
let a7 = null;			// typeof a7 == object
let a8 = [];			// typeof a8 == object
```

### 2.2 instanceof运算符

可以用instanceof运算符来检测一个对象的原型链上是否具有某个对象。`A instanceof B`。

