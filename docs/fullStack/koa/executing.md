# 执行流程剖析

> 2021年3月8日
>
> 关于koa这一块的内容可以参考[这篇文章](https://zhuanlan.zhihu.com/p/70985017)，作者写得非常好！

看了一下午的源码，勉强弄明白了koa是如何创建一个http请求，如何添加一个中间件的了，稍微做个小记。

我们可以创建一个app.js，按照官方文档给出的示例，创建一个最简单的koa应用：

```javascript
const Koa = require('koa');
const app = new Koa();

app.use(async ctx => {
    ctx.body = "<h1>Hellow world!</h1>"
})

app.listen(3000)
```

`app.use()`是将一个中间件应用到koa对象中去，koa本身只是提供了核心的中间件功能，可以理解为一个核，其他所有功能都通过接入外设（中间件）来实现。在上述代码中，`async`函数就是一个最简单的中间件。

`app.listen()`则实质上是一个`http.createServer`的语法糖。下面将从源码的角度来分析这两个函数调用的执行流程。

## 造洋葱

因为koa在设计时，让多个中间件构建成一个类似于栈的结构（先进后出），就像一个洋葱一样。然后执行每个中间件的时候就像是在剥洋葱，我们先来看看洋葱是怎么造出来的。

我们可以在node_module中找到koa的目录，koa的核心文件存放在lib目录下。关于`app`的方法和属性都定义在`application.js`下。我们在其中找到`use`方法的定义。

```javascript
use(fn) {
  if (typeof fn !== 'function') throw new TypeError('middleware must be a function!');
  if (isGeneratorFunction(fn)) {
    deprecate('Support for generators will be removed in v3. ' +
              'See the documentation for examples of how to convert old middleware ' +
              'https://github.com/koajs/koa/blob/master/docs/migration.md');
    fn = convert(fn);
  }
  debug('use %s', fn._name || fn.name || '-');
  this.middleware.push(fn);
  return this;
}
```

前面的第一个if判断判断了传入的参数是否是一个函数，如果不是方法则报错；第二段代码是判断是否是生成器函数，因为从koa3开始弃用生成器函数作为中间件，为了方便低版本的koa向高版本的迁移，有了这个`convert`函数，它将一个生成器函数转化为异步函数。

最最重要的是最后的这段代码`this.middleware.push(fn)`，也就是说每调用一次`app.use()`就会将传入的函数压入到koa对象的中间件栈中，这个入栈的过程就是在造洋葱了，但是这之中的代码什么时候执行呢？

我们可以在文件中搜索一下`middleware`，可以看到在`callback`函数中有这么一句`const fn = compose(this.middleware)`，所以`middleware`是在`callback()`中用了的，但是这个`callback()`到现在为止还不知道它的来历，于是我们又在`listen()`方法中看见了`callback`的调用。至此我们知道了，是在`app.js`中调用的`app.listen`的时候才算是完成了一个完整的koa应用。现在我们知道了怎么koa是怎么构建中间件的（造好了洋葱），接下来我们看看koa是怎么应用这些中间件的（剥洋葱）。

## 剥洋葱

通过上面的步骤，我们得到了我们的洋葱`koa.middleware`，当我们调用listen方法的时候，就开始了剥洋葱的过程了。`koa.listen()`方法实际上是构建了node的一个http服务（`http.createServer()`），`http,createServer()`接受了一个函数作为参数，这个传入的函数实际上是一个事件监听，前端向服务器发起请求时触发的回调函数。

```javascript
listen(...args) {
  debug('listen');
  const server = http.createServer(this.callback());
  return server.listen(...args);
}

callback() {
  const fn = compose(this.middleware);

  if (!this.listenerCount('error')) this.on('error', this.onerror);

  const handleRequest = (req, res) => {
    const ctx = this.createContext(req, res);
    return this.handleRequest(ctx, fn);
  };

  return handleRequest;
}
```

我们再来看`this.callback()`，callback函数的执行返回的是一个`handleRequest()`函数，而这个函数即是符合回调函数的形式`(req, res)=>{ // do something here }`，所以每次触发回调函数的时候实际上触发的是`handleRequest`，如果使用原生来写的话应该是以下的形式：

```javascript
const server = http.createServer((req, res) => {
    const ctx = this.createContext(req, res);
    return this.handleRequest(ctx, fn);
});
```

我们继续深挖这段代码，ctx的定义实际上是包装一个包含req和res的上下文，req和res又是经过koa包装的，但是现在暂时先不展开他们，主要看一下`handleRequest()`

```javascript
handleRequest(ctx, fnMiddleware) {
  const res = ctx.res;
  res.statusCode = 404;
  const onerror = err => ctx.onerror(err);
  const handleResponse = () => respond(ctx);
  onFinished(res, onerror);
  return fnMiddleware(ctx).then(handleResponse).catch(onerror);
}
```

看到这我们知道，它返回了一个promise（handleResponse处理了promise成功时的逻辑，而onerror处理了promise失败时的逻辑）。onfinish可以不用看，它是在监听这个端口有没有报错，报错的时候会执行onerror。这个`fnMiddleware`来自于compose的返回，所以我们再切换一个文件，看看compose里都做了什么。实际上，compose这个函数才是真正**剥洋葱**的函数。

```javascript
function compose (middleware) {
  if (!Array.isArray(middleware)) throw new TypeError('Middleware stack must be an array!')
  for (const fn of middleware) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must be composed of functions!')
  }
  return function (context, next) {
    // last called middleware #
    let index = -1
    return dispatch(0)
    function dispatch (i) {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'))
      index = i
      let fn = middleware[i]
      if (i === middleware.length) fn = next
      if (!fn) return Promise.resolve()
      try {
        return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
```

compose函数接受一个中间件数组，即app.middleware这个存储了app.js执行过程中遇到的中间件，然后将这些中间件包装成一个大的中间件，然后让他们以一种类似于递归的方式执行，达到剥洋葱的目的，`return Promise.resolve(fn(context, dispatch.bind(null, i + 1)));`。

这些都太抽象了，我们来举个例子解释一下，现在我们对刚刚写的app.js文件进行小小的修改，使它有几个中间件。

```javascript
const Koa = require('koa');
const app = new Koa();

app.use(async (ctx, next) => {
    console.log('中间件1开始')
    next();
    console.log('中间件1结束')
})
app.use(async (ctx, next) => {
    console.log('中间件2开始')
    next();
    console.log('中间件2结束')
})
app.use(async (ctx) => {
    console.log('中间件3开始')
    console.log('中间件3结束')
})
app.listen(3000)
```

这个时候，你可以在控制台看见如下输出：

```shell
中间件1开始
中间件2开始
中间件3开始
中间件3结束
中间件2结束
中间件1结束
```

所以在执行每一个中间件的代码时，会先执行next()方法之前的代码，然后将程序执行权力交给下一个中间件，等到所有的中间件代码执行完之后，从最后一个中间件开始返回，逐层返回至第一个中间件。

