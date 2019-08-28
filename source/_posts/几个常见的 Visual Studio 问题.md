---
title: 几个常见的 Visual Studio 问题
id: 90
categories:
  - c-cpp
date: 2016-09-24 12:25:30
permalink: '几个常见的-visual-studio-问题'
---

课业繁重，没太多时间水 Blog 哈...... 记录下几个常见的问题，以供参考。

<!--more-->

## fatal error LNK1123

这个问题大多数出现在在 64 位系统安装 32 位版 VS ......

Solve 1: （当次有效）右键解决方案，“属性&gt;配置属性&gt;清单工具&gt;输入和输出&gt;嵌入清单"改为“否”

Solve 2: 查找系统中的 cvtres.exe 文件，将旧版文件用新版替换

## 没有 "Press any key to continue..."

吐槽：其实本来就不应该有这个......

Solve 1: 加：
{% codeblock lang:c %}
system("pause");
{% endcodeblock %}
当然，这会造成 warning ... 这方法也不好，具体见 [3] [4]

Sovle 2: 工程设 Console 子系统：用文本编辑器打开 .vcxproj，在 &lt;/Project&gt; 前加
{% codeblock lang:xml %}
<ItemDefinitionGroup>
    <Link>
       <SubSystem>Console</SubSystem>
    </Link>
</ItemDefinitionGroup>
{% endcodeblock %}

* * *

本文参考了：

[1] 我所遇到的C++连接问题汇总 [http://www.cnblogs.com/qiaozhoulin/p/5287437.html](http://www.cnblogs.com/qiaozhoulin/p/5287437.html)

[2] vs2010运行没有“press any key to continue...” [http://blog.csdn.net/tracyliang223/article/details/21881101](http://blog.csdn.net/tracyliang223/article/details/21881101)

[3] 拜托不要再用system("pause")和void main了 [http://bbs.csdn.net/topics/390231844](http://bbs.csdn.net/topics/390231844)

[4] C system("PAUSE") 小议 [http://www.cnblogs.com/haimingwey/archive/2011/11/15/2249921.html](http://www.cnblogs.com/haimingwey/archive/2011/11/15/2249921.html)
