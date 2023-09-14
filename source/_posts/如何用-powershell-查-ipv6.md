---
title: 如何用 Powershell 查 IPv6
categories:
  - 其他
date: 2023-09-14 09:27:45
---

> 年更 again (今年其他事情比较多，blog 没太多干货分享啦

发现电信下发的 IPv6 连续连接十几天后会失效 (光猫路由 SLAAC 下发的，不知道是哪的问题)，重新连接就好了.

NAS 需要 IPv6 才能连接 Zerotier (没有要公网 IPv4，马上双栈公网就莫得了[1])，最简单的办法是，每天查下 IPv6, 没有就重启.

<!--more-->

## 1. 获取 IPv6 的方式

第一时间大部分人都能想到，`curl` 一下 `ifconfig.io` 或者 `ip.sb` 这样.

```
PS C:\Users\xiaopc> curl ip.sb
StatusCode        : 200
Content           : 240e:****:****
RawContent        : HTTP/1.1 200 OK
......
```

那如果不走 HTTP 呢？通过 EDNS Client Subnet (ECS)[2]，在 DNS 查询中递归解析器将客户端 IP 给到权威服务器，来实现地域化精细解析.

一个例子就是用 DNS 查 IP:

```
PS C:\Users\xiaopc> nslookup -type=TXT o-o.myaddr.l.google.com ns1.google.com
服务器:  ns1.google.com
Address:  2001:4860:4802:32::a

o-o.myaddr.l.google.com text =

        "240e:****:****"
```

## 2. 但是怎么把地址抽出来呢

`nslookup` 不像 `dig`，没有 `+short`，那怎么把地址抽出来呢？

Powershell 名字里的 Power，它 Power 在哪呢？

比如说它的 builtin function:

```
PS C:\Users\xiaopc> Resolve-DnsName -Name o-o.myaddr.l.google.com -Server ns1.google.com -Type TXT

Name                                     Type   TTL   Section    Strings
----                                     ----   ---   -------    -------
o-o.myaddr.l.google.com                  TXT    60    Answer     {240e:****:****}
```

其实这个函数的输出是个对象 (毕竟是微软，肯定是 .NET 了)，当然，Powershell 是强类型的.

(它是个 HashTable)

可以用管道符传给 `Get-Member` 看看有什么成员:

```
PS C:\Users\xiaopc> (Resolve-DnsName -Name o-o.myaddr.l.google.com -Server ns1.google.com -Type TXT) | Get-Member

   TypeName:Microsoft.DnsClient.Commands.DnsRecord_TXT

Name         MemberType    Definition
----         ----------    ----------
QueryType    AliasProperty QueryType = Type
Text         AliasProperty Text = Strings
Equals       Method        bool Equals(System.Object obj)
GetHashCode  Method        int GetHashCode()
GetType      Method        type GetType()
ToString     Method        string ToString()
CharacterSet Property      Microsoft.DnsClient.Commands.DNSCharset CharacterSet {get;set;}
DataLength   Property      uint16 DataLength {get;set;}
Name         Property      string Name {get;set;}
Section      Property      Microsoft.DnsClient.Commands.DNSSection Section {get;set;}
Strings      Property      string[] Strings {get;set;}
TTL          Property      uint32 TTL {get;set;}
Type         Property      Microsoft.DnsClient.Commands.RecordType Type {get;set;}
```

那么就很简单了:

```
PS C:\Users\xiaopc> (Resolve-DnsName -Name o-o.myaddr.l.google.com -Server ns1.google.com -Type TXT)[0].Strings[0]
240e:****:****
```

加上重启的判断：

```
if (-not (Resolve-DnsName -Name o-o.myaddr.l.google.com -Server ns1.google.com -Type TXT)[0].Strings[0].StartsWith("240e")) {
  shutdown /r /t 120 /d 5:20
}
```

注：`5:20` 是关机原因—网络连接丢失(计划外)

## 3. 定时启动

但是弹黑框不好看，不妨借鉴一下一些红方用的持久化方法[3].

```
PS C:\Users\xiaopc> powershell /?
...

-NoExit            运行启动命令后不退出。
-NoProfile         不加载 Windows PowerShell 配置文件。
-NonInteractive    不向用户显示交互式提示。
-WindowStyle       将窗口样式设置为 Normal、Minimized、Maximized 或 Hidden。
-EncodedCommand    接受 base-64 编码字符串版本的命令。
-Command           执行指定的命令(和任何参数)，Command 的值可以为 "-"、字符串或脚本块。
```

那么最终的命令就是：

```
powershell.exe -NonI -c "if (-not (Resolve-DnsName -Name o-o.myaddr.l.google.com -Server ns1.google.com -Type TXT)[0].Strings[0].StartsWith(\"240e\")) { shutdown /r /t 120 /d 5:20 }"
```

把它加到任务计划就行了.

注：在既没有 IPv4 又没有 IPv6 时（aka 断网）脚本会报错退出，这样正好满足需求. 

* * *

[1] https://www.ithome.com/0/716/097.htm

[2] https://developers.google.com/speed/public-dns/docs/ecs

[3] https://www.freebuf.com/articles/system/229209.html