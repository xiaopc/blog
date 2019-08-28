---
title: '[转] 你应该知道的一些事情——CSS权重'
id: 107
categories:
  - 前端
date: 2016-12-08 21:49:59
permalink: '转-你应该知道的一些事情-css权重'
---

> xiaopc 按：忙啊......所以目前技术文章只靠转载......放假了再说......本文部分转载原文，去掉了一些对基础概念的解释。
> 本文由[99](http://99jty.com/?page_id=365)根据[Vitaly Friedman](http://coding.smashingmagazine.com/author/vitaly-friedman/?rel=author "Posts by Vitaly Friedman")的《[CSS Specificity: Things You Should Know ](http://coding.smashingmagazine.com/2007/07/27/CSS-specificity-things-you-should-know)》所译，整个译文带有我们自己的理解与思想，如果译得不好或不对之处还请同行朋友指点。如需转载此译文，需注明英文出处：[http://coding.smashingmagazine.com/2007/07/27/CSS-specificity-things-you-should-know](http://coding.smashingmagazine.com/2007/07/27/CSS-specificity-things-you-should-know/)，以及作者相关信息
>
>
> 作者：[Vitaly Friedman](http://coding.smashingmagazine.com/author/vitaly-friedman/?rel=author "Posts by Vitaly Friedman")
>
>
> 译者：[99](http://99jty.com/?page_id=365)

<!--more-->

除了浮动之外，CSS权重问题是你要了解的，最复杂的一个概念之一。CSS每条规则权重的不同，是你所期望的效果，没有通过CSS规则在元素上生效的主要原因。为了减少调试bug的时间，你需要了解浏览器是怎样解析你的代码的。为了完成这个目标，你需要对权重是如何工作的，有一个清楚的认识。很多CSS出现问题的场景，都是某处定义了一个更高权重的规则，导致此处规则不生效。

## CSS权重：概述

1.  权重决定了哪一条规则会被浏览器应用在元素上。
2.  权重的不同，是你所期望的效果，没有通过CSS规则在元素上生效的主要原因。
3.  权重的级别划分时包含了所有的CSS选择器
4.  如果两个选择器作用在同一元素上，则权重高者生效。
5.  权重的级别根据选择器被划分为四个分类：行内样式，id，类与属性，以及元素。
6.  你可以通过[CSS权重之争](http://www.stuffandnonsense.co.uk/archives/CSS_specificity_wars.html)进一步了解CSS权重。
7.  你也可以通过[CSS Specificity for Poker Players](http://iamacamera.org/default.aspx?id=95)进一步了解CSS权重。
8.  如果两个选择器权重值相同，则最后定义的规则被计算到权重中(后面定度的CSS规则权重要更大，会取代前面的CSS规则)
9.  如果两个选择器权重值不同，则权重大的规则被计算到权重中
10.  如果一条规则包含了更高权重的选择器，那么这个规则权重更高
11.  最后定义的规则会覆盖所有跟前面冲突的规则
12.  内联样式表含有比别的规则更高的权重
13.  Id选择器的权重比属性选择器更高
14.  你可以使用id来增大权重
15.  类选择器比任意数量的元素选择器都高
16.  通配符选择器跟继承来的样式，他们的权重以 0，0，0，0来计算
17.  你可以用CSS权重计算器来计算权重。

### 什么是CSS权重？

1.  权重决定了你CSS规则怎样被浏览器解析直到生效。“CSS权重关系到你的CSS规则是怎样显示的”。参考阅读【[Understanding specificity](http://www.adobe.com/cn/devnet/dreamweaver/articles/CSS_specificity.html)】
2.  当很多的规则被应用到某一个元素上时，权重是一个决定哪种规则生效，或者是优先级的过程。参考阅读【[Selector Specificity](http://juicystudio.com/article/selector-specificity.php)】
3.  每个选择器都有自己的权重。你的每条CSS规则，都包含一个权重级别。 这个级别是由不同的选择器加权计算的，通过权重，不同的样式最终会作用到你的网页中 。参考阅读【[Understanding specificity](http://www.adobe.com/cn/devnet/dreamweaver/articles/CSS_specificity.html)】
4.  如果两个选择器同时作用到一个元素上，权重高者生效。

### 权重等级

每个选择器在权重级别中都有自己泾渭分明的位置。根据选择器种类的不同可以分为四类，也决定了四种不同等级的权重值。

1. 行内样式，指的是html文档中定义的style
2. ID选择器
3. 类，属性选择器和伪类选择器
4. 元素和伪元素

> 这里我要补充的：伪元素选择器只包含以下几种:
>
> 1.  ::after
> 2.  ::before
> 3.  ::first-letter
> 4.  ::first-line
> 5.  ::selecton
>
> 详细请参阅【[Pseudo-elements](https://developer.mozilla.org/en-US/docs/CSS/Pseudo-elements)】
>
>
> 伪元素跟伪类都是选择器的补充，但是，伪类表示的是一种“状态”比如hover，active等等，而伪元素表示文档的某个确定部分的表现，比如::first-line 伪元素只作用于你前面元素选择器确定的一个元素的第一行。
>
>
> 注意，伪元素选择器选择出来的“部分” 不在dom里，也不能对其绑定事件。如果你对伪元素前面的选择器定义的元素绑定了事件，伪元素同样会生效。 永远记得 伪元素生成的是“表现”。
>
>
> 扩展阅读：
>
>
> 1.  [如何给伪元素绑定事件](http://stackoverflow.com/questions/9395858/event-listener-on-a-CSS-pseudo-element-such-as-before-or-after)
> 2.  [w3c规范中的伪元素](http://www.w3.org/TR/REC-CSS1/#the-first-line-pseudo-element)
>
> 如果您对CSS选择器还不太了解，或者说不太清楚CSS有哪些选择器，个人建议你先阅读以下几篇文章，这样更有助于帮助你阅读本文后面的内容：
>
>
> 1.  [《CSS3基本选择器》](http://www.w3cplus.com/CSS3/basic-selectors)
> 2.  [《CSS3属性选择器》](http://www.w3cplus.com/CSS3/attribute-selectors)
> 3.  [《CSS3伪类选择器》](http://www.w3cplus.com/CSS3/pseudo-class-selector)
> 4.  [《CSS选择器优化》](http://www.w3cplus.com/CSS/CSS-selector-performance)
>
> 如果你还分不清楚这些是怎么分类的，你可以看一下文章末尾的一个简短的分类。

## 怎么确定权重

权重记忆口诀。从0开始，一个行内样式+1000，一个id+100，一个属性选择器/class或者伪类+10，一个元素名，或者伪元素+1.比如
{% codeblock lang:css %}
body #content .data img:hover
{% endcodeblock %}
最终的权重值是0122；#content是一个id选择器加了100，.data是一个class类选择器加了10，：hover伪类选择器加了10， body和img是元素加了1 。详细参阅【[CSS Specificity](http://community.invisionpower.com/index.php?showtopic=176404)】

另一种方法：计算有几个id选择器的数量为a ,计算其他属性跟class选择器的数量为b ，计算元素名跟伪元素名的数量为c ，然后结合起来就是权重。详细参阅【[CSS Selector Specificity]](http://juicystudio.com/article/selector-specificity.php)】

## 权重计算测试

利用第一个规则可以很容易计算权重，你可以自己试试看看掌握了没
{% codeblock lang:css %}
* {}                          /* 0 */
li {}                         /* 1(一个元素) */
li:first-line {}              /* 2(一个元素，一个伪元素) */
ul li {}                     /* 2（两个元素） */
ul ol+li {}                   /* 3（三个元素） */
h1+ *[rel=up] {}             /* 11（一个属性选择器，一个元素） */
ul ol li.red {}               /* 13（一个类，三个元素） */
li.red.level {}               /* 21（两个类，一个元素） */
style=""                     /* 1000(一个行内样式) */
p {}                        /* 1（一个元素） */
div p {}                    /* 2（两个元素） */
.sith {}                    /* 10（一个类） */
div p.sith {}                /* 12（一个类，两个元素） */
#sith {}                     /* 100（一个ID选择器） */
body #darkside .sith p {}   /* 112(1+100+10+1,一个Id选择器，一个类，两个元素) */
{% endcodeblock %}

## 权重的基本规则

### 相同的权重：以后面出现的选择器为最后规则：

假如在外部样式表中，同一个CSS规则你写了两次，那么出现在前面的选择器权重低，你的样式会选择后面的样式。

### 不同的权重，权重值高则生效

选择器可能会包含一个或者多个与权重相关的计算点，若经过计算得到的权重值越大，则认为这个选择器的权重高。详细参阅【[Understanding Specificity](http://www.adobe.com/devnet/dreamweaver/articles/CSS_specificity_02.html)】

### CSS权重规则

1、包含更高权重选择器的一条规则拥有更高的权重。详细参阅【[Understanding Specificity](http://www.adobe.com/devnet/dreamweaver/articles/CSS_specificity_02.html)】

2、Id选择器的权重比属性选择器高,比如下面的例子里 样式表中#p123的权重明显比[id=p123]的权重要高。
{% codeblock lang:css %}
A:
a#a-02 { background-image : url(n.gif); }
B:
a[id="a-02"] { background-image : url(n.png); }
{% endcodeblock %}
因此A规则比B规则的权重要高。详细参阅【[W3C CSS 2.1 Specification](http://www.w3.org/TR/CSS21/selector.html)】

3、带有上下文关系的选择器比单纯的元素选择器权重要高。这条规则同样也适用于含有多个元素的选择器。详细参阅【[Cascade Inheritance](http://www.westciv.com/style_master/academy/CSS_tutorial/advanced/cascade_inheritance.html#specificity)】

4、与元素“挨得近”的规则生效，比如CSS中我们定义了以下的规则，
{% codeblock lang:css %}
#content h1 {
  padding: 5px;
}
{% endcodeblock %}
但html 中也定义了规则：
{% codeblock lang:html %}
<style type="text/CSS">
  #content h1 {
    padding: 10px;
  }
</style>
{% endcodeblock %}
Html中定义的规则因为跟元素挨得比较近，所以生效。详细参阅【[Understanding Specificity](http://www.adobe.com/devnet/dreamweaver/articles/CSS_specificity_02.html)】

5、最后定义的这条规则会覆盖上面与之冲突的规则。

6、无论多少个元素组成的选择器，都没有一个class选择器权重高。比如说“.introduction”高于“html body div div h2 p”。详细参阅【[CSS Specificity for Poker Players](http://iamacamera.org/default.aspx?id=95)】

7、通配符选择器也有权重，权重被认为是 0，0，0，0。比如 *， body * 被继承的CSS属性也带有权重，权重是0，0，0，0。详细参阅【[CSS Specificity Clarified](http://molly.com/2005/10/06/CSS2-and-CSS21-specificity-clarified/)】

## 权重实战

1、**利用LVHA原理来给链接应用样式**：如果你想展现不同状态的链接样式，一定要记住link-visited-hover-active的顺序，或者简写为LVHA。详细参阅【[Link Specificity](http://meyerweb.com/eric/CSS/link-specificity.html)】

2、**永远都不要使用“!important”**：“如果你遇到了权重问题，第一个解决方法肯定是去掉“!important”，“!important”会覆盖所有的样式规则，但“!important”根本没有结构与上下文可言，所以很少用到。详细参阅【[Understanding Specificity](http://www.snook.ca/archives/html_and_CSS/understanding_c/)、[Selector Specificity](http://juicystudio.com/article/selector-specificity.php)】

3、**利用id增加选择器权重**：利用ul#blogroll a.highlight代替a.highlight ，权重由0, 0, 1, 1 变成了0, 1, 1, 2。

4、**减少选择器的个数**：“在CSS规则中尽可能的使用较少的选择器”。详细阅读【[Understanding Specificity](http://www.snook.ca/archives/html_and_CSS/understanding_c/)】
