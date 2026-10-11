# 常见问题

遇到问题先跑这个，它会告诉你 Node、Core、Astro、主题的版本和配置状态：

```sh
mintfolio doctor
```

## 改了东西，页面没变化

- 改文章、`site.config.ts`、主题设置：开发服务会自动刷新。没刷新就手动刷一下浏览器。
- 换主题、升级依赖：需要重启 `mintfolio dev`。
- 确认终端所在的站点就是你正在改的那个（特别是同时开了好几个站点时）。

## 新文章没出现

按顺序排查：

1. 是不是草稿？`mintfolio post list --draft` 看一下。用命令新建的文章默认是草稿。
2. `pubDate` 是不是在未来？`mintfolio post list --scheduled`。
3. 文件放对地方了吗？在 `_` 或 `.` 开头的目录里、或者叫 `README.md` 之类，都不会被当成文章。
4. 已经部署的网站：发布后要重新 `build` 并上传。

## 提示“使用旧的站点布局”

0.4 改了目录结构，0.3 及以前的站点需要调整一次。按 [从旧布局升级](CLI#从旧布局升级) 的步骤做。

## 主题设置报错

错误信息里会带字段的完整路径，比如 `sidebar.links.0.url`。对着检查拼写和类型；颜色要用 `#rrggbb` 这样的格式。

`mintfolio config schema theme` 可以列出当前主题接受的所有字段。

## 密码对了却解不开

- 网站必须是 HTTPS（本地 localhost 也行）。用 `http://` 访问正式域名会失败。
- 浏览器可能缓存了旧版本，强制刷新试试。
- 别把不同次构建的文件混着上传，每次都传完整的 `dist`。

## 构建报“导入边界”错误

一般出现在自己写的主题或页面覆盖里：主题只能用 Mintfolio 提供的公开接口，不能直接读站点配置、文章文件或 `astro:content`。从 `Astro.props` 里的 `theme` 和 `page` 拿数据，见 [Theme API](Theme-API)。

## 子目录部署后图片或链接 404

确认 `_mintfolio/astro.config.mjs` 里设了 `base`，并且改完之后**重新构建**了。见 [部署](Deployment#部署到子目录)。

## 提交问题

请带上 `mintfolio doctor` 的输出、操作步骤、期望和实际的结果。别把真实密码和私密文章贴出来。

主题显示上的问题提到对应主题的仓库；内容、路由、命令行的问题提到 [mintfolio](https://github.com/MintfolioBlog/mintfolio/issues)。
