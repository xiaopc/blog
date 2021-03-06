---
title: '[转] getchar() 和 EOF 总结'
id: 22
categories:
  - c-cpp
date: 2016-07-22 09:24:53
---

按：原书没有提到这个问题，可能让读者很困惑（比如我( ×ω× ) ）

<!--more-->

* * *

大师级经典的著作，要字斟句酌的去读，去理解。以前在看K&R的The C Programming Language (Second Edition) 第1.5节的字符输入/输出，被getchar()和EOF所迷惑了。可能主要还是由于没有搞清楚getchar()的工作原理和EOF的用法。因此,感觉很有必要总结一下，不然，很多琐碎的知识点长时间过后就会淡忘的，只有写下来才是最好的方法。

其实，getchar()最典型的程序也就几行代码而已。本人所用的环境是DebianGNU/Linux，在其他系统下也一样。

## getchar的两点总结：

### getchar是以行为单位进行存取的。

当用getchar进行输入时，如果输入的第一个字符为有效字符(即输入是文件结束符EOF，Windows下为组合键Ctrl+Z， Unix/Linux下为组合键Ctrl+D)，那么只有当最后一个输入字符为换行符'/n'(也可以是文件结束符EOF，EOF将在后面讨论)时， getchar才会停止执行，整个程序将会往下执行。譬如下面程序段：
{% codeblock lang:c %}
while((c = getchar()) != EOF){
    putchar(c);
{% endcodeblock %}
执行程序，输入：abc，然后回车。则程序就会去执行puchar(c)，然后输出abc，这个地方不要忘了，系统输出的还有一个回车。然后可以继续输入，再次遇到换行符的时候，程序又会把那一行的输入的字符输出在终端上。

对于getchar，肯定很多初学的朋友会问，getchar不是以字符为单位读取的吗？那么，既然我输入了第一个字符a，肯定满足while循环(c = getchar()) != EOF的条件阿，那么应该执行putchar(c)在终端输出一个字符a。不错，我在用getchar的时候也是一直这么想的，但是程序就偏偏不着样执行，而是必需读到一个换行符或者文件结束符EOF才进行一次输出。

对这个问题的一个解释是，在大师编写C的时候，当时并没有所谓终端输入的概念，所有的输入实际上都是按照文件进行读取的，文件中一般都是以行为单位的。因此，只有遇到换行符，那么程序会认为输入结束，然后采取执行程序的其他部分。同时，输入是按照文件的方式存取的，那么要结束一个文件的输入就需用到EOF (Enf Of File). 这也就是为什么getchar结束输入退出时要用EOF的原因。

### getchar()的返回值一般情况下是字符，但也可能是负值，即返回EOF。

这里要强调的一点就是，getchar函数通常返回终端所输入的字符，这些字符系统中对应的ASCII值都是非负的。因此，很多时候，我们会写这样的两行代码：
{% codeblock lang:c %}
char c;
c = getchar();
{% endcodeblock %}
这样就很有可能出现问题。因为getchar函数除了返回终端输入的字符外，在遇到Ctrl+D(Linux下)即文件结束符EOF时，getchar ()的返回EOF，这个EOF在函数库里一般定义为-1。因此，在这种情况下，getchar函数返回一个负值，把一个负值赋给一个char型的变量是不正确的。为了能够让所定义的变量能够包含getchar函数返回的所有可能的值，正确的定义方法如下(K&R C中特别提到了这个问题)：
{% codeblock lang:c %}
int c;
c = getchar();
{% endcodeblock %}

## EOF的两点总结(主要指普通终端中的EOF)

### EOF作为文件结束符时的情况

EOF虽然是文件结束符，但并不是在任何情况下输入Ctrl+D(Windows下Ctrl+Z)都能够实现文件结束的功能，只有在下列的条件下，才作为文件结束符：
(1)遇到getcahr函数执行时，要输入第一个字符时就直接输入Ctrl+D，就可以跳出getchar(),去执行程序的其他部分；
(2)在前面输入的字符为换行符时，接着输入Ctrl+D；
(3)在前面有字符输入且不为换行符时，要连着输入两次Ctrl+D，这时第二次输入的Ctrl+D起到文件结束符的功能，至于第一次的Ctrl+D的作用将在下面介绍。
其实，这三种情况都可以总结为只有在getchar()提示新的一次输入时，直接输入Ctrl+D才相当于文件结束符。

### EOF作为行结束符时的情况，这时候输入Ctrl+D并不能结束getchar(),而只能引发getchar()提示下一轮的输入。

这种情况主要是在进行getchar()新的一行输入时，当输入了若干字符(不能包含换行符)之后，直接输入Ctrl+D，此时的Ctrl+D并不是文件结束符，而只是相当于换行符的功能，即结束当前的输入。以上面的代码段为例，如果执行时输入abc，然后Ctrl+D，程序输出结果为：
{% codeblock %}
abcabc
{% endcodeblock %}
注意:第一组abc为从终端输入的，然后输入Ctrl+D，就输出第二组abc，同时光标停在第二组字符的c后面,然后可以进行新一次的输入。这时如果再次输入Ctrl+D，则起到了文件结束符的作用，结束getchar（）。
如果输入abc之后，然后回车，输入换行符的话，则终端显示为：
{% codeblock %}
abc       //第一行，带回车
abc       //第二行
          //第三行
{% endcodeblock %}
其中第一行为终端输入，第二行为终端输出，光标停在了第三行处，等待新一次的终端输入。
从这里也可以看出Ctrl+D和换行符分别作为行结束符时，输出的不同结果。
EOF的作用也可以总结为：当终端有字符输入时，Ctrl+D产生的EOF相当于结束本行的输入，将引起getchar()新一轮的输入；当终端没有字符输入或者可以说当getchar()读取新的一次输入时，输入Ctrl+D，此时产生的EOF相当于文件结束符，程序将结束getchar()的执行。
【补充】本文第二部分中关于EOF的总结部分，适用于终端驱动处于一次一行的模式下。也就是虽然getchar()和putchar()确实是按照每次一个字符 进行的。但是终端驱动处于一次一行的模式，它的输入只有到“/n”或者EOF时才结束，因此，终端上得到的输出也都是按行的。
如果要实现终端在读一个字符就结束输入的话，下面的程序是一种实现的方法(参考《C专家编程》,略有改动)：
{% codeblock lang:c %}
#include <stdio.h>
#include <stdlib.h>
int main(void)
{
    int c;
    /* 终端驱动处于普通的一次一行模式 */
    system("stty codeblock");

    /* 现在的终端驱动处于一次一个字符模式 */
     c = getchar();
    putchar();

    /* 终端驱动处又回到一次一行模式 */
     system("stty cooked");

    return 0;
}
{% endcodeblock %}
编译运行该程序，则当如入一个字符时，直接出处一个字符，然后程序结束。
由此可见，由于终端驱动的模式不同，造成了getchar()输入结束的条件不一样。普通模式下需要回车或者EOF，而在一次一个字符的模式下，则输入一个字符之后就结束了。

* * *

原文链接（失效）: [http://blog.chinaunix.net/u1/53811/showart_421385.html](http://blog.chinaunix.net/u1/53811/showart_421385.html)

二转 : [http://blog.csdn.net/ithomer/article/details/5669762](http://blog.csdn.net/ithomer/article/details/5669762)
