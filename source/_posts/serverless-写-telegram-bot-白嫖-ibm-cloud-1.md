---
title: Serverless 写 Telegram Bot? 白嫖 IBM Cloud (1)
date: 2020-11-18 10:51:32
categories:
  - devops
---

网上的教程都是教白嫖 Cloud Foundary 建站~~开梯子~~的，弄得 IBM 都开始封 IP 了，哼。 (* ￣︿￣)

来玩点正经的吧！今天用 Serverless 来做 Telegram Bot。

<!--more-->

## 0. 注册

IBM Cloud 的免费 tier 有一个好，不用绑信用卡（这也是被薅太多的原因之一）。

在 [https://www.ibm.com/cloud/free](https://www.ibm.com/cloud/free) 能看到免费项目，这里首先要用 IBM Cloud Functions。

Cloud Functions 是 IBM 提供的 Serverless 服务，类似[阿里云的函数计算](https://www.aliyun.com/product/fc?source=5176.11533457&userCode=hl1uilbl)、[腾讯云的云函数](https://cloud.tencent.com/act/cps/redirect?redirect=10232&cps_key=da2e67a4ea07864f3ac54599a94cd8c7)。与 App Engine 服务不同的是，函数计算只在被触发时才会运行，在限定执行时间返回结果，不能持久运行。

IBM Cloud 给了 500 万次/月的免费额度，阿里云和腾讯云也有一定的免费额度。不过这次是来做 Telegram Bot，这里就来嫖 IBM 的。

注册的时候，如果在最后一步遇到错误，那么可能是被 ban IP 了，可以试试挂梯子注册...

## 1. 安装 CLI 及配置

注册以后来到网页控制台里的 [Cloud Functions](https://cloud.ibm.com/functions)。控制台里有这些选项卡：

- 操作：这里是函数列表。

- 触发器：这里可以添加从 IBM Cloud 其他服务或第三方消息源收到信息后触发某个函数，这里还用不到。

- API：把函数整理成 API，目前还用不到。

- 监视：能看到最近请求的日志

- 名称空间设置：namespace，顾名思义。默认分配的位于达拉斯，名称是邮箱。也可以添加其他地方，但这里有坑，后面再说。

如果在网页控制台里新建操作，会发现它只给了个单文件代码输入，而且还没办法添加 packages，这就很鸡肋了。

所以要安装 CLI 来在本地写代码：（下面是 Linux 安装，其他安装方法[见这](https://cloud.ibm.com/docs/openwhisk?topic=cloud-functions-cli_install)）

```bash
$ curl -fsSL https://clis.cloud.ibm.com/install/linux | sh
```

登录，注意这时要选区域，如果是达拉斯那就是 `us-south`：

```bash
$ ibmcloud login
```

需要额外设置「组织」和「空间名」两个设置，在网页版右上角「管理-账户-Cloud Foundry 组织」可以找到组织名，点进去有空间名。

~~前面提到的坑在于，在 Cloud Functions 里建立的命名空间不是基于 Cloud Foundary 的，无法用 CLI 来进行操作（aka 只能用网页操作）。而 Cloud Foundary 在免费 tier 只提供了 `us-south`，所以东京等等节点基本上没法用...~~

> 2021.1.25 update <br> (基于 IAM 而不是 Cloud Foundary 的命名空间) 其实可以用 CLI，区域选新命名空间所在的区域，然后用 `ibmcloud fn property set --namespace '命名空间'` 为 Function 单独指定即可，不需要设置 Cloud Foundary 相关参数.

```bash
$ ibmcloud target -o *组织名，一般是账号* -s *空间名，一般是 dev*
```

设置好以后查看下账号信息，应该是这样的：

```bash
$ ibmcloud target

API endpoint:      https://cloud.ibm.com
Region:            us-south
User:              ******@****.com
Account:           ***** 's Account (****************)
Resource group:    No resource group targeted, use 'ibmcloud target -g RESOURCE_GROUP'
CF API endpoint:   https://api.us-south.cf.cloud.ibm.com (API version: 2.153.0)
Org:               ******@****.com
Space:             dev
```

(资源组可以不设置)

然后安装 Functions 插件：

```bash
$ ibmcloud plugin install cloud-functions
```

这样 CLI 就配置好了。

## 2. 注册 Telegram Bot

~~首先要有 Telegram 账号~~

搜索 @BotFather 按照提示建立就好。

记录一下 HTTP API 的 token `**********:******************************`。

## 3. 开始写

这里选择是用 Python 3.7 的环境，使用 [python-telegram-bot](https://python-telegram-bot.readthedocs.io/en/stable/index.html) 这个库。

首先建立一个名叫 `virtualenv` 的 virtualenv...(好像其他名字不认)

```bash
$ virtualenv virtualenv
$ source virtualenv/bin/activate
```

安装依赖：

```bash
$ pip install python-telegram-bot
```

主入口是 `__main__.py`，代码如下：

```python
from telegram import Bot, Update
from telegram.ext import Dispatcher, CommandHandler, MessageHandler, CallbackQueryHandler, Filters, CallbackContext

global TOKEN
global bot

def fn_hi(update: Update, context: CallbackContext) -> None:
    update.message.reply_text('ヾ(•ω•`)o')

def response(update: Update, context: CallbackContext) -> None:
    update.message.reply_text(update.message.text)

def main(args):
    # initialize bot object
    TOKEN = args['BOT_API_KEY']
    bot = Bot(token=TOKEN)
    # set dispatcher
    dispatcher = Dispatcher(bot=bot, update_queue=Queue(), use_context=True)
    dispatcher.add_handler(CommandHandler('hi', fn_hi))
    dispatcher.add_handler(MessageHandler(Filters.text & ~Filters.command, response))
    dispatcher.add_handler(CallbackQueryHandler(handle_callback))
    # get webhook callback
    update = Update.de_json(args, bot)
    # push to dispatcher
    dispatcher.process_update(update)

    return { 'code': '200' }
```

代码里不设置 token，在部署的时候会作为参数传入。

这就完成了一个无情的复读机 (o=^•ェ•)o　┏━┓

如何部署，见下回分晓...

* * *

本文参考了：

[1] https://medium.com/@aliabdelaal/telegram-bot-tutorial-using-python-and-flask-1fc634da9522