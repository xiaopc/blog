---
title: Leave Callback Hell——Promise 和 async 简述
date: 2017-08-30 10:28:33
categories:
  - 前端
---

> 按：本来早就要写的，结果拖到今天orz

<!--more-->

## "回调地狱"
{% codeblock lang:javascript %}
a(function (resultA) {
​	b(resultA, function (resultB) {
​		c(resultB, function (resultC) {
​			// ......
​		})
​	})
});
{% endcodeblock %}

## Promise

ECMAScript 6 中引入了 Promise 技术来解决这个问题，来看一个简单的例子：
{% codeblock lang:javascript %}
var promise = new Promise(function(resolve,reject){
	setTimeout(function(){
	  resolve(520);
	}, 2000);
});
promise.then(function(value){
    console.log(value);
});
{% endcodeblock %}

在 2s 后，控制台应当打印 520.

是不是很好用？浏览器支持列表如下：

![Can I use Promise](https://i.loli.net/2017/08/30/59a61523d4527.png)

可以看到现代浏览器对 Promise 支持度很高，对不支持的浏览器也有相应的 polyfill。



简述 Promise 的方法：

`promise.then(onFulfilled, onRejected)` 在 Promise 成功/失败后执行 `onFulfilled/onRejected`。

`promise.catch(onRejected)` 在 Promise 失败后执行 `onRejected`。

静态方法：

`Promise.resolve(...)` 是 new Promise() 的语法糖，Promise.resolve(42) 等价于
{% codeblock lang:javascript %}
new Promise(function(resolve){
​    resolve(42);
});
{% endcodeblock %}
`Promise.resolve(thenable)` 也可以将一个具有 .then 方法的对象转换为一个 Promise 对象(*有坑，见[2])

`Promise.reject(error)` 也是 `new Promise()` 的语法糖，与 resolve 类似。



Promise 对象的状态： `[[PromiseStatus]]` has-resolution（成功） has-rejection（失败） unresolved（等待）

Promise 只能使用异步调用方式。同时使用异步调用和同步调用时会引起错乱。

Promise 链式调用时，若某一环节 `onFulfilled/onRejected` 未指定，则应注意调用流程。(见[2])

Promise 数组部分略去，见[2]。

## async

先略去对 Generator 函数的介绍，直接看这个例子：
{% codeblock lang:javascript %}
function timeout(ms) {
  return new Promise(function (resolve){
    setTimeout(resolve, ms);
  });
}
async function asyncPrint(value, ms) {
  await timeout(ms);
  console.log(value);
}
asyncPrint('hello world', 2000);
{% endcodeblock %}
2s 后打印出 hello world。

async是 ECMAScript 7 中引入的 Generator 语法糖，语法简洁明了。在函数前加 async 关键字表明该函数内部有异步操作，遇到 await 就返回 Promise 对象，等到 await 语句返回的 Promise 对象 Fulfilled 或 Rejected 时继续执行。

浏览器支持：

![Can I use async](https://i.loli.net/2017/08/30/59a61523e807d.png)

现代浏览器正在逐步支持 ECMAScript 7 的新特性，目前在实验性项目上可以使用 async。


------

本文参考了：

[1] Promises And Chaining In AngularJS - Into Callback Hell And Back Again https://www.slideshare.net/HansGuntherSchmidt/promises-and-chaininginangularjs

[2] JavaScript Promise迷你书 http://liubin.org/promises-book/

[3] Can I use? http://caniuse.com

[4] async 函数的含义和用法 http://www.ruanyifeng.com/blog/2015/05/async.html
