---
title: Github Actions 测试 - 自动部署 Hexo
date: 2019-08-29 08:38:30
categories:
  - devops
---

终于，Github 自己出 CI/CD 工具了，Whoa~

![](/images/github-actions.png)

鉴于 Gitlab 等早就有自动构建工具了，Github 已经晚了许多，那 Github Actions 能打得过吗？来上手试一下。

<!--more-->

## 0. 为什么是自动部署 Hexo

个人项目很少会用到 CI/CD 工具，那几乎唯一能用到自动部署的就是静态博客了。

而且折腾 Blog 是咱最喜欢的娱乐活动之一...~~（写 Blog 不是）~~

## 1. Get started

先在 [GitHub Actions](https://github.com/features/actions) 申请测试，然后等邮件通知。

咱等了不到一周的样子就收到了开通邮件。

当然，如果是体验 CI 的话，也可以选择其他的工具，比如 Travis CI。
这是之前写的介绍：[持续集成与 Travis CI 入门实践](https://xiaopc.org/2018/04/28/%E6%8C%81%E7%BB%AD%E9%9B%86%E6%88%90%E4%B8%8E-travis-ci-%E5%85%A5%E9%97%A8%E5%AE%9E%E8%B7%B5/)，这篇结尾有个链接介绍如何部署 Hexo 的，可以参考。

## 2. 配置 Hexo

如何安装及配置 Hexo 不是本文重点，请自行查询[官方文档](https://hexo.io/zh-cn/docs/)。

建议先在本地跑通部署到 Github Pages 以后再继续。

配置完成后，把 `_config.yml` 里 `deploy` 的 repo 地址换成 SSH 地址（仓库页面 **Clone and Download - Use SSH** 里的地址），以便后面用密钥 push 到仓库。

## 3. 配置仓库及 key

因为用户名 `username.github.io` 的 Github Pages 仓库只能部署 master 分支，而 Actions 的配置文件需要放在 master 分支（仅为个人猜测，因为放在其他分支出现了问题）。
所以需要再开一个仓库，放本地的源代码以及配置 Actions。

新建一个仓库，先不需要初始化。在本地生成一个 key：

```bash
ssh-keygen -t rsa -b 4096 -C "xiaopc@users.noreply.github.com" -f ~/.ssh/github-actions-deploy
```

（也可以生成其他种类的 key，如果用上面的命令，需要修改一下用户名）

在新仓库的 **Settings -> Secrets** 里添加刚刚生成的私钥，名称为 `ACTION_DEPLOY_KEY`。

然后在 Github Pages 的仓库，**Settings -> Deploy keys** 添加刚刚生成的公钥，名称随意，但要勾选 **Allow write access**。

## 4. 给源码仓库添加 Actions 配置

可以在网页上 **Actions** 里编辑配置文件，也可以直接在本地目录添加直接 commit。

网页上可以看到，Github 提供了很多的模板：

![](/images/github-actions-template.png)

对于大部分应用的自动测试构建发布是足够的了，这个相比 Travis CI 降低了一点点门槛。

此外，Actions 还可以将动作打包发布到 [Marketplace](https://github.com/marketplace?type=actions)，这是 Actions 的一个亮点，大大增加了复用能力。

不过要部署 Hexo，现在还没有打包的动作，需要自己写。

如果在网页编辑配置文件的话，选择 `Blank workflow`。
如果是在本地目录提交配置文件的话，将配置文件存至 `.github/workflows/*随便起名*.yml`。

```yaml
name: Build and Update Github Pages

on: push

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v1
      
      - name: Use Node.js 10.x
        uses: actions/setup-node@v1
        with:
          node-version: "10.x"

      - name: Setup Hexo env
        env:
          ACTION_DEPLOY_KEY: ${{ secrets.ACTION_DEPLOY_KEY }}
        run: |
          # set up private key for deploy
          mkdir -p ~/.ssh/
          echo "$ACTION_DEPLOY_KEY" | tr -d '\r' > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan github.com >> ~/.ssh/known_hosts
          # set git infomation
          git config --global user.name 'xiaopc'
          git config --global user.email 'xiaopc@users.noreply.github.com'
          # install dependencies
          npm i -g hexo-cli
          npm i
          # install pandoc
          curl -s -L https://github.com/jgm/pandoc/releases/download/2.7.3/pandoc-2.7.3-linux.tar.gz | tar xvzf - -C $RUNNER_TOOL_CACHE/

      - name: Deploy
        run: |
          # add pandoc to PATH
          export PATH="$PATH:$RUNNER_TOOL_CACHE/pandoc-2.7.3/bin"
          # publish
          hexo generate && hexo deploy
```

对这个配置文件做几点说明：

0. Actions 在早期测试时用的是 HCL 格式，而现在使用 YAML 配置，HCL 格式配置文件已被废弃。YAML 格式需要严格按照缩进。

1. `on` 标注什么事件会触发这个 workflow，可以指定 branches，详情参考[文档](https://help.github.com/en/articles/events-that-trigger-workflows)。

2. `runs-on` 设置运行平台，目前有 Windows、Ubuntu、macOS，见[文档](https://help.github.com/en/articles/virtual-environments-for-github-actions)。

3. `uses` 是使用打包好的 action，可以通过 `with` 传参数。官方提供了一些 Git 基本操作和环境安装的包，也可以使用 Docker。

4. `env` 可以设置这一步的环境变量，这一步设置的变量不会继承到下一步。刚才设置的私钥可以通过 `${{ secrets.key名 }}` 获取到，具体见[文档](https://help.github.com/en/articles/virtual-environments-for-github-actions)。另外直接将密钥 echo 出来会被打码 :)

5. 在网页上保存私钥很可能会把 key 存成 CR-LF 换行模式的，而私钥文件要求 LF 模式，要用 `tr -d '\r'` 去掉回车符。（在这卡了几个小时(ノへ￣、)）[3]

6. Git 配置请更改为自己的。

7. 由于咱用了 hexo-renderer-pandoc 引擎渲染 Markdown（LaTeX 公式支持更好），要装 pandoc。
但是没有 root 权限，只能手动装在其他目录。
官方的 toolkit 提供了一个缓存下载内容的工具 [actions/tool-cache](https://github.com/actions/toolkit/tree/master/packages/tool-cache)，但是它仅在一个 workflow 里作用，so... 

8. 上面说的那个工具下载保存目录是 `$RUNNER_TOOL_CACHE`，这个环境变量没有在文档里，目前值为 `/opt/hostedtoolcache`。

## 5. 开始构建

配置好了，commit & push 后在网页查看 build 状态：

![](/images/github-actions-status.png)

## 6. 尾声

和 Travis CI 相比，Actions 提供的平台更多，扩展性更强，但是缺少像 build cache 这些功能（build 的时候每次都要重新装依赖）。

虽然和它声称的 **word-class CI/CD** 还有一些距离，但是 Actions 已经比目前免费的工具高到不知道哪里了。

再加上它与 Github 的深度集成，以及 marketplace 仓库，可以发挥 CI/CD 的更多潜能。

对了，Actions 公开仓库免费，私仓按运行时间计费。

* * *

本文参考了：

[1] 通过 GitHub Actions 自动部署 Hexo [https://gythialy.github.io/deploy-hexo-to-github-pages-via-github-actions/](https://gythialy.github.io/deploy-hexo-to-github-pages-via-github-actions/)

[2] Deploying Hugo With Github Actions [https://cupfullofcode.com/blog/2018/12/21/deploying-hugo-with-github-actions/](https://cupfullofcode.com/blog/2018/12/21/deploying-hugo-with-github-actions/)

[3] .gitlab.ci.yml for SSH with private key [https://gist.github.com/yannhowe/5ab1501156bd84c8ac261e2c17b8e3e0](https://gist.github.com/yannhowe/5ab1501156bd84c8ac261e2c17b8e3e0)
