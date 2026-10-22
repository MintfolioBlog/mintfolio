# 部署

Mintfolio 构建出来的是纯静态文件，任何能放静态网页的地方都能用：GitHub Pages、Cloudflare Pages、Netlify、Vercel，或者你自己的 nginx。服务器上不需要 Node.js。

Mintfolio 不会替你上传或部署，这一步交给你选的托管平台。

## 构建

```sh
mintfolio check
mintfolio build
mintfolio preview
```

产物在 `_mintfolio/dist/`。上传时传整个目录，不要只挑几个 HTML：搜索索引、订阅、Sitemap、旧地址跳转页都在里面，只换一部分会让它们指向旧内容。

上线前记得把 `site.config.ts` 里的 `site.url` 改成真实域名，canonical、RSS、Sitemap 都靠它生成正确的绝对地址。

## 托管平台怎么填

依赖和构建都在 `_mintfolio/` 里，所以平台的“根目录”或“工作目录”要设成它：

| 设置 | 值 |
| --- | --- |
| 根目录 / 工作目录 | `_mintfolio` |
| 安装命令 | `npm ci` |
| 构建命令 | `npx mintfolio build` |
| 输出目录 | `dist`（相对 `_mintfolio`） |
| Node.js | 22.23.4+（22.x）、24.22.1+（24.x）或 26.12.1+（26.x），推荐 24.x LTS |

记得把 `_mintfolio/package-lock.json` 提交到仓库，CI 装出来的版本才会和本地一致。

GitHub Actions 的关键几步：

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '^24.22.1'
    check-latest: true
- run: npm ci
  working-directory: _mintfolio
- run: npx mintfolio build
  working-directory: _mintfolio
- uses: actions/upload-pages-artifact@v3
  with:
    path: _mintfolio/dist
```

## 部署到子目录

如果网站不在域名根目录，而是在 `https://example.com/blog/` 这样的路径下，新建 `_mintfolio/astro.config.mjs`：

```js
export default {
  base: '/blog/',
};
```

重新构建就行。页面链接、图片、搜索索引、订阅地址都会自动加上 `/blog/` 前缀；文章里、配置里照常写 `/images/a.webp`、`/links` 这样的站内路径，不用自己加。外部链接保持不变。

`site.url` 填 `https://example.com` 或 `https://example.com/blog/` 都可以；如果填了一个和 `base` 对不上的路径（比如 `https://example.com/other/`），构建会报错。

几点注意：

- 改了 `base` 或域名，一定要重新构建，光挪服务器目录不会更新已经生成的链接。
- `base` 请用英文路径。中文 `base` 下 Astro 7.3 的图片优化会失败；中文的文章地址、标签名没有这个问题。
- 主题自己写死的资源路径，需要主题作者用 `theme.urls.asset()` 或 `import.meta.env.BASE_URL` 处理。

## 404 和 robots.txt

构建会生成 `404.html`，但访问不存在的地址时是否真的返回它、状态码是不是 404，由托管平台决定。大多数平台会自动识别 `404.html`；自建服务器需要自己配置。

搜索引擎只读域名根目录的 `/robots.txt`。部署在子目录时，生成的 `/blog/robots.txt` 不起作用，需要在域名根目录的 `robots.txt` 里加一行：

```text
Sitemap: https://example.com/blog/sitemap.xml
```

## 上线前看一眼

- 首页、文章页、独立页、图片都正常
- 搜索能搜到内容
- `/rss.xml`、`/sitemap.xml` 里的地址是正式域名
- 密码文章能解锁（需要 HTTPS，或者在 localhost 上）
- 访问一个不存在的地址能看到 404 页
- 草稿没有被意外发布

别名（`aliases`）生成的是 HTML 跳转页，不是服务器的 301。真需要 301 的话，在托管平台上另外配置。

内容很多、想评估构建耗时和搜索索引大小，可以看 [内容规模基准](https://github.com/MintfolioBlog/mintfolio/blob/main/docs/performance.md)。
