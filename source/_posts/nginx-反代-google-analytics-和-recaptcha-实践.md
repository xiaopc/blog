---
title: Nginx 反代 Google Analytics 和 reCaptcha 实践
id: 13
categories:
  - 后端
date: 2016-07-18 09:32:22
---

> 2022/4/4 update:
> 更新版请见 [Cloudflare Workers 反代 Google Analytics](https://xiaopc.org/2022/04/04/%E6%97%A7%E6%96%87%E6%9B%B4%E6%96%B0-cloudflare-workers-%E5%8F%8D%E4%BB%A3-google-analytics/)

> 2018/3/11 update
> 
> 这个方法现在有许多问题（无法获得真实IP等），鉴于现在 Google Analytics 服务可用性在好转，不再建议使用这种方式。如果追求可靠性的话，建议使用国内的服务或者自建统计服务。
> 
> ps: 这是这个 Blog 点击量和搜索量最高的页面......

网上反代 Analytics 的 conf 代码都是适应旧版 Analytics 的，没有反代 reCaptcha 的代码。在改代码的时候遇到了不少坑，下面是踩了坑后的成果。

<!--more-->

注意：1.需要 ngx_http_substitutions_filter_module 模块。
2.SSL 配置时一！定！不！要！加 X-Frame-Options DENY ！ （自用可改成 SOMEORIGIN，未测试）
3.reCaptcha 反代后 challenge 难度会增加（走代理可信度降低，部分代码用了复杂的混淆导致客户端识别代码无法反代）。
{% codeblock lang:nginx %}
# reCaptcha reverse proxy
 location /recaptcha {
     default_type text/html;
     subs_filter_types text/css text/xml text/javascript;
     subs_filter 'www.gstatic.com' 'lab.xpc.im/wwwgstatic' g;
     proxy_set_header X-real-ip $remote_addr;
     proxy_pass https://www.google.com/recaptcha;
     proxy_set_header Accept-Encoding ""; #see [3]
     proxy_set_header User-Agent $http_user_agent;
     break;
 }
 location /wwwgstatic {
     subs_filter_types text/css text/xml text/javascript;
     subs_filter 'www.gstatic.com' 'lab.xpc.im/wwwgstatic' g;
     subs_filter 'www.google.com/recaptcha' 'lab.xpc.im/recaptcha' g;
     subs_filter 'ssl.gstatic.com' 'lab.xpc.im/sslgstatic' g;
     proxy_set_header X-real-ip $remote_addr;
     proxy_pass https://www.gstatic.com/;
     proxy_set_header Accept-Encoding "";
     proxy_set_header User-Agent $http_user_agent;
     break;
 }
 location /sslgstatic {
     subs_filter_types text/css text/xml text/javascript;
     subs_filter 'www.gstatic.com' 'lab.xpc.im/wwwgstatic' g;
     subs_filter 'www.google.com/recaptcha' 'lab.xpc.im/recaptcha' g;
     proxy_set_header X-real-ip $remote_addr;
     proxy_pass https://ssl.gstatic.com/;
     proxy_set_header Accept-Encoding "";
     proxy_set_header User-Agent $http_user_agent;
     break;
 }
{% endcodeblock %}
{% codeblock lang:nginx %}
# Google Analytics reverse proxy
 location /ga {
     proxy_set_header X-real-ip $remote_addr;
     rewrite ^/ga/(.*)$ /$1?$args&amp;uip=$remote_addr;
     proxy_pass https://www.google-analytics.com;
     proxy_set_header User-Agent $http_user_agent;
     break;
 }
 location /analytics {
     proxy_set_header X-real-ip $remote_addr;
     rewrite ^/ga/(.*)$ /$1?$args&amp;uip=$remote_addr;
     proxy_pass https://www.google.com;
     proxy_set_header User-Agent $http_user_agent;
     break;
 }
 location /analytics.js {
     default_type text/html;
     subs_filter_types text/css text/xml text/javascript;
     subs_filter 'www.google-analytics.com' 'lab.xpc.im/ga' g;
     subs_filter 'www.google.com/analytics' 'lab.xpc.im/analytics' g;
     proxy_set_header X-real-ip $remote_addr;
     proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
     proxy_set_header Referer https://www.google-analytics.com;
     proxy_set_header Host www.google-analytics.com;
     proxy_pass https://www.google-analytics.com;
     proxy_set_header Accept-Encoding "";
 }
{% endcodeblock %}

* * *

本文参考了以下内容：

[1] 使用 Nginx 解決 Google Analytics 在大陆被牆的問題  https://ruby-china.org/topics/27400

[2] 关于proxy_pass的参数路径问题  https://rocfang.gitbooks.io/dev-notes/content/guan_yu_proxy_pass_de_can_shu_lu_jing_wen_ti.html

[3] Nginx 反代 Gzip 内容时， sub_filter 等 content filter 无效的另一种解决  https://www.v2ex.com/t/234923
