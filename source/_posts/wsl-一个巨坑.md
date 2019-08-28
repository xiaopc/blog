---
title: WSL 一个巨坑
date: 2019-01-28 16:13:03
categories:
  - 其他
---

<div class="tip">
  不要在 Windows 环境下动 WSL 的文件！
  
  不要在 WSL 下往 /mnt/* 里写 Windows 文件系统不支持的东西！
</div>

<!--more-->

事情是这样的

本来装了 Windows + Ubuntu 双系统，这个博客的 hexo 目录在 Ubuntu 下

然后因为空间紧张，把双系统的 Ubuntu 删了

把 hexo 放到了 WSL 下管理（但是文件是放在 Windows 下的盘里）

今天发现 `_source/posts` 目录打不开了，「文件或目录损坏且无法读取」

chkdsk 给出的提示是 `<textarea>-高度自适应几种方法总结.md` 文件名非法

重启修复，Windows 就给删了...

然后在 `found.000` 目录找到了 `chk` 文件，才把文件恢复了

嘶......

------

[1] win10 现在有 WSL 了，但是为什么不能在上面做开发？ [https://www.v2ex.com/t/530523](https://www.v2ex.com/t/530523)