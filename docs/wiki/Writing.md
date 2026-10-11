# 写文章

文章就是站点根目录里的 `.md` 文件，放在子目录里也行，目录怎么分随你。

一篇文章长这样：

```md
---
title: "一次小小的改进"
pubDate: 2026-09-11
description: "记录这次改进的原因和做法"
category: "开发"
tags: ["Astro", "随笔"]
---

正文从这里开始。

## 小标题会出现在目录里

![一张图](./images/screenshot.png)
```

只有 `title` 和 `pubDate` 是必填的。

## 所有字段

**常用**

| 字段 | 说明 |
| --- | --- |
| `title` | 标题，必填 |
| `pubDate` | 发布时间，必填。`2026-09-11` 或 `"2026-09-11T09:00:00+08:00"` |
| `description` | 摘要，会出现在文章列表、搜索结果和订阅里。建议写 |
| `category` | 一个分类，不写就是“未分类” |
| `tags` | 标签列表 |
| `cover` | 封面图，`/images/cover.webp` 或完整 URL |
| `draft` | 是否草稿。手写时不填就是 `false`；用命令新建的文章默认是 `true` |

**进阶**

| 字段 | 说明 |
| --- | --- |
| `updatedAt` | 最后更新时间，主题可能会显示，也用于 Sitemap |
| `pinned` | `true` 时在列表里置顶 |
| `series` / `seriesOrder` | 系列名和在系列中的序号（0、1、2…） |
| `authors` | 作者 ID 列表，对应 `site.config.ts` 里的 `authors`。不写就用站点个人资料里的名字 |
| `slug` | 固定文章地址，见下文 |
| `aliases` | 旧地址列表，访问时会跳转到现在的地址 |
| `password` | 设置后正文加密，见下文 |
| `seo` | 单独设置搜索引擎和分享卡片用的 `title`、`description`、`image`、`imageAlt`、`canonical`、`noindex` |

字数和阅读时长是自动算的，不用写。

## 图片

两种放法都行：

- **放在文章旁边**，用相对路径引用：`![](./images/a.png)`。适合只有这篇文章用的图。
- **放在 `_mintfolio/public/` 下**，用根路径引用：`/images/a.png` 对应 `_mintfolio/public/images/a.png`。适合头像、封面这类到处用的图。

## 草稿和定时发布

满足两个条件的文章才会出现在网站上：不是草稿，并且 `pubDate` 已经到了。

```sh
mintfolio post new "标题"            # 新建，默认是草稿
mintfolio dev --drafts               # 本地预览时连草稿和未来的文章一起看
mintfolio post publish <文章>        # 草稿 → 发布
mintfolio post draft <文章>          # 发布 → 草稿
mintfolio post list --scheduled      # 看看哪些文章在等发布时间
```

`<文章>` 是不带 `.md` 的文件路径，比如 `notes/hello`。

**关于定时发布**：网站是静态的，到了时间文章不会自己冒出来，需要那之后再构建一次。可以让 CI 每天定时构建。精确到小时的话，`pubDate` 最好带上时区，比如 `"2026-10-01T09:00:00+08:00"`；只写日期按 UTC 零点算。

## 文章地址

默认地址来自文件路径：`notes/hello.md` → `/blog/notes/hello`。

想让地址和文件名脱钩（以后挪文件、改文件名都不影响链接），写 `slug`：

```yaml
slug: "guides/my-blog"   # → /blog/guides/my-blog，中文也可以
```

已经公开过的文章想换地址，把旧地址写进 `aliases`，老链接会自动跳转过来：

```yaml
slug: "new-name"
aliases:
  - "/blog/old-name"
```

区别是：`slug` 写的是 `/blog/` 后面那段，`aliases` 写的是以 `/` 开头的完整旧路径。两篇文章撞了同一个地址时，构建会报错。

## 密码文章

```yaml
password: "只告诉朋友的密码"
```

构建时正文和目录会被加密，读者在页面上输入密码后在浏览器里解锁。要知道：

- **只有正文是保密的**。标题、日期、分类、标签、封面仍然公开，摘要会被换成“这是一篇加密文章”。
- 密码就写在 Markdown 源文件里。站点源码要是放在公开仓库，密码也就公开了。
- 解锁需要网站使用 HTTPS（本地 localhost 也可以）。
- 主题要支持密码文章才能用。内置的 Minimal、官方的 Verdant 都支持。
- 密码文章不进入订阅和 Sitemap，搜索也搜不到正文。

## 独立页面

“友情链接”“关于本站”这类不属于博客文章的页面，放在 `_mintfolio/pages/` 里：

```md
---
title: "友情链接"
description: "我常读的博客"
---

- [朋友的博客](https://example.org/)
```

`_mintfolio/pages/friends.md` 对应 `/friends`。独立页面不需要 `pubDate`，不会出现在文章列表和订阅里，也不支持密码。

要在导航栏里放入口，需要在 [站点配置](Configuration#导航) 的 `navigation` 里加上。
