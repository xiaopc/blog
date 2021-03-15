---
title: 用 Google Analytics 4 和 Google Tag Manager 能玩出什么花样
date: 2021-03-14 15:54:39
categories:
  - devops
---

前几天突然有网页统计的需求，就找了下以前很流行的网页统计工具.

结果发现，CNZZ 被友盟收购、再被阿里收购以后就从来没更新过了；

腾讯统计悄无声息地下线了（有个站用着，现在才发现 orz）；

51.la 的管理页面还挂着一堆灰产的广告（马上要上的新版，终于加了页面内行为统计等等这些早就该有的功能）；

百度统计好歹还能跟得上时代（只有它能拿到百度过来流量的关键词），但是分析功能要花钱钱...

那么，「yyds」Google Analytics 呢？

<!--more-->

## 0. Google Analytics 4 / Tag Manager

2020 年 10 月 Google 把应用分析和网页分析合并，推出了 Google Analytics 4. 
它基于新的 `gtag.js` 框架，整合了 Google 所有分析、广告等服务.

![GA4 首页](/images/ga_gtm_0.0.png)

![旧版首页](/images/ga_gtm_0.2.png)

![GA4 实时](/images/ga_gtm_0.1.png)

![旧版实时](/images/ga_gtm_0.3.png)

v4 有几个好：

1. 可以选择通过 Google Signal 将多端打通进行分析（开启后国内流量会因为无法访问 `analytics.google.com` 而无法加载）；

2. 管理控制台简化了逻辑，增强了自定义可视化分析能力；

3. 不再基于 session（因应隐私保护要求提高），全部回报均为事件驱动；

4. 全量数据可以导出至 Big Query.

Tag Manager（跟踪代码管理器）用来统一管理所有的第三方代码，只需要在页面中添加 Tag Manager 就可以动态设置接入的服务，还可以通过配置各种自定义代码来进行针对性的信息收集.
比如支持将 SPA 化为常规页面进行跟踪，收集自定义事件，定时回报等操作.

![GTM 工作区](/images/ga_gtm_0.4.png)

![支持多用户协作和版本控制](/images/ga_gtm_0.5.png)

用 Google Analytics 和 Tag Manager 可能有两个问题，一是国内可能（概率性）由于众所周知的原因无法加载 JS，二是（有的）广告拦截可能直接把 Tag Manager 直接拦截掉，从而使全部代码失效.

如果不需要考虑这两点，那么就继续吧.


## 1. 安装和配置

在管理菜单，旧版 Analytics（现称 Universal Analytics）会提供一个「GA4 设置助理」，可以自动配置新的「GA4 媒体资源」.

![GA4 设置助理](/images/ga_gtm_1.0.png)

可以通过只部署新版/旧版统计代码，将数据转发至旧版/新版 Analytics（参考链接 1）.

简单起见，这里使用建立新的 GA4 媒体资源. 现在默认流程创建的是 GA4 版，如需旧版需要在高级选项里选中「创建 Universal Analytics 媒体资源」.

![建立媒体资源](/images/ga_gtm_1.1.png)

创建 GA4 媒体资源后，添加网站「数据流」.

![添加数据流](/images/ga_gtm_1.2.png)

![网站数据流](/images/ga_gtm_1.3.png)

GA4 的「测量 ID」是以 `G-` 开头的，而旧版的「跟踪 ID」是以 `UA-` 开头的.

不急着添加页面内代码，因为接下来要用 Tag Manager 配置.

在 Analytics 左上角的账号切换菜单里，切换到跟踪代码管理器，创建账号，同时配置一个 Web「容器」.

![创建容器](/images/ga_gtm_1.4.png)

容器创建以后，这个需要在 `head` 和 `body` 里添加的代码才是需要部署的.

在工作区中「新建代码」，选择「GA4 配置」，填入测量 ID，勾选发送浏览事件. 保存以后提交版本，统计就上线部署了.

![新建代码](/images/ga_gtm_1.5.png)


## 2. 统计国内特色「小尾巴」

以前做数字营销的，以及现在做「出海」增长的应该熟稔 Google Analytics 用来进行流量跟踪的 `UTM 参数`，不了解的可以见参考链接 2.

简言之是在 HTTP GET 参数里添加 `utm_source` `utm_medium` `utm_campaign` `utm_content` 这些参数来区分用户渠道，目前算是通用的标记形式.

但是国内市场上，每家都会搞自己的来源标记，像是微信分享出去的链接会加上 `from=groupmessage&isappinstalled=0` 这类参数，支付宝分享出去的会带 `chInfo=ch_share__chsub_ALPContact` 这样的.

那么怎么根据这些「小尾巴」区分流量来源呢？在旧版 Analytics 中，可以通过手动设定自定义渠道实现（参考链接 3）；
或是在 Tag Manager 生成 UTM 参数，直接设置为 Analytics 的参数（参考链接 4）.

这里在 Analytics 4 中实现后一种方法.

Tag Manager 有三个核心概念：代码、触发器和变量.
代码顾名思义，插入页面中用来执行某一动作；触发器可以感知用户操作、Javascript Event 等等；变量则是声明 Tag Manager 配置文件里的变量是从哪里获取.

此外 Tag Manager 还提供了模板功能，可以从模板社区中获得自定义的代码和触发器.

这里用到了 `URL Parser` 这个变量模板，作用是从 URL 中提取需要的片段. 其本质是一个自定义 Javascript 函数（等下就会用到）.

![社区模板库](/images/ga_gtm_1.7.png)

添加了这个变量模板以后，开始创建需要的变量.

