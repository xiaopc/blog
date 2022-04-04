---
title: 旧文更新：Cloudflare Workers 反代 Google Analytics
categories:
  - devops
date: 2022-04-04 11:59:20
---

> 再写 GA 相关的内容怕是要变成 GA 小站的样子了（水平弗如，正经内容还是得看人家写的

本月，被阿里收购的 CNZZ 正式砍掉了免费服务，百度统计免费版除基础数据以外的功能也关闭了，51.la 刚重构的 v6 突然承接到这两家的「难民」，也饱受巨大的流量冲击. 
于此同时，Google Analytics 旧版「通用统计 Universal Analytics」也将于明年停止服务（统计代码以 `UA-` 开头）.

之前（还在用 WordPress 时）写的[Nginx 反代 Google Analytics 和 reCaptcha 实践](/2016/07/18/nginx-%E5%8F%8D%E4%BB%A3-google-analytics-%E5%92%8C-recaptcha-%E5%AE%9E%E8%B7%B5/)貌似是本博客搜索量最高的文章，那么就来更新一下.

<!--more-->

六年前大家还在自己搭环境建站，在 Serverless、边缘计算等风潮席卷后，现在当然要用最简单、最便宜的方式来做.
Cloudflare Workers 可以部署 Node.js 应用（其他语言转换为 JS，但不完美）. 免费额度是每天 100000 请求，每个请求最多 10 毫秒 CPU 时间.

Cloudflare 基础使用就不赘述了，在 Dashboard 里找到 Workers 开通就好. 创建服务那里，「启动器」只是选择初始模板，随便选即可.

编辑代码为：

<script src="https://gist.github.com/xiaopc/0602f06ca465d76bd9efd3dda9393738.js"></script>

要编辑的就是前三个变量，按注释说明修改. 这里路由地址可以先使用分配的 `workers.dev` 地址，测试成功以后再修改过来.

先测试一下代码是否正常加载，访问 `https://example.workers.dev/routerpath/a.js`（根据变量修改为响应地址），在响应的 JS 里搜索 `COLLECT_PATH` 值，看是否成功替换. 

然后按照 Google Analytics 里的说明安装统计代码，只是把 JS 地址改成上面这个. 安装后查看下页面，在 F12 Devtools 里看下有没有 POST 到 `COLLECT_PATH` 的成功 204 响应. 成功的话，就可以在 Google Analytics 的实时页面看到统计了.

接下来的可选操作是将自己的域名解析到 Worker. 

如果域名是 NS 接入 Cloudflare 那就很简单了，假设域名是 `example.com` 想用 `subdomain.example.com`，若这个二级域名已经使用且经过 Cloudflare（开启了橙色云朵）即可下一步，没有的话需要设置这个二级域名为任意记录，并开启橙色云朵. 然后在 Workers 里「触发器-添加路由」添加 `subdomain.example.com/*` 即可.

如果域名是之前用 Partners 方法用 CNAME 接入的（现在 Partners 已经不能新增接入了），可以在 Partners 那边给二级域名开启橙色云朵，然后同样进行第二步操作. 
其实还有一个方法，Cloudflare Pages 支持 CNAME 接入，可以创建一个空白 Pages，CNAME 到 `yourpages.pages.dev`，成功之后这个二级域名即接入了 Cloudflare 网络，那么还如前文所述一样操作即可.

当然，改完后不要忘记把 Workers 代码里的 `DOMAIN` 变量修改过来，还要更新页面安装的 JS 地址.

相比仅代理上报接口（Measurement Protocol），代理 `gtag.js` 的好处是不用自己维护这个文件的更新，且不用修改其他的代码（如使用 Google Analytics 做了自定义事件上报等等），甚至（或许可以，但未测试）支持 Tag Manager，功能更丰富. 当然缺点也显而易见，`gtag.js` 也会消耗一次请求，访问量较大时免费的请求数可能会吃紧.

最后回答为什么要反代 Google Analytics 这个问题，一方面是境内确实会有部分网络无法访问 `google-analytics.com`，个人经验而言，同时使用 GA 和其他国内统计工具，GA 的数值会低 10% 左右. 另一方面，支持 BigQuery 的 GA4 对会 SQL 的使用者而言无疑非常强大，这是其他统计工具仍无可望其项背的.  

* * *

本文参考了：

[1] https://placeless.net/blog/faster-ga4-with-cloudflare-worker

[2] https://blog.skk.moe/post/cloudflare-workers-cfga