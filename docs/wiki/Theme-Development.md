# 从 Starter 创建主题

这一页带你从模板做出一个能发布到 npm 的主题。接口细节都在 [Theme API](Theme-API)，这里只讲流程。

先建立一个印象：**主题就是几个 Astro 页面。** Core 把每个页面需要的数据通过 `Astro.props` 交给你，你负责把它画出来。路由、URL、草稿、加密这些都不用管。

## 1. 拿到模板

在 [mintfolio-theme-starter](https://github.com/MintfolioBlog/mintfolio-theme-starter) 点 **Use this template** 建一个自己的仓库，然后：

```sh
git clone https://github.com/your-name/your-theme.git
cd your-theme
npm ci
npm run check
```

模板里有：

```
theme.mjs              主题声明：名字、页面、设置
src/pages/             home、post、archive、page 四个页面
src/layouts/           共用布局
src/styles/            样式
```

先把 `package.json` 里的包名、作者、仓库地址，以及 `theme.mjs` 里的 `id`、`name`、`author`、`description` 改成你自己的。

## 2. 准备一个测试站点

主题本身跑不起来，需要一个站点来看效果。在主题目录旁边建一个：

```sh
mintfolio create ../theme-playground
```

然后把主题打包装进去：

```sh
npm pack                                   # 在主题目录，生成 your-theme-1.0.0.tgz
cd ../theme-playground/_mintfolio
npm install ../../your-theme/your-theme-1.0.0.tgz
mintfolio theme use your-theme             # 换成你 package.json 里的包名
mintfolio dev --drafts
```

之后每次改完主题，重新 `npm pack` 再 `npm install` 一遍，然后重启 `dev`。走打包这条路虽然多一步，但和用户真正安装时一模一样，`files` 漏了文件、依赖没声明之类的问题能马上暴露出来。

建议在测试站点里多放几种文章：有封面的、没封面的、很长的、带代码和表格的、加了密码的，后面检查时用得上。

## 3. 改页面

每个页面都长这样：

```astro
---
import type { ThemePageProps } from '@mintfolio/core/astro';
import SeoHead from '@mintfolio/core/components/SeoHead.astro';
import definition from '../../theme.mjs';   // 页面在 src/pages/ 下

type Props = ThemePageProps<typeof definition, 'home'>;
const { theme, page } = Astro.props;
---
<!doctype html>
<html lang={theme.site.language}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <SeoHead seo={page.seo} />
  </head>
  <body>
    <h1>{theme.site.title}</h1>
    <ul>
      {page.posts.map((post) => <li><a href={post.url}>{post.title}</a></li>)}
    </ul>
  </body>
</html>
```

- `theme`：全站的东西——站点资料、导航、主题设置、查询函数、URL。
- `page`：这一页的东西——首页的文章列表、文章页的正文、归档页的当前页文章和分页。
- `ThemePageProps` 会根据你的设置声明推导出类型，编辑器里有完整提示。

两条硬规矩：

1. **链接只用 Core 给的**：`post.url`、`tag.url`、`theme.urls.xxx()`。自己拼路径在子目录部署时会出错。
2. **在 `<head>` 里放 `SeoHead`**，或者自己完整输出 `page.seo` 里的信息。

## 4. 文章页和密码文章

文章正文有两种，要分开处理：

```astro
---
import ProtectedArticle from '@mintfolio/core/components/ProtectedArticle.astro';
---
{page.body.kind === 'public'
  ? <article set:html={page.body.html} />
  : <ProtectedArticle body={page.body} />}
```

`ProtectedArticle` 自带密码表单、解锁和重新锁定。想换成自己的界面，用 `@mintfolio/core/client` 里的 `createProtectedArticleController`，规则见 [Theme API](Theme-API#文章正文)。

支持了密码文章，记得在 `theme.mjs` 里声明 `capabilities: { encryptedPosts: true }`，否则有密码文章的站点用不了你的主题。

## 5. 加交互

代码复制、图片预览、目录高亮这类交互，`@mintfolio/core/client` 里都有现成的控制器，只管逻辑不管样式。

在浏览器脚本里用 `onPage` 包一层，这样 Astro 页面切换、浏览器后退时事件不会重复绑定：

```ts
import { onPage } from '@mintfolio/core/client';

onPage('[data-article]', (root, scope) => {
  root.addEventListener('click', handle, { signal: scope.signal });
});
```

搜索、分页、文章元信息、系列和相关文章，可以直接用 [标准组件](Components)，再用 CSS 改样式。

## 6. 加设置项

在 `theme.mjs` 里声明，用户就能在 `theme.config.mjs` 里改：

```js
settings: {
  accentColor: { type: 'color', label: '强调色', default: '#2255aa' },
  showCover: { type: 'boolean', label: '列表显示封面', default: true },
},
```

页面里通过 `theme.settings.accentColor` 读取，值一定是校验过的。

用户切换到你的主题时，Core 会自动根据声明生成一份带说明的设置模板。想写得更友好（加注释、举例子），可以提供自己的模板，见 [Theme API](Theme-API#设置模板)。

## 7. 检查

```sh
npm run check                 # 主题仓库：类型检查
mintfolio theme check         # 测试站点：校验主题声明和设置
mintfolio build               # 测试站点：完整构建一次
```

然后用浏览器逐个看：

- 首页、文章页、归档和分页、标签页、独立页面、404
- 密码文章：输错密码、输对密码、重新锁定
- 手机宽度
- 只用键盘能不能操作
- 点链接切换页面后，交互是否还正常

## 8. 发布

用最终版本号打包、装进测试站点完整构建一次，没问题就发布：

```sh
npm publish --access public
```

发布前确认：

- `package.json` 的 `files` 包含所有页面、样式、字体和设置模板（`npm pack --dry-run` 看清单）
- `peerDependencies` 里有 `@mintfolio/core` 和 `astro`
- 去掉开发时可能加的 `"private": true`
- 用到的字体、图标带上许可证
