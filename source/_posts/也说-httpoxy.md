---
title: 也说 httpoxy
id: 20
categories:
  - 后端
date: 2016-07-20 16:04:37
---

1.  从环境变量取 HTTP_PROXY 的服务可能受影响（wget/curl 之类没事）。
2.  这个服务向外连接时数据可能会被指定的 HTTP_PROXY 截取。
3.  CGI/FPM 模式下。
4.  nginx修复：在 fastcgi.conf 加：
{% codeblock lang:nginx %}
fastcgi_param HTTP_PROXY "";
{% endcodeblock %}
5.  Apache 有官方更新。

<!--more-->

* * *

本文参考了：

[1] httpoxy [https://httpoxy.org/](https://httpoxy.org/)

[2] HTTPOXY漏洞说明  [http://www.laruence.com/2016/07/19/3101.html](http://www.laruence.com/2016/07/19/3101.html)
