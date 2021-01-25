---
title: Serverless 写 Telegram Bot? 白嫖 IBM Cloud (3)
date: 2020-12-27 19:15:50
categories:
  - devops
---

最后来一些[豆知识](https://zh.wikipedia.org/wiki/%E5%86%B7%E7%9F%A5%E8%AD%98)收尾。

<!--more-->


## 9. 使用 Cloud Function 可能会遇到的问题

1. 如果依赖里有需要编译二进制 `.so` 的 packages，务必在与 Cloud Function 容器相同的环境下安装到 virtualenv。
  （否则会遇到诸如 `ModuleNotFoundError` 这种问题[1]）

```python
# ’python:3.7‘ 环境目前是:

os.uname() == ["Linux", "action", "4.4.0-197-generic", "#229-Ubuntu SMP Wed Nov 25 11:05:42 UTC 2020", "x86_64"]
sys.version == "3.7.9 (default, Sep 10 2020, 17:09:36) \n[GCC 8.3.0]"
```

> 针对 Python 版本问题，一个解决方法是：
> 
> a. 安装 [pyenv](https://github.com/pyenv/pyenv);
> 
> b. 安装编译 Python 所需依赖[2];
> 
> c. 安装对应版本的 Python（从 python.org 下载安装包太慢的话，自行下载放至 pyenv 的 `cache` 目录下即可）;
> 
> d. 安装 virtualenv（`pyenv-virtualenv` 插件生成的 virtualenv 没有 `bin/active_this.py`）;
> 
> e. 按照之前的步骤创建 virtualenv.
> 
> 或者用 [Docker 的解决方法](https://github.com/apache/openwhisk/blob/master/docs/actions-python.md#packaging-python-actions-with-a-virtual-environment-in-zip-files)，这里还有写默认环境有哪些 packages。

2. 因为只需要 `active_this.py`，所以 `virtualenv/bin/` 下 `python*` 的二进制软链接其实没用。
  在 `zip` 打包时可以加 `-y` 参数，只打包软链接而不是二进制文件。（可减少 10MB+ 体积）

3. Cloud Function 上传 zip 包最大限制为 50MB。（fyi, numpy 就超了）

4. 通过公开 RESTful API 执行函数，出错时客户端得到的代码并不是 「激活标志」，需要到日志查看。

5. 通过公开 RESTful API 执行函数，传给 `main` 的 `dict` 里还有 `__ow_body`, `__ow_query` 等内容，[详见这里](https://github.com/apache/openwhisk/blob/master/docs/webactions.md#http-context)。

## 10. 写 Telegram Bot 时可能会遇到的问题

1. 如果 Webhook 接口返回 HTTP 4xx 错误（`main` 有未处理异常）的话，Telegram 会一直重试；而 Cloud Function 是按调用次数计费的...

2. 发送时间超过 48h 的消息是没法撤回的，尝试撤回的话 `python-telegram-bot` 会丢出异常。

3. Telegram 的 Markdown/MarkdownV2 都不支持表格，HTML 标签也只支持给定的几个。
  （可以试试[只用 Pillow 把表格画成图片](https://gist.github.com/xiaopc/324acb627e6f1f019ab60b0ec0e355aa)，matplotlib 什么的就不要想了）

<script src="https://gist.github.com/xiaopc/324acb627e6f1f019ab60b0ec0e355aa.js"></script>

## 11. 调用其他 Function，再嫖个 NoSQL

调用其他 Function 其实也是用 HTTP API，一个示例：

```python
APIHOST  = os.environ.get('__OW_API_HOST')
NAMESPACE = os.environ.get('__OW_NAMESPACE')
USER_PASS = os.environ.get('__OW_API_KEY').split(':')

def call_action(action, params = {}):
    url = APIHOST + '/api/v1/namespaces/' + NAMESPACE + '/actions/' + action
    response = requests.post(url, json=params, params={'blocking': 'true'}, auth=(USER_PASS[0], USER_PASS[1])).json()
    if response['response']['success']:
        return response['response']['result']
    else:
        raise Exception(str(response['response']['result']))
```

加上个 NoSQL，基本上已经可以解决大部分写 Bot 的需求了。

Cloudant 是基于 Apache CouchDB 的 NoSQL 数据库，用 RESTful API 访问，JSON 输出。免费层送 1GB 空间。

[这是 CouchDB 的 API](https://docs.couchdb.org/en/stable/intro/api.html)，Cloudant 因为要用 IBM Cloud 的认证，所以有所不同。

[这是一个 Python 的 Client package](https://python-cloudant.readthedocs.io/en/stable/cloudant.html).


## 12. 尾声

IBM Cloud 用了很多 Apache 的东西，Cloud Function 用的也是 Apache Openwhisk。

如果基础云服务都有通用的协议的话，可能才会真的会有全部「上云」的那天吧。

* * *

本文参考了：

[1] https://stackoverflow.com/questions/58698406/aws-lambda-python-so-module-modulenotfounderror-no-module-named-regex-rege

[2] https://github.com/pyenv/pyenv/issues/240
