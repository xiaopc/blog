---
title: Flarum 0.1.0-beta8.1 魔改之邮件
date: 2019-03-11 12:23:37
categories:
  - 后端
---

## 取消注册邮件验证

```bash
composer require isaced/flarum-ext-email-verification-switch
```

<!--more-->

## 国内邮件推送平台？

暂时没发现有支持的插件。

## 将邮件格式由纯文本改为 HTML

[修改flarum能发送html邮件](http://discuss.flarum.org.cn/d/862)

1. 将 `vendor/flarum/core/src/Api/Controller/SendConfirmationEmailController.php` 90 行的

```php
$this->mailer->raw($body, // 其后省略
```

改为

```php
$this->mailer->send(['html' => $body], [], 
```

2. 将 `vendor/illuminate/mail/Mailer.php` 213 行起的

```php
$data['message'] = $message = $this->createMessage();
$this->addContent($message, $view, $plain, $raw, $data);
```

改为

```php
$message = $this->createMessage();
$this->addContent($message, $view, $plain, $raw, $data);
$data['message'] = $message;
```

3. 还是 `Mailer.php`，将 315 行（左右）的 `$message->$method($raw, 'text/plain')` 改为 `$message->$method($raw, 'text/html')`

