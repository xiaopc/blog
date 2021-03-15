---
title: 换新 SSL 证书
id: 84
categories:
  - 其他
date: 2016-09-11 16:48:45
---

## 为什么不再使用 StartSSL 的证书

StartCom 目前被 WoSign 控制，而 WoSign 被某数字公司控制[1]。最近 WoSign 频曝丑闻[2]，最早就对 WoSign 不太认可的 Mozilla 已经开始考虑吊销它们的 CA 证书了[3]。

<!--more-->

## 为什么不用 Let's Encrypt

虽说现在已经有了多种脚本可以自动续期，然而相较于签发时间长的传统 CA，LE 续期操作目前仍稍显麻烦。

## (无责任推广) 腾讯云免费签 TrustAsia 证书

呃，腾讯云最开始上线签证书的时候，提供的是 GeoTrust 证书（你可以在 [https://lab.xpc.im/](https://lab.xpc.im/) 看到）。现在好像是因为合作方的关系改成了 TrustAsia 证书，也是可以一用的。

腾讯云提供的是免费单域名证书，只支持一个子域名（裸域使用 www 子域就可以），不过也是能剩下原价几十元的费用。

有一点要说明，腾讯云不支持自己提交 CSR 文件，这可能让一大批人 Pass 掉它......


* * *

本文参考了：

[1] WoSign 被爆秘密收购 StartCom， WoSign 的 CEO 对此披露很不嗨皮  https://www.v2ex.com/t/303761

[2] 沃通用 FUD 恐吓 Let's Encrypt 用户 https://www.v2ex.com/t/303908

[3] Mozilla 正在讨论是否需要吊销多次出现安全问题的中国 CA 机构 Wosign  https://www.v2ex.com/t/302830
