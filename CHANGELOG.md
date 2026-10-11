# 更新记录

## 0.4.2

- 新增按功能导入的客户端控制器入口，保留原 `/client` API；最低 Theme API 版本更新为 1.4.0。
- CLI 按命令加载依赖，减少帮助、版本查询及全局转交的启动开销。
- 批量复用站点配置投影和归档日期格式化器，相关文章排序预先计算分数。
- 修正性能基准工具的站点目录隔离，避免不同规模的文章混入同一轮结果。

## 0.4.1

- 支持站点 `site.favicon`，统一 CLI 验证、部署 base 路径和全部页面头部数据；主题未配置时使用默认图标。
- 依赖 Theme API 1.3，内置 Minimal 支持同一配置。

## 0.4.0

**不兼容变更**：站点目录结构变了。现在站点根目录就是文章目录，其他所有东西都放进 `_mintfolio/`。旧站点运行新版命令时会列出需要调整的文件并停下，按 [从旧布局升级](docs/cli.md#从旧布局升级) 改一次即可。

站点结构

- 根目录及子目录里的 Markdown 都是文章；`_`、`.` 开头的路径和 README 等仓库说明文件除外。站点资料、主题、独立页面（`_mintfolio/pages`）、静态文件、`package.json` 和构建输出都在 `_mintfolio/`。
- 站点不再需要 `astro.config.mjs`、`src/content.config.ts` 和 `tsconfig.json`，CLI 每次运行前在 `_mintfolio/.generated/` 里生成。需要额外 Astro 设置（如 `base`）时，写一个只含这些设置的 `_mintfolio/astro.config.mjs`。
- 文章可以用相对路径引用旁边的图片。
- 备份放在 `_mintfolio/.backups/`，和 `.generated/` 一样不会进 Git。

命令行

- 不带参数运行 `mintfolio` 打开交互菜单：写文章、管理文章、预览、构建、调整主题设置、修改站点资料。在非站点目录会引导建站。
- 命令缺参数时在终端里追问；在 CI、管道或加 `--no-interactive` 时仍然直接报错。
- `mintfolio init` 可以把已有的笔记目录变成站点，原有文章不动。
- 全局安装的 `mintfolio` 会把命令交给站点自己安装的 Core 执行。

主题

- 主题设置统一写在 `theme.config.mjs` 的 `settings` 里，不再使用 `theme-*.config.mjs`。`theme use` 会写入新主题带注释的完整设置模板，旧设置留在备份中。
- 移除 `theme sync`；`theme init` 改为只在 `settings` 为空时写入模板。
- Theme API 升到 1.2：新增独立页面查询、系列目录和系列筛选、`ThemePageProps` 类型推导，搜索索引、robots 和静态资源也有了统一的 URL 方法（支持子目录部署）。

## 0.3.0

- 站点支持 Astro base 子目录部署，统一导航、正文图片、搜索、订阅和 SEO 地址。
- 正文表格在构建时生成可聚焦滚动区域，公开文章关闭 JavaScript 仍可阅读宽表格。
- CLI 将草稿、未来定时和可参与构建状态分开显示；发布时间保留完整 UTC 时间。
- 新增可选 100/1000 篇真实构建与搜索基准工具及部署说明。
- 新增静态分页、标签/分类/系列页面、独立 Markdown 页面和自定义导航。
- 文章支持固定 slug、aliases、更新时间、作者、置顶、系列、阅读统计和相关文章。
- 统一草稿与未来文章发布策略，`dev --drafts` 仅在本地预览，生产输出始终排除。
- 搜索升级为按需加载公开正文索引、组合查询与安全高亮，保留旧查询链接。
- 新增文章级 SEO、JSON-LD、Twitter Card、Atom、JSON Feed、全文订阅和 robots.txt。
- `check` 增加内容、图片、链接和路由冲突诊断；`check --json` 提供结构化结果。
- Theme API 升至 1.1.0，现有主题接入新的页面、分页和文章导航。

## 0.2.0

- 统一 Verdant 的包名、主题 ID、配置文件、类型名称和 CLI 简写。
- 官方主题使用 `@mintfolio/theme-verdant`，设置保存在 `theme-verdant.config.mjs`。

## 0.1.5

- 主题显示名称调整为 Verdant，并增加同名 CLI 简写。
- 整理公开仓库、README、使用教程和主题开发文档。
- 增加 GPL-3.0-only 许可证、贡献说明和私密安全报告入口。

## 0.1.4

- 主题设置无效时仍可定位和打开配置文件。
- 全局 CLI 使用 PATH 中选定的 npm。

## 0.1.2–0.1.3

- 增加站点、文章、主题和配置管理命令。
- 新文章默认为草稿，配置和草稿状态修改前保留备份。

## 0.1.1

- 支持每个主题独立的配置文件，重复初始化和升级保留原有设置。

## 0.1.0

- 博客引擎独立为 npm 包，内置 Minimal，视觉主题独立安装。
