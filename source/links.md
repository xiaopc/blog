---
title: 链接
date: 2017-12-26 20:52:56
permalink: links/
---

{% raw %}
<div class="link-list">
    <a href="https://www.notion.so/08bd1851f8ed43339d87e7f764d437aa?v=8b7f92c3ace6450a95bf086fa81459f6" target="_blank" rel="noopener">
        书 影 评<br><span>notion.so</span>
    </a>
    <a href="https://t.me/s/imxpc" target="_blank" rel="noopener">
        passageway<br><span>t.me/imxpc</span>
    </a>
</div>
{% endraw %}

## 友情链接

{% raw %}
<div class="link-list">
    <a class="missing" href="http://lightning-zgc.com/" target="_blank" rel="noopener">
        Lightning<br><span>lightning-zgc.com</span>
    </a>
    <a href="https://www.julydate.com/" target="_blank" rel="noopener">
        七夏<br><span>julydate.com</span>
    </a>
    <a href="https://amaoamao.github.io/" target="_blank" rel="noopener">
        毛毛<br><span>amaoamao.github.io</span>
    </a>
    <a href="http://les1ie.com/" target="_blank" rel="noopener">
        冰神<br><span>les1ie.com</span>
    </a>
    <a href="http://webdoger.club/" target="_blank" rel="noopener">
        孔壕<br><span>webdoger.club</span>
    </a>
    <a href="https://wangyang-wy.github.io/" target="_blank" rel="noopener">
        阳神<br><span>wangyang-wy.github.io</span>
    </a>
    <a href="https://xiao-pei.github.io/" target="_blank" rel="noopener">
        小沛<br><span>xiao-pei.github.io</span>
    </a>
    <a href="https://fxy.one/" target="_blank" rel="noopener">
        Roy<br><span>fxy.one</span>
    </a>
</div>
{% endraw %}

{% raw %}
<style>
.link-list {
    display: grid;
    justify-content: space-between;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    grid-gap: 20px;
}
.link-list a {
    display: inline-block;
    min-width: 160px;
    height: 50px;
    padding: 10px 20px;
    border: 1px solid #ddd;
    border-radius: 5px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.0625);
    transition: 0.1s all;
}
.link-list a:hover {
    border-color: #4FC08D;
    box-shadow: 0 1px 2px rgba(79, 192, 141, 0.0625);
}
.link-list a:active {
    transform: translateY(1px);
    border-color: #3AA373;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.0625) inset;
}
.link-list a span {
    color: #4FC08D;
}
.link-list a.missing::before {
    content: '失效链接';
    color: #fff;
    background: #ddd;
    float: right;
    padding: 0 8px;
    transform: translate(21px, -11px);
    transition: 0.1s all;
    border-radius: 0 5px 0 5px;
}
.link-list a.missing:hover::before {
    background: #4FC08D;
}

</style>
{% endraw %}