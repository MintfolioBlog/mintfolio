# 命令行

`mintfolio` 命令随 `@mintfolio/core` 一起安装，Windows、macOS、Linux 都能用，需要 Node.js 22.12.0 以上。

```sh
npm install -g @mintfolio/core
```

全局装一次就够了。每个站点会在自己的 `_mintfolio/` 里再装一份 Core，全局命令在站点里运行时会自动交给那一份执行，所以不同站点可以停留在不同版本，互不影响。不想全局安装的话，在 `_mintfolio/` 里用 `npx mintfolio …` 也一样。

命令会从当前目录往上找站点，所以在站点根目录、文章子目录、`_mintfolio/` 里运行都行。要操作别处的站点，用 `mintfolio -C <目录> <命令>`。

## 菜单

直接敲 `mintfolio`，不带任何参数，会打开一个菜单：

- 写新文章：问标题、文件名、分类、标签、摘要，分类和标签可以从已有的里面选
- 管理文章：搜索、发布、改回草稿、用编辑器打开
- 预览、构建、检查内容
- 主题与外观：逐项修改主题设置，或者切换、安装主题
- 站点资料：标题、简介、所在地等
- 更多：预览构建结果、环境检查、升级 Core

在一个还不是站点的目录里运行，它会问你要不要把这里变成站点。

菜单能做的事，下面的命令都能做。命令缺参数时会在终端里追问；在 CI、管道里或者加了 `--no-interactive` 时不会追问，直接报错退出，方便写脚本。

## 建站

```sh
mintfolio create my-blog                   # 在空目录里新建站点
mintfolio create my-blog --theme verdant   # 顺便装好 Verdant
mintfolio init                             # 把当前目录（比如一堆现成的笔记）变成站点
mintfolio upgrade                          # 更新这个站点的 Core
mintfolio doctor                           # 看看 Node、Core、Astro、主题的版本和状态
```

`create` 要求目录是空的，会建好 `_mintfolio/`、装好依赖，并放一篇示例文章和一个 `/links` 页面。

`init` 不会覆盖任何已有文件；目录里已经有文章时也不会再加示例文章。安装中途断了，再运行一次就会接着来。

`upgrade` 前先停掉开发服务，升级完再启动。

## 预览与构建

```sh
mintfolio dev               # 本地开发服务
mintfolio dev --drafts      # 同上，但能看到草稿和未来日期的文章
mintfolio build             # 构建到 _mintfolio/dist
mintfolio preview           # 预览构建结果
mintfolio check             # 检查文章里的链接、图片、地址冲突
mintfolio check --json      # 同上，输出 JSON，给 CI 用
```

`--drafts` 只对 `dev` 有效，`build` 永远不会包含草稿。其余参数会原样传给 Astro，比如 `mintfolio dev --port 4322`；只有 `--config` 和 `--root` 由 Core 管，不能自己传。

不要直接运行 `astro dev`。Astro 需要的配置文件是 Mintfolio 每次运行前在 `_mintfolio/.generated/` 里临时生成的。

`check` 会检查所有文章和独立页面（包括草稿和密码文章）：

- **报错**：站内链接指向不存在的文章、图片文件不存在、两篇文章抢同一个地址。有错误时退出码非零。
- **警告**：找不到的锚点、链接到 `.md` 源文件等，可能是主题或插件处理的，需要你自己确认。
- 不检查外部链接，不会输出正文或密码。

## 文章

```sh
mintfolio post new "标题"                       # 新建草稿，文件名按标题生成
mintfolio post new "一次旅行" --slug life/travel --category 生活 --tags 旅行,随笔
mintfolio post new "马上发" --slug ready --date 2026-09-11 --publish
mintfolio post list                             # 所有文章
mintfolio post list --draft                     # 只看草稿
mintfolio post list --scheduled                 # 只看还没到发布时间的
mintfolio post list --publishable               # 只看下次构建会出现的
mintfolio post publish life/travel              # 草稿 → 发布
mintfolio post draft life/travel                # 发布 → 草稿
```

`--slug` 决定文件放在哪：`life/travel` 会生成 `life/travel.md`。同名文件已存在时不会覆盖。

`publish` 只是把 `draft` 改成 `false`，不会构建，更不会部署。如果 `pubDate` 还在未来，它会提醒你这篇要等到期后的那次构建才会出现。改动会保留其他 frontmatter、注释和正文，并先备份原文件。

文章有三种状态：草稿、定时（不是草稿但日期还没到）、可发布（下次构建会出现）。`list --json` 输出 `slug`、`title`、`date`、`draft`、`status`、`publishedAt`。

## 主题

```sh
mintfolio theme list                     # 内置、已安装的主题
mintfolio theme current                  # 当前用的是哪个
mintfolio theme install verdant          # 安装（verdant 是 @mintfolio/theme-verdant 的简写）
mintfolio theme install @someone/theme@1.2.3 --use   # 安装并切换
mintfolio theme use minimal              # 切换
mintfolio theme use ./my-theme           # 用本地目录里的主题（路径相对 _mintfolio/）
mintfolio theme init                     # settings 为空时写入当前主题的设置模板
mintfolio theme check                    # 校验主题和设置
```

切换主题时，Mintfolio 会把新主题带注释的完整设置模板写进 `theme.config.mjs`，打开就能看到所有可调选项。旧主题的设置会备份到 `_mintfolio/.backups/`，切回去时可以从那里抄回来。

