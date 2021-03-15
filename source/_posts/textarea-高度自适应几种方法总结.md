---
title: textarea 高度自适应几种方法总结
id: 36
categories:
  - 前端
date: 2016-08-04 10:06:50
---

## 法一：使用 contenteditable &lt;div&gt; 代替 &lt;textarea&gt;

Pros: 实现起来相当方便。

Cons: 这是 HTML5 规范，有些浏览器不一定支持；没有 textarea 的样式；HTML 有可能被解析。
{% codeblock lang:html %}
<div contenteditable="true"></div>
{% endcodeblock %}

## 法二：每次 keyup 重新计算高度

Pros: 最容易想到的方法。

Cons: 效果不好（卡顿、浏览器 user agent stylesheet 干扰）。
{% codeblock lang:javascript %}
$('textarea').keyup(function () {
    $(this).height(this.scrollHeight);
});
{% endcodeblock %}

## 法三：外套 div，同步内容至 span 确定外套 div 高度

Pros: 巧妙； 效果不错。

Cons: 需要保持 span 和 textarea 样式相同；同步内容延迟（当然用 Vue.js 等框架就很简单了）。
{% codeblock lang:html %}
<div class="expandingArea">
    <pre><br><span></span><br><br></pre>
    <!-- <br> is used for adding padding -->
    <textarea></textarea>
</div>
{% endcodeblock %}

{% codeblock lang:css %}
.expandingArea{
    position:relative;
}
.expandingArea pre{
    display:block;
    visibility:hidden;
}
.expandingArea pre span{
    width: 100%;
    word-wrap: break-word;
    /* Style of span should be the same as textarea */
}
.expandingArea textarea{
    position:absolute;
    top:0;
    left:0;
    height:100%;
    max-width: 100%;
    resize: none;  /* If user resizes, height won't change */
}
{% endcodeblock %}
（JS 实现不同，就不写了）

## 其他

有些 jQuery 插件可以实现这个功能，就不再介绍了（核心大同小异）。

* * *

本文参考了：

[1] 如何创建一个高度自适应的textarea [https://segmentfault.com/q/1010000000095238](https://segmentfault.com/q/1010000000095238)

[2] textarea如何实现高度自适应？ [http://www.xuanfengge.com/textarea-on-how-to-achieve-a-high-degree-of-adaptive.html](http://www.xuanfengge.com/textarea-on-how-to-achieve-a-high-degree-of-adaptive.html)
