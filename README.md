<p align="center"><img src="docs/assets/mintfolio-icon.png" width="112" height="112" alt="Mintfolio" /></p>

# Mintfolio

一个装着 Markdown 文章的文件夹，就是一个博客。

Mintfolio 把个人主页和博客放在一起：文章就是普通的 `.md` 文件，放在哪个目录都行；分页、搜索、订阅、SEO、密码文章这些事交给它处理；页面长什么样由主题决定，换主题不用动文章。最后输出一堆静态文件，丢到任何静态托管上就能访问。

![Verdant 主题的个人主页](docs/assets/home-desktop.webp)

*上图是 [Verdant](https://github.com/MintfolioBlog/mintfolio-theme-verdant) 主题和示例资料。不装主题时使用内置的 Minimal，以文字为主。*

## 五分钟上手

需要 Node.js 22.23.4+（22.x）、24.22.1+（24.x）或 26.12.1+（26.x），推荐 24.x LTS。

```sh
npm install -g @mintfolio/core
mintfolio create my-blog
cd my-blog
mintfolio
```

最后一条命令会打开一个菜单，写文章、预览、构建、换主题都能在里面点着完成。习惯敲命令的话：

```sh
mintfolio post new "我的第一篇文章" --slug first-post   # 新建草稿 first-post.md
mintfolio dev --drafts                                   # 本地预览，草稿也能看到
mintfolio post publish first-post                        # 改为正式发布
mintfolio build                                          # 生成 _mintfolio/dist
```

把 `_mintfolio/dist` 里的东西上传到服务器或静态托管，网站就上线了。

已经有一个放 Markdown 笔记的文件夹？进去运行 `mintfolio init`，原有文件一个都不会动。

想要上图的样子：

```sh
mintfolio theme install verdant --use
```

## 站点长什么样

```
my-blog/
  hello.md              ← 文章，子目录也可以
  travel/beach.md
  travel/beach.jpg      ← 文章旁边的图片可以直接用相对路径引用
  _mintfolio/
    site.config.ts      ← 站点标题、个人资料、社交链接……
    theme.config.mjs    ← 用哪个主题、主题设置
    pages/              ← 独立页面，pages/links.md 对应 /links
    public/             ← 原样复制到网站的静态文件
    dist/               ← 构建结果
```

根目录里的 Markdown 都是文章，除了以 `_` 或 `.` 开头的文件和目录、以及 README、LICENSE 这类仓库说明。想放几篇不发布的笔记，丢进 `_drafts/` 之类的目录就行。

## 能做什么

- **写作**：草稿、定时发布、置顶、分类、标签、系列、多作者；固定链接，改了地址也能给旧链接做跳转。
- **阅读**：静态分页、全站全文搜索（纯前端，不需要搜索服务）、相关文章、阅读时长、上一篇/下一篇。
- **分享**：RSS、Atom、JSON Feed，Sitemap，Open Graph 和结构化数据，可选 Google Analytics。
- **密码文章**：给单篇文章设密码，正文在构建时加密，读者在浏览器里输入密码解锁。
- **个人主页**：头像、简介、技能、项目、社交链接，具体怎么展示看主题。
- **部署**：纯静态输出，支持部署在子目录（如 `example.com/blog/`）。

## 常用操作

| 想做什么 | 怎么做 |
| --- | --- |
| 改网站标题 | `mintfolio config set site site.title "我的博客"` |
| 改个人资料、社交链接 | 编辑 `_mintfolio/site.config.ts` |
| 调整主题外观 | `mintfolio config edit theme`，或在菜单里逐项改 |
| 检查死链和缺失图片 | `mintfolio check` |
| 看看环境有没有问题 | `mintfolio doctor` |
| 查看全部命令 | `mintfolio --help` |

## 文档

用户：

- [快速开始](https://github.com/MintfolioBlog/mintfolio/wiki/Getting-Started)、[写文章](https://github.com/MintfolioBlog/mintfolio/wiki/Writing)、[站点配置](https://github.com/MintfolioBlog/mintfolio/wiki/Configuration)、[主题](https://github.com/MintfolioBlog/mintfolio/wiki/Themes)
- [命令行参考](docs/cli.md)、[部署](docs/deployment.md)、[Google Analytics](docs/analytics.md)、[常见问题](https://github.com/MintfolioBlog/mintfolio/wiki/Troubleshooting)

开发者：

- 开发主题：[从 Starter 开始](https://github.com/MintfolioBlog/mintfolio/wiki/Theme-Development)、[Theme API](docs/theme-api.md)、[标准组件](https://github.com/MintfolioBlog/mintfolio/wiki/Components)
- 改 Core 本身：[CONTRIBUTING.md](CONTRIBUTING.md)

## 截图

![文章阅读](docs/assets/article-reading.webp)

<p><img src="docs/assets/home-mobile.webp" width="280" alt="手机上的 Verdant 首页" /> <img src="docs/assets/encrypted-mobile.webp" width="280" alt="手机上的密码文章" /></p>

## 现状

项目还在 0.x，接口可能调整。升级前请保留站点源文件和 `package-lock.json`，并看一眼 [更新记录](CHANGELOG.md)。

几个容易误会的地方：

- 定时文章到点后不会自己出现，需要重新构建一次（可以交给 CI 定时跑）。
- 密码文章只加密正文和目录，标题、日期、标签、封面仍然公开。
- CLI 只负责本地写作和构建，不会帮你部署。

## 相关仓库

| 仓库 | 内容 |
| --- | --- |
| [mintfolio](https://github.com/MintfolioBlog/mintfolio) | 本仓库：CLI、博客引擎、内置 Minimal 主题 |
| [mintfolio-theme-verdant](https://github.com/MintfolioBlog/mintfolio-theme-verdant) | Verdant 主题 |
| [mintfolio-theme-api](https://github.com/MintfolioBlog/mintfolio-theme-api) | 主题公共类型与契约 |
| [mintfolio-theme-starter](https://github.com/MintfolioBlog/mintfolio-theme-starter) | 写新主题的起点 |

问题和建议请提 [issue](https://github.com/MintfolioBlog/mintfolio/issues)；安全问题请按 [SECURITY.md](SECURITY.md) 私下报告。

## 许可证

[GPL-3.0-only](LICENSE)。第三方依赖和素材保留各自的许可证，见 [第三方声明](THIRD_PARTY_NOTICES.md)。

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