目前没有卸载命令，不需要的主题可以在 `_mintfolio/` 里 `npm uninstall`。

## 配置

```sh
mintfolio config get site                         # 看整个站点配置
mintfolio config get site site.title              # 看某一项
mintfolio config set site site.title "新名字"
mintfolio config set site blog.pageSize 12
mintfolio config get theme                        # 当前主题的有效设置（含默认值）
mintfolio config set theme sidebar.quote.enabled true
mintfolio config schema theme                     # 当前主题有哪些设置项
mintfolio config schema site
mintfolio config edit theme                       # 用编辑器打开
mintfolio config path theme                       # 打印文件路径
```

`site` 指 `_mintfolio/site.config.ts`，`theme` 指 `_mintfolio/theme.config.mjs` 里的 `settings`。

字段用点号连接，数组元素用下标，比如 `social.0.url`。值会按字段类型自动转换：`3` 对配色编号来说是字符串，对文章数来说是数字。数组和对象直接写 JSON：

```sh
mintfolio config set site navigation '[{"id":"home","label":"首页","url":"/"},{"id":"links","label":"友链","url":"/links"}]'
```

不同终端的引号规则不一样，复杂的值用 `config edit` 改更省事。

`config set` 只替换目标字段，保留文件里的注释、import 和其他内容。`site.config.ts` 是按语法改写的，不会执行它；遇到展开语法、计算属性这类改不了的写法会提示你用 `config edit`。

`config edit` 默认用系统编辑器（Windows 记事本、macOS 默认文本编辑器、Linux `xdg-open`），可以通过 `VISUAL` / `EDITOR` 环境变量或 `--editor <程序路径>` 换。

`get` 和 `schema` 加上 `--theme <主题>` 可以查看没启用的主题；`set` 和 `edit` 只改当前主题。

## 备份

修改配置或文章草稿状态之前，原文件会完整复制到 `_mintfolio/.backups/<时间>/`，命令会打印具体位置。想恢复就把文件拷回去。这个目录不会进 Git。

CLI 不会覆盖已有文章、不会删除主题、不会碰 Git，也不会上传任何东西。

## 站点目录

```
my-blog/
  hello.md               文章
  travel/beach.md        子目录里的也是文章
  travel/beach.jpg       文章可以用相对路径引用旁边的图片
  README.md              仓库说明，不发布
  _mintfolio/
    site.config.ts       站点资料
    theme.config.mjs     当前主题及其设置
    astro.config.mjs     可选，额外的 Astro 设置
    pages/               独立页面，pages/links.md → /links
    public/              原样发布的静态文件
    package.json         依赖（node_modules 也在这）
    dist/                构建输出
    .generated/          Core 自动生成，别改
    .backups/            修改前的备份
```

根目录及子目录里的 `.md` 都是文章，除了：

- 以 `_` 或 `.` 开头的文件和目录，比如 `_drafts/`、`.github/`
- 根目录的 `README`、`AGENTS`、`CLAUDE`、`CHANGELOG`、`LICENSE`、`CONTRIBUTING`、`SECURITY`、`CODE_OF_CONDUCT`（不区分大小写）
- `node_modules/`

需要额外的 Astro 设置（部署子目录、远程图片白名单等）时，新建 `_mintfolio/astro.config.mjs`，只写这些设置，Core 会自动合并：

```js
export default {
  base: '/blog/',
  image: { remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }] },
};
```

这个文件里不要引入 `@mintfolio/core`，也不要改 `srcDir`。

### 从旧布局升级

0.3 及更早的站点把所有东西都放在根目录。新版发现旧布局会停下来，列出需要处理的文件。照下面做一遍：

1. 新建 `_mintfolio/`，把 `package.json`、`package-lock.json`、`site.config.ts`、`theme.config.mjs`、`public/` 以及 `site.config.ts` 引用到的图片移进去。删掉根目录的 `node_modules/`，在 `_mintfolio/` 里重新 `npm install`。
2. 把 `content/blog/` 里的文章移到站点根目录，`content/pages/` 移到 `_mintfolio/pages/`，然后删掉 `content/`。
3. 删掉 `src/content.config.ts` 和 `tsconfig.json`。
4. 打开当前主题的 `theme-<主题>.config.mjs`，把 `export default` 后面的对象复制到 `theme.config.mjs` 的 `settings` 里，然后删掉所有 `theme-*.config.mjs`。
5. 删掉 `astro.config.mjs`。如果里面有 `base`、`image` 这类设置，只保留它们，放进 `_mintfolio/astro.config.mjs`。
6. CI 里的安装和构建改到 `_mintfolio/` 下执行，产物目录改成 `_mintfolio/dist`。

### 自动生成的主题配置

新建站点会创建 `_mintfolio/theme.config.mjs`，列出内置 Minimal 的全部设置。交互菜单安装并启用主题、`mintfolio theme install <包名> --use` 或 `mintfolio theme use <主题>` 会写入对应主题的完整设置模板，包含说明、默认值、可选值及已注释的数组示例。单独运行 `npm install` 或不带 `--use` 的 `mintfolio theme install` 只安装包，不修改当前主题。

已有非空 `settings` 不会被初始化或重复启用覆盖；空设置可用 `mintfolio theme init` 补齐。切换到其他主题前会备份原配置。升级主题也不会自动覆盖用户设置；新增选项仍可通过 `mintfolio config schema theme` 查看。
