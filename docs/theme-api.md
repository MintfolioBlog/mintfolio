# Theme API

一个 Mintfolio 主题就是一个 npm 包：一个 `theme.mjs` 声明文件，加几个 Astro 页面。

分工很简单：**Core 决定有哪些页面、每个页面放什么数据；主题决定这些数据长什么样。** 路由、URL、草稿过滤、SEO、加密都是 Core 的事，主题拿到的是已经处理好的公开数据，HTML、CSS、交互完全自由。

本文对应 Core 0.4 / Theme API 1.2。想先动手做一个，看 [从 Starter 创建主题](https://github.com/MintfolioBlog/mintfolio/wiki/Theme-Development)。

## 一个最小的主题

```js
// theme.mjs
import { defineTheme } from '@mintfolio/core/theme';

export default defineTheme({
  manifest: {
    id: 'paper',
    name: 'Paper',
    version: '1.0.0',
    author: 'Your name',
    description: '安静的阅读主题',
    engine: '^1.2.0',
  },
  pages: {
    home: './pages/home.astro',
    post: './pages/post.astro',
  },
});
```

```astro
---
// pages/home.astro
import type { ThemePageProps } from '@mintfolio/core/astro';
import SeoHead from '@mintfolio/core/components/SeoHead.astro';
import definition from '../theme.mjs';

type Props = ThemePageProps<typeof definition, 'home'>;
const { theme, page } = Astro.props;
---
<html lang={theme.site.language}>
  <head><meta charset="utf-8" /><SeoHead seo={page.seo} /></head>
  <body>
    <h1>{theme.site.title}</h1>
    <ul>{page.posts.map((post) => <li><a href={post.url}>{post.title}</a></li>)}</ul>
  </body>
</html>
```

只写了首页和文章页也能完整运行：归档、独立页面、404 这些没写的页面，Core 会用内置的 Minimal 补上。

## 从哪里导入

| 入口 | 内容 |
| --- | --- |
| `@mintfolio/core/theme` | `defineTheme`、`InferSettings`、所有数据类型 |
| `@mintfolio/core/astro` | 页面 props 类型：`ThemePageProps`、`PageProps`、`PageDataFor` 等 |
| `@mintfolio/core/client` | 浏览器端工具：生命周期、解锁、目录、灯箱、列表、复制 |
| `@mintfolio/core/search` | 搜索纯函数：`searchPosts`、`rankSearchResults`、`searchWithHighlights` 等 |
| `@mintfolio/core/components/*.astro` | 可选的标准组件，见 [标准组件](https://github.com/MintfolioBlog/mintfolio/wiki/Components) |

只能从这些入口导入。`@mintfolio/core` 根入口、`/config`、`/content` 是给站点用的，主题碰不得；`astro:content`、站点的 `site.config.ts`、Core 的 `src/` 私有目录也一样。构建时 Core 会检查主题的整个依赖图（包括间接导入），越界就直接报错。

> 这是开发约束，不是安全沙箱：它防止主题意外依赖 Core 内部实现，但不能阻止恶意 npm 包。

## theme.mjs

### manifest

| 字段 | 说明 |
| --- | --- |
| `id` | 小写加连字符，比如 `paper`、`my-theme` |
| `name` | 显示名称 |
| `version` | 精确的 semver，比如 `1.0.0` |
| `author`、`description` | 必填 |
| `engine` | 兼容的 Theme API 版本范围，写 `^1.2.0`。注意这不是 Core 或 Astro 的版本 |

### pages

| 页面 | 必需 | 用在哪 |
| --- | --- | --- |
| `home` | 是 | `/` |
| `post` | 是 | `/blog/<文章>` |
| `archive` | 否 | `/blog`、`/blog/page/2`、`/tags/…`、`/categories/…`、`/series/…` |
| `page` | 否 | `/about` 和 `_mintfolio/pages/` 里的独立页面 |
| `notFound` | 否 | 404 |

路径相对 `theme.mjs` 所在目录，以 `./` 开头，指向包内的 `.astro` 文件。标签、分类、系列、搜索都共用 `archive` 页面，没有单独的槽位。

### capabilities

声明主题支持什么，没写的都当作 `false`：`search`、`tags`、`categories`、`toc`、`darkMode`、`encryptedPosts`、`comments`、`i18n`。

目前 Core 会看其中几项：

- `encryptedPosts`：站点里有密码文章而主题没声明它，构建直接失败。声明了就要保证文章页真能处理受保护正文（最省事的办法是用 `ProtectedArticle` 组件）。
- `search`、`tags`、`categories`：没声明时构建会给一条警告，提醒用户这个主题可能不显示对应功能。

其余几项目前只是描述信息。

### settings

主题设置的 schema。用户在 `theme.config.mjs` 里填，Core 负责校验和补默认值，主题从 `theme.settings` 读到的永远是完整、合法的值。

```js
settings: {
  accentColor: { type: 'color', label: '强调色', default: '#2255aa' },
  maxWidth: { type: 'number', label: '正文宽度', default: 760, min: 480, max: 1200 },
  layout: { type: 'select', label: '布局', default: 'wide', options: ['wide', 'narrow'] },
  sidebar: {
    type: 'object', label: '侧栏', default: {},
    properties: {
      enabled: { type: 'boolean', label: '显示侧栏', default: true },
      links: {
        type: 'array', label: '链接', default: [],
        items: {
          type: 'object', label: '链接', default: {},
          properties: {
            label: { type: 'string', label: '文字', default: '' },
            url: { type: 'string', label: '地址', default: '' },
          },
        },
      },
    },
  },
}
```

- 类型：`string`、`boolean`、`number`、`select`、`color`、`object`、`array`。每项都要有 `label` 和 `default`，可以加 `description`。
- 用户没填的字段用默认值。对象逐层合并，数组整个替换。
- 未知字段、类型不对的值会报错，错误信息带完整路径（比如 `sidebar.links.0.url`）。
- `InferSettings<typeof definition.settings>` 能推导出完整的设置类型，`ThemePageProps` 已经帮你做了这一步。

### build

主题要用 React 或 Tailwind 时声明 `build: { react: true, tailwind: true }`，并在主题自己的 `dependencies` 里装 `@astrojs/react` / `react` 或 `@tailwindcss/vite` / `tailwindcss`。主题不能注册任意 Astro 或 Vite 插件，也不支持继承另一个主题。

## 页面拿到什么

每个页面的 props 都是 `{ theme, page }`。用 `ThemePageProps` 声明类型最方便：

```ts
import type { ThemePageProps } from '@mintfolio/core/astro';
import definition from '../theme.mjs';
type Props = ThemePageProps<typeof definition, 'post'>;
```

### page：这一页的数据

所有页面都有 `kind`、`title`、`description`、`url`、`seo`。各自另外有：

| kind | 额外字段 |
| --- | --- |
| `home` | `posts`：文章列表（置顶在前，然后按时间倒序） |
| `post` | `post`、`body`、`previous`、`next`、`related`、`seriesPosts` |
| `archive` | `posts`（**只是当前这一页**）、`filters`、`pagination`、`taxonomy`（在标签/分类/系列页时告诉你是哪个） |
| `page` | `id`、`profile`、`body`（Markdown 独立页才有；`/about` 没有 body，用 `profile` 渲染）、`updatedAt` |
| `notFound` | 无 |

`related`、`seriesPosts`、`previous`/`next` 都是 Core 排好序的，直接渲染就行。

### theme：全站数据和服务

| 字段 | 内容 |
| --- | --- |
| `theme.site` | 站点标题、描述、URL、语言，以及 `profile`、`social`、`skills`、`projects`、`contact`、`icp`、`authors`、`analytics` 等公开资料 |
| `theme.navigation` | 导航链接 `{ id, label, url }[]`，主题可以重排或省略 |
| `theme.settings` | 校验过、补齐默认值的主题设置 |
| `theme.content` | 查文章和页面，见下 |
| `theme.taxonomy` | `tags()`、`categories()`、`series()` 返回 `{ id, label, url, count }[]`；`archives()` 按月分组（只有数据，没有月份归档页） |
| `theme.search` | `index()` 返回公开搜索条目 |
| `theme.urls` | 所有链接都从这里拿，见下 |

`theme` 里有构建期函数，不要把它整个序列化到浏览器端。

### 查询内容

```ts
const { items, total } = await theme.content.posts({ tag: 'Astro', offset: 0, limit: 5 });
const post = await theme.content.post('notes/hello');     // 不存在或未发布时为 null
const pages = await theme.content.pages();                // 只包括 Markdown 独立页
const series = await theme.content.series('博客搭建笔记');  // 按系列顺序
const related = await theme.content.related('notes/hello', 3);
```

`posts()` 的筛选条件有 `q`、`tag`、`category`、`series`，同时给多个时取交集，`q` 搜全文、不分大小写。`total` 是分页前的总数。

这里的 ID 是文件路径得出的内容 ID（如 `notes/hello`），不是 frontmatter 里的 `slug`。

### 文章摘要 PostSummary

列表里的每篇文章都是 `PostSummary`：`id`、`url`、`title`、`description`、`publishedAt`（ISO 字符串）、`tags`、`category`、`cover`、`protected`，以及可选的 `updatedAt`、`wordCount`、`readingMinutes`、`pinned`、`series`、`authors`、`seo`、`preview`（本地草稿预览时为 `true`）。

密码文章的 `description` 是 Core 给的占位文字，也没有字数和阅读时长。

### 链接

**永远不要自己拼 URL。** 文章用 `post.url`，标签分类用 `term.url`，其他从 `theme.urls` 拿：

| 方法 | 地址 |
| --- | --- |
| `home()`、`archive(filters?)`、`archivePage(n, filters?)` | 首页、归档、归档第 n 页 |
| `post(id)`、`page(id)` | 文章、独立页 |
| `tag(label)`、`category(label)`、`series(label)` | 标签、分类、系列页 |
| `rss()`、`atom()`、`jsonFeed()`、`sitemap()`、`robots()` | 订阅等 |
| `searchIndex()` | 全文搜索索引的地址 |
| `asset(path)` | 给 `/images/a.png` 这种站内路径加上部署前缀 |

这些地址已经处理好编码和子目录前缀（站点部署在 `/blog/` 下时自动带上）。自己拼的 `/blog/${id}` 在子目录部署时就会坏掉。

## 文章正文

`page.body` 有两种：

```astro
---
import ProtectedArticle from '@mintfolio/core/components/ProtectedArticle.astro';
const { page } = Astro.props;
---
{page.body.kind === 'public'
  ? <article set:html={page.body.html} />
  : <ProtectedArticle body={page.body} />}
```

- `{ kind: 'public', html, headings }`：普通文章，`html` 已经是安全的，可以直接 `set:html`；`headings` 用来做目录。
- `{ kind: 'protected', postId, payload }`：密码文章，只有密文，没有标题目录。

用 `ProtectedArticle` 组件就够了。想自己画解锁界面时：

```ts
import { unlockArticle, ArticleUnlockError } from '@mintfolio/core/client';

try {
  const { fragment, headings } = await unlockArticle(body.payload, password, body.postId);
  container.replaceChildren(fragment);
} catch (error) {
  if (error instanceof ArticleUnlockError) showError(error.code);
}
```

`unlockArticle` 负责验证、解密和清理 HTML，返回可以直接插入的 `DocumentFragment`。更推荐用 `createProtectedArticleController`，它还帮你处理重复提交、页面离开时清空等细节。

自己实现时请遵守：

- 不要自己解密，不要假设 `payload` 的内部结构。
- 密码、解密后的正文和目录**不要**写进 localStorage、sessionStorage、URL 或 history。
- 重新锁定、离开页面（`pagehide`）时清掉正文和所有引用。
- 浏览器解密需要 HTTPS 或 localhost。

## 浏览器端

### 生命周期

站点可能启用 Astro 的页面切换和浏览器的往返缓存（BFCache），事件绑定要能正确释放。用 `onPage`：

```ts
import { onPage, createTocController } from '@mintfolio/core/client';

onPage('[data-article]', (root, scope) => {
  root.querySelector('button')?.addEventListener('click', onClick, { signal: scope.signal });
  const toc = createTocController({ /* … */ });
  scope.add(toc.dispose);
});
```

`scope.signal` 在离开页面时自动 abort；`scope.add()` 注册清理函数；`scope.timeout()`、`scope.frame()` 是会自动取消的定时器。

### 控制器

这些控制器只管行为，不碰样式和 DOM 结构，界面由主题自己画：

| 函数 | 用途 |
| --- | --- |
| `createProtectedArticleController` | 密码文章解锁、重新锁定、离开时清理 |
| `createTocController` | 目录高亮、滚动到标题、阅读进度 |
| `createLightboxController` | 图片预览：缩放、拖动、键盘操作 |
| `createPostListController` | 前端筛选、分页加载更多 |
| `copyText`、`extractCodeText`、`resolveCodeLanguage` | 代码块复制按钮需要的工具 |

每个控制器都返回 `dispose()`，也都接受 `signal`。

### 搜索

归档页的 `page.posts` 只有当前一页，做全站搜索要加载 `theme.urls.searchIndex()` 返回的完整索引。最省事的是直接用 `PostArchive` 或 `SearchPanel` 组件；自己做的话，`@mintfolio/core/search` 里有：

- `searchPosts(entries, filters)`：筛选
- `rankSearchResults(...)`：按相关度排序
- `searchWithHighlights(...)`：返回纯文本片段和高亮位置（不输出 HTML，由你决定怎么标亮）
- `readFiltersFromUrl` / `writeFiltersToUrl`：在 URL 参数和筛选条件之间转换

搜索索引里只有已发布的公开内容。密码文章只有标题等元数据，没有正文。

## 设置模板

用户切换到你的主题时，Core 会往他们的 `theme.config.mjs` 里写一份设置模板。默认根据 schema 自动生成；想给用户更友好的注释和示例，可以自己写一份：

```js
// config/theme-paper.config.mjs
export default {
  // 链接和按钮的颜色
  accentColor: '#2255aa',
  // 侧栏链接，可以照着下面的格式加
  sidebar: { links: [] },
};
```

然后在 `package.json` 里声明：

```json
{
  "mintfolio": { "configTemplate": "./config/theme-paper.config.mjs" }
}
```

Core 只会复制 `export default` 后面的对象（连同里面的注释），文件开头的说明不会带过去。模板里不要读取任何外部文件。

## package.json 要点

```json
{
  "name": "mintfolio-theme-paper",
  "type": "module",
  "exports": { "./theme": "./theme.mjs" },
  "files": ["theme.mjs", "pages", "styles", "config"],
  "peerDependencies": {
    "@mintfolio/core": "^0.4.0",
    "astro": "^7.3.2"
  }
}
```

- 必须通过 `exports` 导出 `./theme`。
- `files` 要包含所有页面、样式、字体和设置模板。发布前用 `npm pack --dry-run` 看一眼。
- 字体、图标等第三方素材记得带上许可证。

## 站点怎么使用主题

```js
// _mintfolio/theme.config.mjs
export default {
  theme: 'mintfolio-theme-paper',   // npm 包名、相对目录，或 'minimal'
  settings: { accentColor: '#aa3355' },
  overrides: {
    pages: { archive: './overrides/archive.astro' },   // 可选：只替换某个页面
  },
};
```

- `theme` 留空时用内置 Minimal。
- `overrides.pages` 相对 `_mintfolio/` 解析，覆盖的页面同样受导入边界约束。没有隐式的同名文件覆盖。
- 环境变量 `MINTFOLIO_THEME` 可以临时换一个主题启动；换成别的主题时，原来的 `settings` 和 `overrides` 会被忽略。

## 检查

| 在哪 | 命令 | 检查什么 |
| --- | --- | --- |
| 主题仓库 | `npm run check`（Starter 自带） | Astro 和 TypeScript 类型 |
| 测试站点 | `mintfolio theme check` | manifest、设置、页面路径、覆盖路径 |
| 测试站点 | `mintfolio build` | 真正构建一遍 |

`theme check` 不能替代真正的构建。发布前，把主题 `npm pack` 出来装进一个测试站点，看看首页、普通文章、密码文章、缺省页面的回退、手机尺寸和页面切换是否正常。

## 站点 favicon 契约

Core 0.4.1 将站点配置 `site.favicon` 验证、规范化并补上部署路径后，提供为 `theme.site.favicon` 和所有页面的 `page.seo.favicon`。Theme API 1.3 的 `SeoHead` 新增可选 `faviconFallback` 属性，接受 URL 字符串或只读 `FaviconLink[]`（`{ href, type? }`）。配置了站点图标时只渲染该图标；未配置时才渲染主题提供的默认图标列表。

~~~astro
---
import SeoHead from '@mintfolio/core/components/SeoHead.astro';
import defaultIcon from '../assets/favicon.svg?url';
const { page } = Astro.props;
---
<SeoHead seo={page.seo} faviconFallback={defaultIcon} />
~~~

无需主题读取宿主配置或自行拼接 base，也不要再额外输出固定的 `link rel="icon"`。内置 Minimal 和七个主题已接入；Verdant 原有 SVG/ICO 组合仍用于默认回退。使用此能力的主题声明 `engine: '^1.3.0'` 和 Core peerDependency `^0.4.1`。

### 模板完整性

`mintfolio.configTemplate` 导出的对象应列出 schema 的全部字段，嵌套对象也需完整；空数组应在注释中展示条目结构。完整模板保留作者注释。若模板遗漏字段，Core 会保留其中的有效取值，并根据 schema 重新生成完整对象，补上默认值、说明、枚举选项和数值范围；此时使用 schema 注释替代模板手写注释。未提供模板的主题直接按 schema 生成，空数组条目示例保持注释，不激活虚构内容。