首先需要提取出分享参数，这里以支付宝的 `chInfo` 参数为例.
在「变量」中，先配置内部变量，勾选「Page URL」. 
然后创建用户变量，类型为 `URL Parser`，按下图配置. 带双花括号的是变量，可以通过输入框右边的快捷选中按钮添加.

![提取 GET 参数](/images/ga_gtm_1.8.png)

这个变量的作用是，将 `{{Page URL}}` 中名为 `chInfo` 的请求参数的值提取出来.

同样的方法，再创建一个变量用来提取 `{{Page URL}}` 中的 `utm_campaign`，变量命名为 `Get utm_campaign`.

创建一个变量，类型为「自定义 Javascript」，代码如下:

![新的 utm_campaign](/images/ga_gtm_1.9.png)

代码很简单，就是如果 URL 自带 `utm_campaign` 就返回原来的值，否则就返回 `chInfo` 参数的值.

以此类推，按照同样的方法可以自定义 `utm_source` `utm_medium` 这些参数.

最后，在原来的 GA4 配置中，设置字段名称覆盖默认值.
这里要注意，Analytics 4 使用的字段名与旧版的小写驼峰有所不同（旧版的见参考链接 5），目前还没找到官方文档.（一个方法是查看已统计数据中的字段名）

![GA4 配置](/images/ga_gtm_1.6.png)

上线以后，有新流量以后就可以在 Analytics 4 的「流量获取」里看到来源了.

## 3. 收集前端 APM 数据

应用性能管理（Application Performance Management）在前端中的落地，主要是收集连接速度、元素渲染时间及资源消耗和运行错误这些数据，从而为前端性能优化提供参考.

不过现在各家的前端 APM 好像没有免费的，不如就用 Analytics 4 + Tag Manager 来实现一个简单的性能收集.

旧版 Analytics 其实也有速度统计，不过默认只抽样 1% 统计统计打开时间（可以修改，见参考链接 6），而且有最大样本数限制.

而 Analytics 4 所有数据均使用事件机制获取，事件种类最高 500 种，没有总量限制. 这里使用一个事件来收集性能信息.

先添加一个窗口加载就触发的触发器.

![窗口加载触发器](/images/ga_gtm_2.0.png)

然后创建一段代码，类型是「自定义 HTML」，它会在页面中插入这段 HTML. 这里写一段被 `<script>` 标签包裹起来的 Javascript 代码，完整代码可以参考 [这里](https://gist.github.com/sgelob/110581ed66cf49a6d6c3b7ac33cdc17c).

大致上是使用 `Performance API` 获取性能数据（用法可以参考 MDN 或者参考链接 7），创建一个包含数据的事件，然后用 `dataLayer.push` 送到 Tag Manager 的数据层.

![性能测试代码](/images/ga_gtm_2.1.png)

然后为数据层中需要上报的参数添加对应的「数据层变量」.

![添加数据层变量](/images/ga_gtm_2.2.png)

添加一个触发器，类型是「自定义事件」，事件名是刚才 push 到数据层的事件.

![添加自定义事件触发器](/images/ga_gtm_2.3.png)

最后，新建一个代码，类型为「GA4 事件」，选择之前的 GA4 配置，把所有的数据层变量添加进来.

![添加 GA4 事件代码](/images/ga_gtm_2.4.png)

Tag Manager 提供了一个测试工具 Tag Assistant，只需要点击「提交」旁边的「预览」按钮就可以开始本地测试.

![Tag Assistant](/images/ga_gtm_2.5.png)

在 Tag Manager 测试时，Analytics 4 新增的 DebugView 也会同时启用，可以查看实时事件及接收到的数据.

![DebugView](/images/ga_gtm_2.7.png)

接下来对 Analytics 4 收到的数据进行一些配置. 在「自定义定义 - 自定义指标」里为对应的参数设置名称.（自定义定义/指标一旦设置就不能彻底删除，只能选择归档）

![自定义指标](/images/ga_gtm_2.6.png)

在「分析」里可以添加自定义视图来对数据进行分析.

新建一个「探索」视图，图表选择表格，行可以在「维度」里选择，这里选择主机名和网页标题；
值可以在「指标」里选择，这里就选择事件数以及刚才定义的性能指标；过滤器设置为事件名完全匹配.

![分析视图](/images/ga_gtm_2.8.png)

这里可能会发现一个问题，这里性能指标是所有样本的和，而不是更有意义的统计值.

解决办法嘛有两个，一是将在「管理 - BigQuery 关联」里配置，将原始数据导出至 Google Cloud BigQuery 进行分析，二是在视图右上角将视图导出到 Google Sheets（属于 Google Docs）进行分析.

![导出到表格](/images/ga_gtm_2.9.png)

也希望 Analytics 4 以后增加一些统计选项，直接 out-of-box 即用.

* * *

本文参考了：

[1] https://www.ichdata.com/docs/google-analytics-4/ga4%e7%9a%84%e5%b8%83%e7%bd%b2%e4%b8%8e%e8%b0%83%e4%bc%98/%e8%bd%ac%e5%8f%91%e5%b8%83%e7%bd%b2%e6%b3%95

[2] https://zhuanlan.zhihu.com/p/86453662

[3] https://www.ichdata.com/how-to-identify-wechat-traffic-in-google-analytics.html

[4] https://www.seerinteractive.com/blog/how-to-alter-your-campaign-values-using-google-tag-manager/

[5] https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference

[6] https://developers.google.com/analytics/devguides/collection/analyticsjs/user-timings

[7] https://serverless-action.com/fontend/fe-optimization/

[8] https://github.com/mikeg-de/HTML5-Performance-API-GTM-Script

[9] https://www.youtube.com/watch?v=nyD54NEn0ac
