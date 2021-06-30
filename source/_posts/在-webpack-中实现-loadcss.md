---
title: 在 Webpack 中实现 LoadCSS
categories:
  - 前端
date: 2021-06-30 20:13:58
---

「再快一点，再快一点」

<!--more-->

## 0. 优化 FP 的奇技淫巧

「众所周知」First Paint (白屏时间) 是评估前端体验的重要指标，减少首次渲染之前的空白会给用户带来更好的体验.

那么可能不「众所周知」的是，外部 (`<link href>`) CSS 默认是以最高优先级加载的，在其加载完成前会阻塞渲染.

所以如果为了优化 FP 做了个加载中效果，却不处理外部 CSS，结果会是 FP 没有任何减少.

(图懒得截了，略)

这就是 LoadCSS [1] 的奇妙之处了：

```html
<link rel="stylesheet" href="/path/to/my.css" media="print" onload="this.media='all'; this.onload=null;">
```

`media="print"` 的优先级会被调成 Low，且不再阻塞加载. 在其加载完成后，用 `onload` 事件把 `media` 改回来以免影响样式.

这带来了新的问题，如果外部 CSS 多的话免不了要用 LoadCSS 这个 JS 库，这又引入了新的加载延迟；而如果外部 CSS 少的话，`onload` 事件在禁用 JS 的浏览器上无法触发，样式无法应用.

解决禁用 JS 的问题，就是 Sukka 的版本[2]了：

```html
<link rel="stylesheet" href="/path/to/my.css" media="print" onload="this.media='all'; this.onload=null;">
<noscript><link rel="stylesheet" href="/path/to/my.css"></noscript>
```

(没想到吧.jpg)

## 1. Webpack 从哪入手

还有一个没解决的问题，外部 CSS 很多，如果用 Webpack 打包页面，怎样自动给每个标签都应用上 LoadCSS 呢？

哈哈，其实到这里应该能猜到，本文其实是在介绍如何写 Webpack 插件.

「众所周知」的是，从模板生成到输出文件优化这一系列操作，是 Webpack 通过各种插件和加载器来处理的.

插件在 Webpack 运行生命周期上绑定各种钩子进行操作，也可以发布自定义钩子供其他插件使用.

这里来为使用比较广泛的 `html-webpack-plugin` 插件写一个 LoadCSS 的插件.

## 2. 插件框架

在 `html-webpack-plugin` 文档中，介绍了一个插件 `link-media-html-webpack-plugin`，它的作用是根据 CSS 文件名自动添加 `media` 属性。

看起来和本文的需求差不多？直接来看看它的代码 (只保留了主要逻辑)[3]：

```js
class LinkMediaHTMLWebpackPlugin {
  constructor(options) {
      // some initialize code
  }

  apply(compiler) {
    compiler.hooks.compilation.tap('LinkMediaHTMLWebpackPlugin', (compilation) => {
      compilation.hooks.htmlWebpackPluginAlterAssetTags.tap('LinkMediaHTMLWebpackPlugin', (htmlPluginData) => {
        // return changed htmlPluginData
      });
    });
  }
}

module.exports = LinkMediaHTMLWebpackPlugin;
```

来快速查一下 [4]，再捋一捋逻辑：Webpack 启动以后会有个唯一的 `compiler` 对象，然后对每个要编译的模块走一遍 `compilation`；每次启动先调用所有注册的 `plugin` 对象 `apply` 方法来初始化. 插件用 `tap` 来绑定同步钩子，`compiler` 的 `compilation` 钩子，`compilation` 的 `htmlWebpackPluginAlterAssetTags` 钩子.

## 3. 开始写

然后在 `html-webpack-plugin` 文档中 [5] 找到 `alterAssetTagGroups` 的定义：

```ts
AsyncSeriesWaterfallHook<{
  headTags: Array<HtmlTagObject | HtmlTagObject>,
  bodyTags: Array<HtmlTagObject | HtmlTagObject>,
  publicPath: string,
  outputName: string,
  plugin: HtmlWebpackPlugin
}>
```

翻翻代码，在 [6] 找到 `HtmlTagObject` 的定义，顺便还在 [7] 找到了包装好的生成器方法.

`html-webpack-plugin` 文档中的示例代码：

```js
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackPlugin = require('safe-require')('html-webpack-plugin');

class MyPlugin {
  apply (compiler) {
    compiler.hooks.compilation.tap('MyPlugin', (compilation) => {
      HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
        'MyPlugin',
        (data, cb) => {
          data.html += 'The Magic Footer'
          cb(null, data)
        }
      )
    })
  }
}

module.exports = MyPlugin
```

发现两个问题：一是之前获取 `html-webpack-plugin` 钩子的方法在新版中修改了；二是用的是 `tapAsync` 绑定的异步钩子.

修改过后的最终版本：

<script src="https://gist.github.com/xiaopc/b92ac3384e51bfad984945d80c364bb6.js"></script>

（只是跑通了，没有做优化，先就这样？）

* * *

本文参考了：

[1] https://github.com/filamentgroup/loadCSS

[2] https://blog.skk.moe/post/improve-fcp-for-my-blog/

[3] https://github.com/probablyup/link-media-html-webpack-plugin/blob/master/index.js

[4] https://segmentfault.com/a/1190000012840742

[5] https://github.com/jantimon/html-webpack-plugin#alterassettags-hook

[6] https://github.com/jantimon/html-webpack-plugin/blob/main/typings.d.ts#L260

[7] https://github.com/jantimon/html-webpack-plugin/blob/main/lib/html-tags.js

[8] https://juejin.cn/post/6844903713312604173
