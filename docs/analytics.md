# Google Analytics

在 `site.config.ts` 里填上 GA4 的衡量 ID 就行，不管用哪个主题都一样生效：

```ts
import { defineSiteConfig } from '@mintfolio/core/config';

export default defineSiteConfig({
  site: { title: '我的博客', url: 'https://example.com' },
  analytics: {
    google: {
      measurementId: 'G-XXXXXXXXXX',
      // enabled: false,   // 想临时关掉时打开这一行
    },
  },
});
```

或者用命令：

```sh
mintfolio config set site analytics.google.measurementId G-XXXXXXXXXX
```

ID 必须是 `G-` 开头的格式。它本来就是公开在网页里的，不是密钥。

## 什么时候会统计

- `mintfolio dev`：不统计。
- `mintfolio build` 之后部署上线：统计。
- 在 localhost / 127.0.0.1 上预览构建结果：不统计，免得自己的访问混进数据。

统计脚本由 Core 在构建时插进每个 HTML 页面，RSS、JSON 这类文件不会插。主题不需要也不应该自己加载 Google 标签；如果构建时发现主题或页面里还有另一份 gtag.js，会直接报错，避免重复统计。

## GA4 后台要开一个选项

Core 只发送首次页面浏览。如果主题用了 Astro 的页面切换（不整页刷新，比如 Verdant），后续的页面浏览要靠 GA4 自己识别。

在 GA4 后台对应的网站数据流里打开：**增强型衡量 → 网页浏览 → 基于浏览器历史记录事件的网页更改**。

不要再额外配置手动 page_view 或 GTM 的页面浏览标签，否则会重复计数。

## 以前在 Verdant 里配置过 analyticsId？

旧版 Verdant 把 ID 放在主题设置里，现在已经挪到站点配置：

1. 把 `theme.config.mjs`（或旧的 `theme-verdant.config.mjs`）里的 `analyticsId` 值，填到 `site.config.ts` 的 `analytics.google.measurementId`。
2. 删掉主题设置里的 `analyticsId`。
3. 把 Core 和 Verdant 都升到最新版，重新构建部署。

## 主题作者看这里

主题可以通过 `theme.site.analytics` 读到配置（比如在页面上显示一条隐私说明），但不要自己加载统计脚本。
