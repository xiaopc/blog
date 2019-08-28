---
title: backdrop-filter 来了
date: 2019-08-13 19:45:46
categories:
  - 前端
---

近日，本平行宇宙中版本号最高的浏览器正式迎来了版本号 76，这一版本带来了地址栏简化、默认禁用 Flash 等特性。
但是，有一项更新甚至在官方 [更新说明](https://developers.google.com/web/updates/2019/07/nic76) 中都没有提到。
那就是`backdrop-filter`已经脱离实验选项，成为正式支持的 CSS 属性。

<!--more-->

## What

那么什么是`backdrop-filter`，`backdrop-filter`有什么用呢？~~接下来小编...~~

<iframe height="468" style="width: 100%;" scrolling="no" title="eYOJWXq" src="//codepen.io/xiaopc/embed/eYOJWXq/?height=468&theme-id=0&default-tab=css,result" frameborder="no" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/xiaopc/pen/eYOJWXq/'>eYOJWXq</a> by xiaopc
  (<a href='https://codepen.io/xiaopc'>@xiaopc</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

（如果上面这个例子没有效果，说明你得升级浏览器了）

如果浏览过 Apple 的产品页面，应该会发现在 Safari 下的导航条有着和 iOS 7+ 一样的实时模糊效果，这就是`backdrop-filter`的作用了。

下图就是新 Mac Pro ~~（刨丝器）~~页面的效果：

![](/images/backdrop-filter-browser-test.png)

## How

`backdrop-filter`不是只有模糊这一个效果，

> `backdrop-filter` CSS 属性可以让你为一个元素后面区域添加图形效果（如模糊或颜色偏移）。 因为它适用于元素背后的所有元素，为了看到效果，必须使元素或其背景至少部分透明。[1]

属性示例：

```css
/* <filter-function> 过滤器函数 */
backdrop-filter: blur(2px);
backdrop-filter: brightness(60%);
backdrop-filter: contrast(40%);
backdrop-filter: drop-shadow(4px 4px 10px blue);
backdrop-filter: grayscale(30%);
backdrop-filter: hue-rotate(120deg);
backdrop-filter: invert(70%);
backdrop-filter: opacity(20%);
backdrop-filter: sepia(90%);
backdrop-filter: saturate(80%);

/* SVG 过滤器 */
backdrop-filter: url(commonfilters.svg#filter);

/* 多重过滤器 */
backdrop-filter: url(filters.svg#filter) blur(4px) saturate(150%);
```

## Why

来看一下现在的浏览器支持情况。

![](/images/backdrop-filter-caniuse.png)

Safari 是最早支持的（目前还要加 `-webkit-` 前缀），Edge 也很早就支持了（但是为什么也用 `-webkit-` 前缀啊）。

尽管如此，当时能够使用`backdrop-filter`的流量占比仍然不高（实验室特性不算，当时存在着一些 bug）。

而现在 Chrome 正式支持后，基本就覆盖了大多数流量。
（Firefox 已经在 Consideration 中了，实现的 bug 也解决了 2/3）

## 题外

用 Chrome 打开刨丝器那页时，只有集显的 6200U 的 CPU 使用率最高达到了 85%+5%...

新特性带给浏览器更强大的图形处理能力，也带来了更高的性能要求啊。


* * *

本文参考了：

[1] backdrop-filter - CSS（层叠样式表） [https://developer.mozilla.org/zh-CN/docs/Web/CSS/backdrop-filter](https://developer.mozilla.org/zh-CN/docs/Web/CSS/backdrop-filter)