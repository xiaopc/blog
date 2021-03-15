---
title: Crypto-JS 介绍以及一个常见的坑
id: 33
categories:
  - 前端
date: 2016-07-26 09:07:36
---

## 概述

在无法使用 HTTPS 时，或需要增加前端安全时，用 JS 加密是个可行的方法。Crypto-JS 支持 MD5/SHA-1/SHA-2/SHA-3/HMAC/PBKDF2 等 Hash，以及 AES/DES/Triple DES/Rabbit/RC4/RC4Drop 等 Cipher，可自选 Block Modes 和 Padding。可单独加载某一种模式，有很强的组合性。

地址：[https://code.google.com/archive/p/crypto-js/](https://code.google.com/archive/p/crypto-js/) &amp;&amp; [https://github.com/brix/crypto-js](https://github.com/brix/crypto-js)

<!--more-->

## MD5

可单独引用 md5.js 。
{% codeblock lang:javascript %}
CryptoJS.MD5("test");
{% endcodeblock %}

## PBKDF2

可单独引用 pbkdf2.js 。
{% codeblock lang:javascript %}
// 官方示例
var str = '123456';
var salt = CryptoJS.lib.WordArray.random(128/8);

var key128Bits = CryptoJS.PBKDF2(str, salt, { keySize: 128/32 });
var key256Bits = CryptoJS.PBKDF2(str, salt, { keySize: 256/32 });
var key512Bits = CryptoJS.PBKDF2(str, salt, { keySize: 512/32 });

var key512Bits1000Iterations = CryptoJS.PBKDF2("Secret Passphrase", salt, {
keySize: 512/32,
iterations: 1000
});
{% endcodeblock %}

## AES

默认是 AES-CBC-Pkcs5(Pkcs7)（其他套件可单独引用），密钥长度随输入的密码长度自动确定（如果使用[密码短语](https://en.wikipedia.org/wiki/Passphrase)则使用 256 位）。

加密：（文题所说的坑在这）
{% codeblock lang:javascript %}
var str = '123456'; // 加密内容
var key = '0123456789abcdef'; // 密钥
var iv = '0123456789abcdef'; // 初始向量，不设置会随机生成(当然也就无法解密了)

key = CryptoJS.enc.Utf8.parse(key); // **注意！如果引用了 jQuery 则需要加 "toString()"**
iv = CryptoJS.enc.Utf8.parse(iv); // **同上，详见 [2]**

var encrypted = CryptoJS.AES.encrypt(str, key, {
 iv: iv,
 mode: CryptoJS.mode.CBC,
 padding: CryptoJS.pad.Pkcs7
});

// **encrypt()返回的是一个对象！需要：**
encrypted = encrypted.toString();
{% endcodeblock %}

解密：
{% codeblock lang:javascript %}
var decrypted = CryptoJS.AES.decrypt(encrypted, key, {
 iv: iv,
 mode: CryptoJS.mode.CBC,
 padding: CryptoJS.pad.Pkcs7
});

// 转换为 utf8 字符串
decrypted = CryptoJS.enc.Utf8.stringify(decrypted);
{% endcodeblock %}

## 其他 Cipher

基本上相同，只是 Rabbit 和 RC4 不支持定义 mode 和 padding。

* * *

本文参考了：

[1] JavaScript Crypto-JS 使用手册 [https://blog.zhengxianjun.com/2015/05/javascript-crypto-js/](https://blog.zhengxianjun.com/2015/05/javascript-crypto-js/)

[2] [http://stackoverflow.com/questions/35529804/using-crypto-js-to-encrypt-password-and-send-form-via-ajax-and-decrypt-in-java](http://stackoverflow.com/questions/35529804/using-crypto-js-to-encrypt-password-and-send-form-via-ajax-and-decrypt-in-java)
