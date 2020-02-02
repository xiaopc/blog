---
title: Home Assistant 连接米家设备
date: 2020-02-02 15:42:30
categories:
  - 其他
---

谁说米家的设备不能接入天猫精灵呢？

<!--more-->

## 0. Intro

（在讨论 nodemcu 中）

冰神：「天猫精灵没得靠谱的温度传感器，决定自己做一个」

窝：「米家空气监测仪啊」

冰神：「可是我不用小爱同学」

## 1. 先批判一番

智能家居品牌都喜欢搞独占这一套（指国内）。

比如，只能接入米家的「米家智能插座 WiFi 版」只要 39 RMB，而 ZigBee 版要 69 RMB（还得再买个网关）才能接入 Homekit。

（虽然 ZigBee 版功能多一点）

用米家 WiFi 芯片的 IoT 设备只能接入米家的云服务，再加上现在国内貌似只有米家的生态链最齐全，感觉已经有米家垄断的影子了。

## 2. 介绍 Home Assistant (hass)

引述文档的一个中文版翻译 [1]：

> Home Assistant 是一款基于 Python 的智能家居开源系统，支持众多品牌的智能家居设备，可以轻松实现设备的语音控制、自动化等。

简单讲，hass 就是一套统一的网关系统，与所有的硬件进行通讯，然后对外提供 Web GUI 和接口。

然后有人在天猫精灵的平台做了 hass 的适配，由于窝没有天猫精灵就不尝试了，[链接在这](https://card.weibo.com/article/m/show/id/2309404214308207761132)。

[目前官方适配的硬件列表在这](https://www.home-assistant.io/integrations/)，当然也可以自己写适配器，就参考官方文档啦。

## 3. 安装 hass

推荐配置是树莓派 4B，树莓派可以直接用基于 Raspbian 的 [Hass.io](https://www.home-assistant.io/hassio/) 镜像。（当然也有一些国情优化版，自行选择 ;D

也有 [Docker 版](https://hub.docker.com/r/homeassistant/home-assistant)，能装到群晖或者软路由什么的上面。

当然，如果是在本地测试的话，要求 Python 3.5.3+。

```bash
pip3 install homeassistant
hass --open-ui
```

默认端口号是 `8123` ，第一次启动是一大堆配置，用户名密码什么的。

（当然，推荐是用 venv）

## 4. 米家相关

连接 ZigBee 设备是比较简单的（[见这](https://home-assistant.cc/component/xiaomi/zigbee/)），而直接连接云服务的 WiFi 设备就比较头疼了。

这类设备的接口被叫做 `miIO`，走这个接口的设备[见此](https://github.com/rytilahti/python-miio)。（想研究协议本身可以看[这个](https://github.com/OpenMiHome/mihome-binary-protocol/blob/master/doc/PROTOCOL.md)）

与每个使用 `miIO` 的设备通信都需要一个 token，目前只能通过提取 Android 米家 5.0 至 [5.0.19](https://mi-home.en.uptodown.com/android/download/1690042) 版本的数据库文件 `miio2.db` 才能获取到。（4.x 实测已经不能显示此类设备）

（注意，这个 token 在重置网络后会失效）

有 root 就很简单，直接打开 `/data/data/com.xiaomi.smarthome/databases/miio2.db`，里面 `devicereord` 表就有设备对应的 token。

没有 root 的话就只能用应用备份把数据库备份出来，再解包备份文件。

通过 adb 备份（不是所有的 ROM 都可以，窝用 Smartisan M1 就没法备份，当然用模拟器可能更简单）：

```bash
adb backup -noapk com.xiaomi.smarthome -f backup.ab
```

然后用 `adbextractor`（[sourceforge](https://sourceforge.net/projects/adbextractor/)） 提取：
```bash
java -jar ../android-backup-extractor/abe.jar unpack backup.ab backup.tar ""
```

SQLite 数据库有很多在线查看的工具，比如 [https://inloop.github.io/sqlite-viewer/](https://inloop.github.io/sqlite-viewer/)。

此外，配置还需要设备的 IP，看下路由表就有，刚才那张表的 `localIP` 列也有。要确认 hass 运行的设备能连接上这个 IP。

## 5. 配置

hass 所有的配置都在配置目录的 `configuration.yaml` 里，在支持的设备列表里有配置说明，在参考链接 [2] 也有（这个翻译版有的地方有点旧了，有官方适配的还是以官方文档为准）。

这里以米家空气检测仪为例，文档页面[在此](https://www.home-assistant.io/integrations/air_quality.xiaomi_miio/)。

直接在 `configuration.yaml` 里添加：

```yaml
air_quality:
  - platform: xiaomi_miio
    host: IP_ADDRESS
    token: YOUR_TOKEN
    name: Mijia Air Quality Monitor
```

注意 [yaml 的语法](https://learnxinyminutes.com/docs/zh-cn/yaml-cn/)（缩进），以及根节点（比如上面就是 `air_quality`）不能有重复的，要写成一个列表。

在第一次运行的时候，可能会注意到在 Web 界面上就能添加一些设备，但是不知道为什么那个入口没有米家（？？？）；然后 yaml 也有 `import`，可以自己去拆分成几个文件；再然后 Web 界面等等的配置也是在 `configuration.yaml` 里面改，具体见文档。

## 6. 尾声

先放个图吧。

![](/images/home-assistant.jpg)

如果仔细看图可以发现，虽然能获取到数据，但是显示还是有点小问题（$\mathrm{CO_{2}e}$ 这个值是因为窝关了这项检测）。此外，米家空气检测仪还有温湿度检测，但是官方的适配就强行把它归类到空气质量类 sensor，不显示温湿度...（`python-miio` 库[明明就有输出](https://github.com/rytilahti/python-miio/blob/master/miio/airqualitymonitor.py)，当然咯也可以自己写适配器）

窝觉得，这个项目迟早要重构（

* * *

本文参考了：

[1] Home Assistant 中文文档 [https://home-assistant.cc/](https://home-assistant.cc/)

[2] WiFi - Home Assistant 中文文档 [https://home-assistant.cc/component/xiaomi/wifi/](https://home-assistant.cc/component/xiaomi/wifi/)
