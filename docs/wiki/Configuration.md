# 站点配置

站点的内容信息都在 `_mintfolio/site.config.ts` 里：标题、个人资料、导航、订阅设置等。这些是**站点自己的**，换主题也不会丢。

主题的外观设置（配色、布局之类）在另一个文件 `theme.config.mjs` 里，见 [主题](Themes)。

可以直接编辑文件，也可以用命令改单个字段：

```sh
mintfolio config set site site.title "新的标题"
mintfolio config schema site    # 列出所有字段
```

## 最少要填的

```ts
import { defineSiteConfig } from '@mintfolio/core/config';

export default defineSiteConfig({
  site: {
    title: '我的小站',
    url: 'https://example.com',
  },
});
```

只有 `title` 和 `url` 是必填的。`url` 填网站上线后的真实地址，canonical、RSS、Sitemap 都靠它，上线前一定要改对。

## 一份完整的例子

不需要的部分删掉就行：

```ts
import { defineSiteConfig } from '@mintfolio/core/config';

export default defineSiteConfig({
  site: {
    title: '林间小站',
    url: 'https://example.com',
    description: '记录代码、阅读与生活',
    language: 'zh-CN',
  },

  // 个人资料，主页和 /about 会用到
  profile: {
    name: '林间',
    avatar: '/images/avatar.webp',
    bio: '在这里记录正在做的事',
    location: '杭州',
    signature: '慢慢写，认真生活。',
  },
  social: [
    { platform: 'github', url: 'https://github.com/example', icon: 'github' },
  ],
  skills: [
    { category: '前端', items: [{ name: 'TypeScript', level: 90 }] },
  ],
  projects: [
    { title: 'Mintfolio', description: '个人博客工具', repo: 'https://github.com/MintfolioBlog/mintfolio', tags: ['Astro'] },
  ],
  contact: { email: 'hello@example.com', social: ['github'] },
  icp: '浙ICP备00000000号',

  // 博客
  blog: {
    pageSize: 10,               // 每页文章数，1–100
    timezone: 'Asia/Shanghai',  // 按月归档用的时区
  },
  authors: [
    { id: 'lin', name: '林间', url: 'https://example.com/about', avatar: '/images/avatar.webp' },
  ],

  // 导航
  navigation: [
    { id: 'home', label: '首页', url: '/' },
    { id: 'blog', label: '文章', url: '/blog' },
    { id: 'friends', label: '友链', url: '/friends' },
    { id: 'github', label: 'GitHub', url: 'https://github.com/example' },
  ],

  // 分享与订阅
  seo: {
    defaultSocialImage: '/images/social.webp',
    twitterSite: '@example',
  },
  feed: {
    limit: 50,          // 订阅里最多多少篇，1–1000
    content: 'summary', // summary 只放摘要，full 放全文
  },

  // 统计
  analytics: {
    google: { measurementId: 'G-XXXXXXXXXX' },
  },
});
```

## 各部分说明

### 个人资料

`profile`、`social`、`skills`、`projects`、`contact`、`icp` 都是给主题展示用的。**主题不一定全部显示**，比如 Minimal 就比较克制，不显示备案号；Verdant 显示得比较全。

### 博客

- `blog.pageSize`：归档页每页几篇，默认 10。
- `blog.timezone`：按月归档时用哪个时区，默认 UTC。它不会改变文章的发布时间。
- `authors`：作者名单。文章 frontmatter 里写 `authors: ["lin"]` 来署名。只有一个作者的话可以不配，默认用 `profile.name`。

### 导航

不写 `navigation` 时，默认有“首页”“全部文章”“关于我”三项。

一旦写了，就会**完全替换**默认导航，所以记得把想保留的也写上。站内地址以 `/` 开头，外链写完整 URL。导航只是链接，指向 `/friends` 之前得先有 [这个页面](Writing#独立页面)。

### 分享与订阅

- `seo.defaultSocialImage`：文章没有封面时，分享到社交平台用的默认图。
- `feed.content`：设为 `full` 时，RSS 阅读器里能直接看全文。

订阅和 Sitemap 的地址见 [博客功能一览](Blogging-Features#订阅和-seo)。

### 统计

见 [Google Analytics](https://github.com/MintfolioBlog/mintfolio/blob/main/docs/analytics.md)。

## 图片路径

配置里的图片路径（头像、默认分享图等）写成 `/images/xxx.webp`，文件放在 `_mintfolio/public/images/xxx.webp`。

## 额外的 Astro 设置

需要部署到子目录，或者允许优化某个域名的远程图片时，新建 `_mintfolio/astro.config.mjs`：

```js
export default {
  base: '/blog/',
  image: { remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }] },
};
```

只写你要的设置，Core 会自动合并。详见 [部署](Deployment#部署到子目录)。

## 站点 favicon（Core 0.4.1 / Theme API 1.3 起）

把图标放到站点的 `_mintfolio/public/favicon.ico`，在 `_mintfolio/site.config.ts` 的 `site` 中设置：

~~~ts
site: {
  title: '我的博客',
  url: 'https://example.com',
  favicon: '/favicon.ico',
},
~~~

可以使用 ICO、SVG 或 PNG，路径以 `/` 开头，也支持完整 HTTP(S) URL。配置中不要写 `_mintfolio/public` 前缀；空格应进行 URL 编码。省略 favicon 或设为 `''` 时使用主题默认图标。已配置但文件不存在时不会自动探测或回退，应确保该文件会被提交、构建和部署。

部署子目录由 Core 根据 Astro base 自动添加，无需每次更改图标路径。所有页面（包括 404 和其他内置兜底页）使用同一站点图标，切换主题后继续保留。自定义图标会替换整组主题默认图标，不会同时输出两者。浏览器可能缓存旧图标，更新后可改用 `'/favicon.ico?v=2'`。

命令行也支持 `mintfolio config set site site.favicon /favicon.ico`；设为空字符串可恢复默认。此功能需安装包含该能力的 Core 与主题版本；只升级主题而继续使用旧 Core 不会生效。
