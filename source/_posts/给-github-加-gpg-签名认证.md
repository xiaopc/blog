---
title: 给 Github 加 GPG 签名认证
date: 2020-02-20 09:42:30
categories:
  - devops
---

先来最终效果：

![](/images/github-gpg.svg)

<!--more-->

## 0. Intro

昨天大家都在看自己能不能领到那笔钱 ╮(╯▽╰)╭

（不知道怎么回事的[点这](https://www.namebase.io/airdrop)）

在添加 SSH key 那里还可以添加 GPG key。那么什么是 GPG，GPG 有什么好处，怎样用 GPG 呢，~~接下来小编...~~

{% blockquote Wikipedia https://zh.wikipedia.org/wiki/PGP %}
PGP（英语：Pretty Good Privacy，中文翻译“优良保密协议”）是一套用于讯息加密、验证的应用程序，采用 IDEA 的散列算法作为加密和验证之用。

PGP 本身是商业应用程序；开源并具有同类功能的工具名为 GnuPG（GPG）。PGP及其同类产品均遵守 OpenPGP 数据加解密标准（RFC 4880）。
{% endblockquote %}

（看到这一段就想到上信息系统安全那个课的时候 →_→）

使用过 Github 的网页 Git 编辑器或是在网页 merge，可能会注意到 commit 就有 Verified 标志，提示 *This commit was created on GitHub.com and signed with a verified signature using GitHub’s key.* 它的公钥是 [https://github.com/web-flow.gpg](https://github.com/web-flow.gpg).

（`username.gpg` 可以看任意用户的 GPG 公钥，`username.keys` 可以看任意用户的 SSH 公钥）

签名的目的是确认「这是你发的内容」，你使用私钥加密消息的 hash，任何有你的公钥的人可以用公钥解密得到这段 hash，从而可以确认内容就是你发的，并且没有被篡改。

它可以用来签名邮件、消息等等，Git 也支持用 GPG 签名 commit。

## 1. 安装？

如果你用的 Windows，安装的是 Git on Windows，那么你很可能已经安装有 GPG 了。

检查一下 `C:\Program Files\Git\usr\bin`（根据 Git 的安装目录调整），里面如果有 `gpg.exe` 那就是已经有了。

如果你用的是 GNU/Linux（→_→），那么很可能也有了。

如果用的是 macOS 得安装一下，[link](https://gpgtools.org/).

在终端输入 `gpg` 如果能找到的话就没问题。（不过可能要注意一下 GPG 版本最好大于 `2`）

## 2. 创建 key pair

对 Windows 用户，最好用 Git Bash（`C:\Program Files\Git\git-bash.exe`）。

```bash
xiaopc@desktop MINGW64 /
$ gpg --gen-key                                # 生成 key
gpg (GnuPG) 2.2.9-unknown; Copyright (C) 2018 Free Software Foundation, Inc.
This is free software: you are free to change and redistribute it.
There is NO WARRANTY, to the extent permitted by law.

Note: Use "gpg --full-generate-key" for a full featured key generation dialog.

GnuPG needs to construct a user ID to identify your key.

Real name: xiaopc                              # 和你的 Git 设置里的名字一样
Email address: xiaopc@users.noreply.github.com # 见后文
You selected this USER-ID:
    "xiaopc <xiaopc@users.noreply.github.com>"

Change (N)ame, (E)mail, or (O)kay/(Q)uit? o    # 确认，然后会提示设置 key 的密码
We need to generate a lot of random bytes. It is a good idea to perform
some other action (type on the keyboard, move the mouse, utilize the
disks) during the prime generation; this gives the random number
generator a better chance to gain enough entropy.
gpg: key 0E745983E6FDC614 marked as ultimately trusted
gpg: revocation certificate stored as ******   # 如果把公钥公告到 WoT 后 key 丢失
public and secret key created and signed.      # 可以用 rev 证书吊销

pub   rsa2048 2020-02-19 [SC] [expires: 2022-02-18]
      **************************************   # 记住这一段 ID
uid                      xiaopc <xiaopc@users.noreply.github.com>
sub   rsa2048 2020-02-19 [E] [expires: 2022-02-18]
```

需要注意，邮件地址必须是绑定 Github 的地址，或是 `username@users.noreply.github.com` 这个 Github 提供的转发地址（隐藏邮件地址），并且邮件地址必须和 Git 设置的地址相同。

```bash
xiaopc@desktop MINGW64 /
$ gpg --list-secret-keys --keyid-format LONG   # 查看本地 key 列表
gpg: checking the trustdb
gpg: marginals needed: 3  completes needed: 1  trust model: pgp
gpg: depth: 0  valid:   2  signed:   0  trust: 0-, 0q, 0n, 0m, 0f, 2u
gpg: next trustdb check due at 2022-02-18
/c/Users/xiaopc/.gnupg/pubring.kbx             #  ~/.gnupg 是存储 keys 的目录
----------------------------------
sec   rsa2048/0E745983E6FDC614 2020-02-19 [SC] [expires: 2022-02-18]
      **************************************   # 和上面的 ID 一样
uid                 [ultimate] xiaopc <xiaopc@users.noreply.github.com>
ssb   rsa2048/**************** 2020-02-19 [E] [expires: 2022-02-18]

```

GPG 的 keys 都是二进制存储的，要把公钥转换成编码的文本文件才能上传：

```bash
xiaopc@desktop MINGW64 /   # 下面 *** 就是上面的 ID
$ gpg --armor --export pub **************************************
-----BEGIN PGP PUBLIC KEY BLOCK-----

# 公钥...
-----END PGP PUBLIC KEY BLOCK-----

```

## 3. 添加公钥到 Github

Settings -> SSH and GPG keys -> New GPG key，将上面命令输出的内容复制过来，确定。

（就不放图了）

## 4. 设置本地 Git

Git 的设置是有层级的。

系统级设置在 `C:\Program Files\Git\mingw64\etc\gitconfig`.（GNU/Linux `/etc/gitconfig`）

本地用户全局设置在 `C:\Users\<用户名>\.gitconfig`.（GNU/Linux `~/.gitconfig`）

单个仓库的设置在仓库目录的 `.git\config`.

在哪级设置都可以，方法是一样的。

```ini
[user]
  name = xiaopc
  email = xiaopc@users.noreply.github.com               ; 必须是 key 对应的地址
  signingkey = **************************************   ; 就是刚才那个 ID
[commit]
  gpgsign = true
[gpg]
  program = "C:\\Program Files\\Git\\usr\\bin\\gpg.exe" ; 如果提示找不到 gpg 位置就添加这个
```

## 5. commit

就是正常的 commit 过程，只是会提示输入 key 的密码。

更多的操作可以看参考链接 1。

* * *

本文参考了：

[1] 用 PGP 保护代码完整性（六）：在 Git 上使用 PGP [https://linux.cn/article-10421-1.html](https://linux.cn/article-10421-1.html)

[2] Sign your git commits with tortoise git on windows [https://dev.to/c33s/sign-your-git-commits-with-tortoise-git-on-windows-3mlf](https://dev.to/c33s/sign-your-git-commits-with-tortoise-git-on-windows-3mlf)

[3] 在 TortoiseGit 中使用 GPG 签名 [https://blog.rathena.cn/post/use-gpg-in-tortoisegit/](https://blog.rathena.cn/post/use-gpg-in-tortoisegit/)
