---
title: Python 获取控制台输出二三事
date: 2019-02-20 10:56:57
categories:
  - 后端
---

事情从这里开始。

需要用 Python 调用 [annie](https://github.com/iawia002/annie) 并获取下载进度。

<!--more-->

这还不简单吗? 直接就写出了代码 1：

## readline

```python
import shlex
import subprocess

if __name__ == '__main__':
    shell_cmd = './annie -i av42398581'
    cmd = shlex.split(shell_cmd)

    p = subprocess.Popen(cmd, shell=False, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    while p.poll() is None:
        print("output: %s" % p.stdout.readline())
    print('Subprogram exit with code %d' % p.returncode )
```

然而结果是：

```
output: b'\n'
Subprogram exit with code 0
```

但其他命令都很正常，比如 wget, ping。

然后发现 annie 这里是多行一起输出再刷新缓冲区的，然后就改成了代码 2：

## iter

```python
import shlex
import subprocess

if __name__ == '__main__':
    shell_cmd = './annie -i av42472579'
    cmd = shlex.split(shell_cmd)

    p = subprocess.Popen(cmd, shell=False, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    while p.poll() is None:
        for line in iter(p.stdout.readline, b''):
            print("output: %s" % line.rstrip().decode('utf8'))
```

`iter()` 函数用来生成迭代器，传入有第二个参数就表示第一个参数是可调用的。

通过这个生成的迭代器持续执行 `readline()` 直至没有输出。

现在输出看起来没问题了，吧？

且慢。annie 的 `-i` 参数只解析不下载，那去掉 `-i` 参数呢？

```
output:  
output:  Site:      哔哩哔哩 bilibili.com 
output:  Title:     【官方双语】 一万刀的CPU 能修好吗？#linus谈科技
output:  Type:      video
output:  Streams:   # All available quality
output:      [80]  -------------------
output:      Quality:         高清 1080P
output:      Size:            204.75 MiB (214691421 Bytes) 
output:      # download with: annie -f 80 ...
output:
```

然后就卡住了。

发现 annie 的进度条是用 `\r` 实现的，而 `readline()` 是按 `\n` 分割的。

但是除非下载完成，annie 不会输出 `\n`... 所以 `readline()` 会一直读输出流的数据。

那就考虑用 `read()` 实现自定义 `readline()`?

于是就有了代码 3：

## yield

```python
import shlex
import subprocess
import re

def customized_readline(stream, delimiter, buffersize=1):
    lines = [b'']
    for data in iter(lambda: stream.read(buffersize), b''):
        lines = re.split(delimiter, lines[-1] + data)
        for line in lines[:-1]:
            yield line
    yield lines[-1]

if __name__ == '__main__':
    shell_cmd = './annie av42472579'
    cmd = shlex.split(shell_cmd)

    p = subprocess.Popen(cmd, shell=False, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, bufsize=1)
    while p.poll() is None:
        for line in customized_readline(p.stdout, b'\n|\r'):
            print("output: %s" % line.decode('utf8'))
```

这里涉及到几个点：

1. 因为 `read()` 要加大小作为参数，如果直接 `stream.read(buffersize)` 就变成函数求值然后传参了。
   所以这里需要用 lambda 表达式，返回 `callable` 对象。（使用偏函数也可 `from functools import partial`）

2. 这里用 `re.split()` 是因为要匹配多种分隔符，如果只用一种就不需 `re`。

3. `customized_readline` 返回的是个生成器。简单来讲，每次迭代调用时都会从上次 `yield` 后继续。
   `lines` 存储着没有一次输出的剩余行。

但是呢，如果 `delimiter` 和 `buffersize` 设置不好的话，可能会出现：

```
Traceback (most recent call last):
  File "b.py", line 20, in <module>
    print("output: %s" % line.decode('utf8'))
UnicodeDecodeError: 'utf-8' codec can't decode bytes in position 98-99: unexpected end of data
```

很明显是从 `bytes` 解码成 UTF-8 时出错了。

为什么呢？UTF-8 是一种变长编码，ASCII 字符是 1 字节编码，而汉字是 3 字节编码，就出现了被截断的汉字。

那怎么办呢？干脆自己做 decode 吧，于是就有了代码 4：

## iterdecode

```python
import shlex
import subprocess
import re
from codecs import iterdecode

def iter_unicode_chunks(byte_stream, encoding='utf-8'):
    binary_chunks = iter(lambda: byte_stream.read(1), b'')
    for unicode_chunk in iterdecode(binary_chunks, encoding):
        yield unicode_chunk

def customized_readline(iter_chunk_stream, delimiter):
    lines = ['']
    for data in iter_chunk_stream:
        lines = re.split(delimiter, lines[-1] + data)
        for line in lines[:-1]:
            yield line
    yield lines[-1]

if __name__ == '__main__':
    shell_cmd = './annie av42472579'
    cmd = shlex.split(shell_cmd)

    p = subprocess.Popen(cmd, shell=False, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, bufsize=1)
    while p.poll() is None:
        for line in customized_readline(iter_unicode_chunks(p.stdout), '\r|\n'):
            print("output: %s" % line)
```

这里用了 `codecs.iterdecode`，它也是生成器，每次喂进去一个 byte，直到能被解析就 yield 一个编码字符。

看起来解决了？

当重新看 subprocess 的文档时，突然发现了...

## universal_newlines

subprocess.Popen 有个参数 `universal_newlines`。

该参数为 True 时 `stdout` 和 `stderr` 会被视为文本，而且会将所有换行符转为 `\n`。

转了一大圈然后回到原点...所以最终代码 5：

```python
import shlex
import subprocess

if __name__ == '__main__':
    shell_cmd = './annie av42398581'
    cmd = shlex.split(shell_cmd)

    p = subprocess.Popen(cmd, shell=False, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, universal_newlines=True)
    while p.poll() is None:
        for line in iter(p.stdout.readline, b''):
            print("output: %s" % line.rstrip())
    print('Subprogram exit with code %d' % p.returncode )
```

完。

-----

本文参考了：

[1] Python获取命令实时输出-原样彩色输出并返回输出结果 https://blog.csdn.net/tp7309/article/details/79392313

[2] Using readline with a new delimiter of line ? https://bytes.com/topic/python/answers/26125-using-readline-new-delimiter-line

[3] UTF-8 - 维基百科，自由的百科全书 https://zh.wikipedia.org/wiki/UTF-8

[4] Working with unicode streams in Python | And then it crashed https://blog.etianen.com/blog/2013/10/05/python-unicode-streams/

[5] Python模块整理(三)：子进程模块subprocess http://blog.51cto.com/ipseek/807513
