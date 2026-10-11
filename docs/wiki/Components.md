# 标准组件

Core 带了几个现成的 Astro 组件，主题可以直接用，省得每个主题都重写一遍搜索框和密码表单。用不用全凭主题自己：不喜欢它们的样子，可以只拿 [Theme API](Theme-API#浏览器端) 里的控制器自己画界面。

导入方式都一样：

```astro
import SearchPanel from '@mintfolio/core/components/SearchPanel.astro';
```

组件只带最基础的样式，类名都以 `mintfolio-` 开头，主题可以用 CSS 覆盖。

## 一览

| 组件 | 放在哪 | 必填参数 |
| --- | --- | --- |
| `SeoHead` | 每个页面的 `<head>` | `seo` |
| `ProtectedArticle` | 文章页，密码文章时 | `body` |
| `PostArchive` | 归档页，一站式的列表 + 搜索 + 分页 | `posts`、`tags`、`categories` |
| `SearchPanel` | 任何地方 | — |
| `Pagination` | 归档页 | `pagination` |
| `PostMeta` | 文章页或列表 | `post` |
| `ArticleLinks` | 文章页末尾 | `page` |
| `Image` | 任何地方 | `src`、`alt`、`width`、`height` |

## SeoHead

```astro
<head>
  <SeoHead seo={page.seo} />
</head>
```

输出标题、描述、canonical、robots、Open Graph、Twitter Card、结构化数据和订阅链接。每个页面都应该放，不要再自己输出一套冲突的 SEO 标签。

## ProtectedArticle

```astro
{page.body.kind === 'protected' && <ProtectedArticle body={page.body} />}
```

密码输入框、错误提示、解锁后的正文、“重新锁定”按钮都有了，离开页面时会自动清掉解锁的内容。用了它，主题就可以放心声明 `encryptedPosts: true`。

## PostArchive

归档页最省事的写法，一个组件包含当前页文章列表、标签和分类入口、全站搜索、分页：

```astro
---
const { theme, page } = Astro.props;
const [tags, categories] = await Promise.all([theme.taxonomy.tags(), theme.taxonomy.categories()]);
---
<PostArchive
  posts={page.posts}
  tags={tags}
  categories={categories}
  filters={page.filters}
  pagination={page.pagination}
  language={theme.site.language}
  archiveUrl={theme.urls.archive()}
  searchEndpoint={theme.urls.searchIndex()} />
```

| 参数 | 说明 |
| --- | --- |
| `posts` | 当前页的文章，传 `page.posts` |
| `tags`、`categories` | 从 `theme.taxonomy` 取 |
| `filters` | 当前筛选，用来高亮选中的标签/分类 |
| `pagination` | 分页信息，传 `page.pagination` |
| `language` | 日期格式用的语言，默认 `zh-CN` |
| `archiveUrl` | “全部文章”的地址，默认 `/blog`。站点部署在子目录时一定要传 `theme.urls.archive()` |
| `searchEndpoint` | 搜索索引地址，传 `theme.urls.searchIndex()` |

## SearchPanel

单独的全站搜索框，可以放在首页、侧栏或者任何地方：

```astro
<SearchPanel endpoint={theme.urls.searchIndex()} placeholder="搜点什么" />
```

第一次输入时才加载搜索索引。支持中文、多个关键词、结果高亮、加载失败重试。`endpoint` 不传时用默认地址（已考虑子目录部署），但必须是同一个域名下的地址。

## Pagination

```astro
{page.pagination && <Pagination pagination={page.pagination} />}
```

上一页、下一页和页码，都是真实链接，不需要 JavaScript。只有一页时不输出任何内容。

## PostMeta

```astro
<PostMeta post={page.post} language={theme.site.language} timezone={theme.site.blog?.timezone} />
```

显示发布日期、更新日期、阅读时长、作者、置顶标记，本地草稿预览时还会显示“尚未发布”。

## ArticleLinks

```astro
<ArticleLinks page={page} />
```

放在文章末尾：系列目录、相关文章、上一篇/下一篇。数据都是 Core 排好的，没有的部分不显示。

## Image

包了一层 Astro 的 `<Image>`，同时接受字符串地址和 Core 给的图片对象（比如 `theme.site.profile.avatar`）：

```astro
<Image src={theme.site.profile.avatar} alt={theme.site.profile.name} width={96} height={96} />
```

`width` 和 `height` 必填。`widths`、`quality`、`format`、`layout`、`fit`、`priority` 等会原样交给 Astro，其他 HTML 属性也会转发。`src` 为空时显示一个占位头像。

远程图片要能被优化，需要在站点的 `astro.config.mjs` 里允许对应域名，见 [站点配置](Configuration#额外的-astro-设置)。
