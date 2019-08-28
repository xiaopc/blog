---
title: Flarum 0.1.0-beta8.1 中文化
date: 2019-02-15 19:47:12
categories:
  - 后端
---

## 中文语言包

[Flarum 中文語言包](https://discuss.flarum.org/d/17954-chinese-language-pack-for-beta8)

```bash
composer require csineneo/lang-simplified-chinese
```

<!--more-->

## 中文搜索

[jjandxa/flarum-ext-chinese-search](https://github.com/jjandxa/flarum-ext-chinese-search)

昨天作者还没合并 `branchzero/master`，得在 `composer.json` 里改源。
现在不用了。

1. 先安装服务端[官方教程](http://www.xunsearch.com/doc/php/guide/start.installation)
```bash
wget http://www.xunsearch.com/download/xunsearch-full-latest.tar.bz2
tar -xjf xunsearch-full-latest.tar.bz2
sh xunsearch-full-1.3.0/setup.sh
# $prefix 是安装目录
$prefix/bin/xs-ctl.sh restart
```

2. 安装插件
```bash
composer require jjandxa/flarum-ext-chinese-search
```

3. 得把 Flarum 文件夹的权限给 `www`
```bash
sudo chown -R www-data:www-data flarum/
```

4. 测试
```bash
# 测试搜索结果
./vendor/bin/xs search -p ./vendor/jjandxa/flarum-ext-chinese-search/app.ini -q 关键词
# 查看 xunsearch 服务端信息
./vendor/bin/xs index -p ./vendor/jjandxa/flarum-ext-chinese-search/app.ini --info
```

## 中文用户名注册

不建议加，一是搜索用户名时有点奇怪（有点字搜不到？），第二个原因见下一节。

修改 `vendor/flarum/core/src/User/UserValidator.php` 第 49 行，在 `regex:/^[` 后加 `\x00-\xff`

（奇怪为什么不能用 `\x{4e00}-\x{9fa5}` `\u4e00-\u9fa5` `\p{Han}`）

## 中文用户名被 at

[Mentions插件对中文用户名无法正确进行格式化](http://discuss.flarum.org.cn/d/342)

> update 2019/2/28

还没*完全*解决...

同样的方法改了 `vendor/flarum/mentions/src/Listener/FormatPostMentions.php` `vendor/flarum/mentions/src/Listener/FormatUserMentions.php`

还改了 `FormatUserMentions.php` 93 行，给 `$tag->getAttribute('username')` 外面包了 `rawurlencode()`

清掉缓存以后，帖子 mention 显示正常。但是新建帖子显示不正常。

（但是可以被 at 到）

## 去掉帖子地址后面的摘要（不支持中文）

还没完全解决...

去掉生成的 HTML 里的帖子地址：修改 `vendor/flarum/core/views/frontend/content/index.blade.php`，删掉第 10 行 `'id' => $discussion->id` 后的内容。

去掉 js 的路由：修改 `vendor/flarum/core/js/src/forum/routes.js`, 把第 39 行改为 `id: discussion.id(),`。

然鹅要 `npm build` 才能生成 dist，所以就没搞了。

其实不改还是可以打开...
