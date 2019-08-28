---
title: webpack 数据 Mock 方法整理
date: 2019-07-15 09:08:02
categories:
  - 前端
---

前后端分离开发中，少不了模拟真实后端接口的 mocker，这里就谈谈之前在 Mock 时踩过的坑吧。

<!--more-->

## Mock.js

首先要有数据源，Mock.js 提供了假数据生成的功能。

但是

在网上搜索到的 Mock.js 教程要么是旧版的（Mock.js 原来是通过拦截 axios 等库的请求来实现的），要么就是以下这种方法：

> 1. 建立一个引入了 `mockjs` 的 mocker 
> 2. 修改 `webpack.dev.conf.js`，添加 `before` 钩子直接引入这个 mocker：

```js
devServer: {
    // ...
    before: require('../mock'), //引入 mock/index.js
    // ...
},
```

而这些教程给的 mocker 大致是这样的：

```js
module.exports = function(app){
    app.get('/...', function (rep, res) {
        // ...
        res.json(Mock.mock(...));
    });
}
```

那 `rep` 是干什么用的呢？（而且应该是 *req*uest 吧）

如果把它 `console.log` 出来会发现这是请求对象，但是没有处理请求的内容（POST）。

连请求内容都没有，还有什么用啊？连登录验证都 mock 不出来，实在是没什么实用性。

## webpack-api-mocker

当然，这个就能解决问题了。

webpck.dev.config.js
```js
const apiMocker = require('webpack-api-mocker')

module.exports = {
  devServer: {
    // ...
    before(app) {
      apiMocker(app, path.resolve(__dirname, '../mock/index.js'), {})
    }
  }
}
```

mocker 还是那个 mocker，现在 「`rep`」就有 `body` `query` `params` 方法了：

```js
module.exports = {
    'GET /api/check': function (req, res) {
        if (req.query.username == "admin") {
            res.send({...});
        }
    },
    'POST /login': function (req, res) {
        if (req.body.username == "admin") {
            res.send({...});
        }
    },
}
```

`webpack-api-mocker` 还有一点好，它是支持热更新的。

## cookie-parser

webpack 的 devServer 其实是一个 express 服务，那么用法也就是 express。

在登录模拟时也要模拟 cookie，express 设置 cookie 就很简单：

```js
res.cookie(name, value [, options]);
```

那在读取 cookie 时就需要 `cookie-parser`：
```js
var cookieParser = require('cookie-parser');
// ...
before(app) {
    app.use(cookiePareser())
    apiMocker(app, path.resolve(__dirname, '../mock/index.js'), {})
},
```

## 再闲叨叨

React 生态真的是完善的多，比如 roadhog 等等都自带 mock。

再看 Vue.js，没一个框架做了 mock（如果有的话请留言）。

但是不论是之前的 License 风波，还是 JSX 这种怪异玩意，

很难喜欢上 React 啊。

* * *

本文参考了：

[1] 关于几种数据Mock的手段 - worldzhao [https://worldzhao.github.io/2018/10/20/webpack-dev-server/](https://worldzhao.github.io/2018/10/20/webpack-dev-server/)

[2] Express cookie-parser middleware [https://expressjs.com/en/resources/middleware/cookie-parser.html](https://expressjs.com/en/resources/middleware/cookie-parser.html)
