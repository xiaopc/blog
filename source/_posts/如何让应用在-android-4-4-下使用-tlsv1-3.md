---
title: 如何让应用在 Android 4.4 下使用 TLSv1.3
categories:
  - 移动开发
date: 2022-10-07 17:12:15
---

> 半年更博主 ✅

虽然现在（应该、大约）没有 Android Kitkat `API 19` 以下的新设备了，但是为了响应欧盟号召，旧设备还是要好好利用啊. 

目前大多数人接触得到的这类旧设备就是机顶盒了，而旧版 Android 内置的 OpenSSL 还支持 SSLv3（有 Poodle 漏洞），而且不支持现代的 TLSv1.3（HTTP/2 必须），这会导致许多连接问题.

（不关闭 SSLv3 的话，在 Qualys SSL Test 评估会直降一级）

由于这个问题在中文互联网好像没人写（除了 Stackoverflow 采集站以外），所以就来写一下.

<!--more-->

> 如 TLDR 可直接看最后一节

## 0. Java 加密套件的关系

Java 安全提供者 (JSP) 包括密码学扩展 (JCE) 和安全套接字扩展 (JSSE). 密码学扩展就是 OpenSSL、BoringSSL 这些密码库，安全套接字扩展则是使用密码库来处理 TLS/SSL 连接的 Client/Server 组件.

支持 TLSv1.3 的话，首先需要支持它的密码套件（比如说，加密算法必须支持 AEAD），这有赖密码学扩展支持.

而后，需要在协议握手时正确向目标提供密码套件列表（ClientHello/ServerHello），进行证书鉴别等等，然后正确完成建立连接这一系列过程，都是安全套接字扩展负责.

在 Kitkat 及以前，Android 内置的密码学扩展是 `openssl-1.0.1e`，而到 `1.0.2j` 版本才支持，内置的安全套接字扩展自然没有 TLSv1.3 的支持. [1]

## 1. Google 钦定的 GMS Security Provider 

Google 近些年才想到把系统各组件拆开更新，而对于 JSP 则是通过 GMS 来提供，随着 Play Services 一起更新.

使用 GMS 的应用可以通过 `com.google.android.gms.security.ProviderInstaller` 安装 GMS 的一揽子 Provider:

<script src="https://gist.github.com/patrickhammond/0b13ec35160af758d98c.js"></script>

然而，Kitkat 能安装到最新的 Play Services 版本只有 7.x，还是不够用.

## 2. 如果只动 JSSE： NetCipher

如果只为了禁用 SSLv3 且使用最优的密码套件，[NetCipher](https://github.com/guardianproject/NetCipher) 只是修改 JSSE 的配置，几乎不会造成打包后体积变化.

`'info.guardianproject.netcipher:netcipher'` 提供了一个 `StrongConnectionBuilder` 套在 `HttpURLConnection` 外面，代码改动很小.

不过，它提供适用 `okhttp` 的构件 `info.guardianproject.netcipher:netcipher-okhttp3` 目前为止有 Bug 无法正常使用，且暂无更新计划. [2]

## 3. 根本解决：内置新版 Conscrypt

[Conscrypt](https://github.com/google/conscrypt) 是 Android 系统内置的 JSP，Google 将它独立了出来，使用自己的 BoringSSL 密码库，只需要在应用内置新版就行了.

但是不像它在 README 里说的那么简单，由于 Conscrypt 没有实现证书管理器 `X509ExtendedTrustManager` 而且也暂无更新[3]等缺失，所以需要额外实现.

适配 `okhttp` 的代码如下（后附一点点说明）；

<script src="https://gist.github.com/Karewan/4b0270755e7053b471fdca4419467216.js"></script>

1. `okhttp` 对 API 19 的支持到 3.12.x 版本
2. JSP 列表是从 1 开始编号的
3. 若还要访问 http 地址，则在 connectionSpecs 那里增加 ConnectionSpec.CLEARTEXT
4. SSLContext.init 三个参数分别是 `KeyManager[]`, `TrustManager[]`, `SecureRandom`, null 时使用系统默认第一个

* * *

本文参考了：

[1] https://enzowyf.github.io/android_alpn.html

[2] https://gitlab.com/guardianproject/NetCipher/-/issues/17

[3] https://github.com/google/conscrypt/issues/848

[4] https://gist.github.com/Karewan/4b0270755e7053b471fdca4419467216