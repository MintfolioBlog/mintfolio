# 参与开发

欢迎提 issue、修文档、改代码。小改动直接发 PR；要动公开接口或站点目录结构的，先开个 issue 聊一下想解决什么，免得白做。

## 跑起来

需要 Node.js 22.12.0 以上。

```sh
npm ci
npm test
```

`npm test` 会先编译 `src/public` 下的 TypeScript 到 `dist/`，再跑 `tests/` 里的单元测试，最后用真实的 Astro/Vite 构建检查主题导入边界。全部通过就说明环境没问题。

`vendor/` 里是还没发布到 npm 的依赖包（目前是 `@mintfolio/theme-api`），`package-lock.json` 直接指向它们，所以不需要把其他仓库也克隆下来。更新方法见 [vendor/README.md](vendor/README.md)。

## 代码地图

Core 是一个 Astro integration 加一个 CLI。用户运行 `mintfolio dev` 时大致是这样走的：

```
bin/mintfolio.mjs            解析命令；全局安装时把命令转交给站点自己装的 Core
  └ bin/lib/runtime.mjs      在 _mintfolio/.generated/ 写出 Astro 配置和内容集合，然后启动 Astro
      └ src/integration.mjs  站点使用的 integration 入口
          └ src/engine/      加载并校验主题、检查导入边界、注入路由
              └ src/routes/  Core 拥有的全部 URL：首页、文章、归档、订阅、搜索索引……
                  └ src/server/  从内容集合算出公开数据（DTO），交给主题的页面渲染
```

按目录说：

| 目录 | 做什么 | 谁能用 |
| --- | --- | --- |
| `bin/` | CLI：建站、写文章、改配置、交互菜单、内容检查 | 用户 |
| `src/engine/` | 主题加载（`loader.mjs`）、manifest 与设置校验（`schema.mjs`）、导入边界（`import-boundary.mjs`）、integration 本体 | 私有 |
| `src/routes/` | 注入到站点的 Astro 路由 | 私有 |
| `src/server/` | 文章模型、发布规则、URL、SEO、订阅、Sitemap、统计注入 | 私有 |
| `src/shared/` | CLI 和引擎都要用的规则：站点目录约定、发布状态判断、子目录部署 | 私有 |
| `src/content.mjs` | `blog` / `pages` 两个内容集合和 frontmatter schema | 宿主 |
| `src/public/` | 编译成 `@mintfolio/core/theme`、`/astro`、`/client`、`/search`、`/config` | 公开 |
| `src/client/` | 浏览器端控制器：列表、目录、解锁、灯箱、代码复制 | 公开（经 `/client`） |
| `src/components/` | 主题可选用的标准组件 | 公开 |
| `src/fallback/` | 内置的 Minimal 主题，主题缺页面时也用它补 | — |
| `tests/` | 单元测试，`tests/helpers/runtime.mjs` 用真实 Vite 加载 Core 模块 | — |
| `tools/` | 主题边界验证、vendor 更新、内容规模基准 | — |

“私有”的意思是主题不能导入，构建时会被 `import-boundary.mjs` 拦下来。改私有代码随意，改公开入口要当心：它们是主题作者依赖的契约，见 [Theme API](docs/theme-api.md)。

## 在真实站点里试改动

单元测试过了之后，最可靠的办法是打个包装到测试站点里：

```sh
npm pack --pack-destination artifacts
cd /path/to/test-site/_mintfolio
npm install /path/to/mintfolio/artifacts/mintfolio-core-0.4.0.tgz
mintfolio dev
```

站点里的 `mintfolio` 会自动使用这个站点装的 Core，不会用到全局安装的版本。打包安装能顺带发现 `package.json` 里 `files` 漏写文件之类的问题。

## 几条约定

- **测试只写核心行为**：内容公开规则、加密、URL、配置校验这类出了错会伤到用户的地方。边缘功能没有明确需要就不加测试。改完一批再统一跑，不用每改一个文件跑一次。
- **主题只吃公开数据**：Core 交给主题的永远是 DTO，不是原始内容集合条目。密码、草稿、受保护正文不能出现在任何 DTO 里。
- **URL 由 Core 生成**：路由、编码、子目录前缀都在 `src/server/routing.ts`，组件和主题不要自己拼路径。
- **公开函数写清楚**：输入、输出、什么时候会抛错、需要调用方负责什么清理，写在 JSDoc 里。
- **改公开接口**：同时更新类型、文档和 [CHANGELOG](CHANGELOG.md)，不兼容的改动写上迁移步骤。
- TypeScript 严格模式，类型导入用 `import type`。不要从其他仓库的源码目录导入。

## 文档

用户文档用中文，写给第一次接触的人看：先说能做什么、怎么做，原理和边界情况放后面。

| 位置 | 内容 |
| --- | --- |
| `README.md` | 项目介绍和五分钟上手 |
| `docs/wiki/` | GitHub Wiki 的源文件：使用手册和主题开发教程 |
| `docs/cli.md`、`docs/deployment.md`、`docs/theme-api.md` | 参考文档，**和 `docs/wiki/` 里的 `CLI.md`、`Deployment.md`、`Theme-API.md` 内容相同**，改一处要同步另一处；里面的链接用完整 URL，两边都能点 |
| `docs/analytics.md`、`docs/performance.md` | 统计配置、内容规模基准 |

`docs/cli.md` 的“从旧布局升级”标题被 CLI 的报错信息引用，改名时同步改 `bin/lib/files.mjs` 和 `bin/lib/runtime.mjs`。

## 多仓库怎么配合

| 仓库 | npm 包 | 负责 |
| --- | --- | --- |
| [mintfolio-theme-api](https://github.com/MintfolioBlog/mintfolio-theme-api) | `@mintfolio/theme-api` | 主题契约：类型、搜索纯函数、加密协议 |
| [mintfolio](https://github.com/MintfolioBlog/mintfolio)（本仓库） | `@mintfolio/core` | CLI、引擎、Minimal |
| [mintfolio-theme-verdant](https://github.com/MintfolioBlog/mintfolio-theme-verdant) | `@mintfolio/theme-verdant` | Verdant 主题 |
| [mintfolio-theme-starter](https://github.com/MintfolioBlog/mintfolio-theme-starter) | `theme-mintfolio-starter` | 主题模板 |

一个改动跨仓库时，按依赖顺序来：Theme API → Core → 主题 → 站点。上游打包后，用下游仓库的 `npm run deps:update -- <tgz>` 刷新 vendor 和锁文件。

## 提交与 PR

- 从 `main` 拉分支，一个 PR 做一件事。
- 提交信息用英文，带 `feat:`、`fix:`、`docs:`、`refactor:` 前缀。用户看的文档用中文。
- PR 里写清楚：原来有什么问题、现在行为怎样、实际跑过哪些检查。界面改动附截图并说明看过哪些尺寸。纯文档改动不用跑整套测试。
- 只提交源码、文档、锁文件和必要的 vendor 包；`node_modules`、`dist`、`artifacts`、`.cache` 都不进 Git。
- `main` 需要 CI 通过并解决评审意见。目前只有一位维护者，不强制第二人批准，欢迎大家帮忙看 PR。

代码按 GPL-3.0-only 发布。引入第三方代码、字体或素材时，请一并带上来源和许可证。
