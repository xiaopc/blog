---
title: 持续集成与 Travis CI 入门实践
date: 2018-04-28 10:11:21
categories:
  - devops
---
> 按：作为一个 Description 是 "Dev+Ops" 的博客，竟然从来没写过 DevOps 相关的内容，实在...

<!--more-->

## 持续集成 Continous Integration

{% codeblock %}
+------+  +-------+  +-----------+  +------+  +---------+  +--------+
| code |->| build |->| integrate |->| test |->| deliver |->| deploy |
+------+  +-------+  +-----------+  +------+  +---------+  +--------+
<------- Continous Integration ------------>
<------- Continous Delivery ---------------------------->
<------- Continous Deployment -------------------------------------->
{% endcodeblock %}

持续集成是指软件个人研发的部分向软件整体部分交付，频繁进行集成，以便更快地发现其中的错误，以及防止分支大幅偏离主干。持续集成的目的，是让产品可以快速迭代，同时还能保持高质量。它的核心措施是，代码集成到主干之前，必须通过自动化测试。只要有一个测试用例失败，就不能集成。

~~而不是为了那个 ![Build Status](https://travis-ci.org/xiaopc/fyRepair-xcx.svg?branch=master) 的图标 xd~~

## Travis CI

Travis CI 为 Github 上面的项目提供持续集成服务（Public 免费，私有仓库收费），只要有新的代码，就会自动抓取，提供运行环境进行测试和构建，还能设置部署到服务器。

Travis CI 几乎支持所有流行语言（当然 VC++ 这种目前还是不支持），可以和 Coveralls 等测试统计工具配合使用，可以和 Docker 等配合部署。

## Quick Start

1. 登录 [Travis CI](https://travis-ci.org/)

2. 仓库同步完成后，在个人页面里，给需要的项目打钩

3. 在项目根目录添加`.travis.yml` 

{% codeblock lang:yaml %}
# 这是一个 JS 的例子，配置文件写法参照文档
# https://docs.travis-ci.com/

language: node_js
cache:
  # 可以配置缓存加快 build 速度
  directories:
  - node_modules
node_js:
  - "node"
script:
  # 这里是构建命令，还有其他钩子可以设置
  - npm run build
# 部署信息，这里就不加了
# deploy:
#   provider: releases
#   api_key:

# 文档：https://docs.travis-ci.com/user/customizing-the-build/

{% endcodeblock %}

4. push

5. 在 Travis CI 的状态页面查看构建状态（并获取图标地址）

## 有意思的玩法

1. [使用 Travis 自动部署博客到 Github Pages](http://uchuhimo.me/2017/04/15/continuous-deployment-blog-to-github-pages-with-travis/)

2. [使用 Travis CI 和 Docker 自动构建 LaTeX 简历](https://yumminhuang.github.io/post/autobuildresume/)

-----

本文参考了

[1] 谈谈持续集成，持续交付，持续部署之间的区别 http://blog.flow.ci/cicd_difference/

[2] 什么是devops，基于Gitlab从零开始搭建自己的持续集成流水线(Pipeline) https://blog.csdn.net/Chengzi_comm/article/details/78778284

[3] 持续集成服务 Travis CI 教程 http://www.ruanyifeng.com/blog/2017/12/travis_ci_tutorial.html

[4] 如何简单入门使用Travis-CI持续集成 https://github.com/nukc/how-to-use-travis-ci
