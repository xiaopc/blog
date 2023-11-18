---
title: Serverless 写 Telegram Bot? 白嫖 IBM Cloud (2)
date: 2020-12-07 20:11:24
categories:
  - devops
---

> 2023-11-18 update: 三年后 IBM Cloud 砍了云函数业务，本文可以不用看了

第二集，让它跑起来。

<!--more-->

## 4. 打包及部署

此时目录结构应该是这样的：

```
 telegram
 - virtualenv
   - ...
 + __main__.py
 ...
```

接下来是打包成 zip：

```bash
$ zip -r target.zip *.py virtualenv
```

（就是全部打包成一个 zip）

接下来是部署：

```bash
$ ibmcloud fn action create telegram/repeat --kind python:3.7 target.zip --param BOT_API_KEY **********:****************************** --web true
```

将上面的星号部分换成 Telegram 的 Bot key。

解释一下这条命令：

1. `fn` 是刚才安装的 Cloud Functions 插件， `action` 是「操作」

2. `create` 是创建函数，`update` 是更新， etc...

3. 接下来第一个参数是函数名，可以带一级目录

4. `--param` 参数可以设置直接传入 `args` 的环境变量，在网页控制台的「参数」页面也可以设置

5. `--web true` 会为这个函数提供不需要认证的 HTTP 接口，如果设置为 `raw` 的话，传入的请求不会被解析成对象（纯文本）；在网页控制台的「端点」页面也可以设置，接下来也要用

其他的用法看帮助：

```bash
$ ibmcloud fn action create --help
```

上传过程可能比较慢，还有可能上传成功了却没响应...

## 5. 获取接口地址

打开网页控制台，找到刚才创建的函数。在「端点」页面那里的 `HTTP 方法` 部分的 URL 应该类似这样的：

```
https://us-south.functions.appdomain.cloud/api/v1/web/******%40*****.com_dev/*****/***** 
```

正如上面写的，后面加扩展名可以输出对应种类的 `Content-type`，这里 Telegram Bot 的请求头会处理的。

## 6. 设置 Webhook

这里要用到 Telegram Bot 的原始接口了。放心，就用这一下。

设置 Webhook：

```
https://api.telegram.org/bot**********:******************************/setWebhook?url=
```

星号换成 Key，后面接上接口地址，那么完整链接就是：

```
https://api.telegram.org/bot**********:******************************/setWebhook?url=https://us-south.functions.appdomain.cloud/api/v1/web/******%40*****.com_dev/*****/*****
```

随便找浏览器打开就行了。

然后查看一下状态：

```
https://api.telegram.org/bot**********:******************************/getWebhookInfo
```

会以 JSON 形式返回状态：

```json
{
  "ok": true,
  "result": {
    "url": "https://us-south.functions.appdomain.cloud/api/v1/web/******%40*****.com_dev/*****/*****",
    "has_custom_certificate": false,
    "pending_update_count": 0,
    "max_connections": 40,
    "ip_address": "104.20.226.69"
  }
}
```

可以检查下是否设置成功，在出现调用失败的时候也能通过这个接口查看问题，以下为出现错误请求时的状态：

```json
{
  "ok": true,
  "result": {
    "url": "https://us-south.functions.appdomain.cloud/api/v1/web/******%40*****.com_dev/*****/*****",
    "has_custom_certificate": false,
    "pending_update_count": 1,
    "last_error_date": **********,
    "last_error_message": "Wrong response from the webhook: 400 Bad Request",
    "max_connections": 40,
    "ip_address": "104.20.226.69"
  }
}
```

这样一个 Bot 就做好了~

## 7. 调试及状态监控

如果刚才测试过接口的话，会发现每次响应都包含一个 `code`。Cloud Functions 为每次请求都生成了一个 「激活标志」 ID，可以通过这个 ID 来进行调试，查看请求、输出等等日志信息。

在网页控制台的「监视」页面可以查看统计信息，还可以点击请求的激活标志查看日志。

而在 CLI 中可以通过这个命令打开日志 poll 推送：

```bash
$ ibmcloud fn activation poll
```

这里只显示基础日志（stdout、stderr 输出），查询详细日志：

```bash
$ ibmcloud fn activation get **********激活标志**********
```

到此，只用一个 Cloud Functions 做一个简单的 Bot 就完成了。

下一集是如何调用其他 Function，以及如何加嫖 IBM Cloud 其他服务了。

* * *

本文参考了：

[1] https://useless-ideas.hashnode.dev/building-a-telegram-bot-with-ibm-cloud-functions-ck7dmyvi7000c8qs1tuklfuf6

[2] https://core.telegram.org/bots/api