# 主题

主题决定网站长什么样。换主题不会动你的文章和站点资料。

- **Minimal**：内置，不用安装。以文字为主，干净简单。
- **[Verdant](https://github.com/MintfolioBlog/mintfolio-theme-verdant)**：完整的个人主页，文章卡片、八套配色、明暗模式、目录和阅读工具。

## 安装和切换

```sh
mintfolio theme install verdant --use   # 安装并切换到 Verdant
mintfolio theme use minimal             # 切回 Minimal
mintfolio theme current                 # 现在用的是哪个
mintfolio theme list                    # 有哪些可用
```

第三方主题直接用 npm 包名安装：

```sh
mintfolio theme install some-mintfolio-theme --use
```

放在站点里的本地主题可以用路径：`mintfolio theme use ./my-theme`（相对 `_mintfolio/`）。

换完主题，开发服务开着的话需要重启一下。

## 调整外观

主题的设置写在 `_mintfolio/theme.config.mjs` 里：

```js
export default {
  theme: '@mintfolio/theme-verdant',
  settings: {
    // 初始配色，1–8
    initialPalette: '1',
    // ……
  },
};
```

切换到一个主题时，Mintfolio 会把这个主题**所有可调的选项连同说明**写进 `settings`，打开文件就能看到能改什么。

三种改法，挑顺手的：

```sh
mintfolio                                    # 菜单 → 主题与外观，逐项修改
mintfolio config edit theme                  # 用编辑器打开
mintfolio config set theme initialPalette 3  # 改单个字段
```

规则：

- 没写的字段用主题默认值。
- 写错字段名或值的类型不对，`mintfolio theme check` 会告诉你哪一项有问题。
- `settings` 只对当前主题有效。换主题前的设置会备份在 `_mintfolio/.backups/`，换回来时可以从那里抄回去。

## 升级主题

```sh
cd _mintfolio
npm update @mintfolio/theme-verdant
```

升级不会改动你已有的设置。新版本加了新选项的话，不写就用默认值；想看新选项，运行 `mintfolio config schema theme`。

升级后跑一下 `mintfolio theme check`，再重启开发服务。

## 只想改一个页面

不想做完整主题，只是对某个页面不满意？可以单独替换它：

```js
export default {
  theme: '@mintfolio/theme-verdant',
  overrides: {
    pages: { archive: './overrides/archive.astro' },
  },
};
```

路径相对 `_mintfolio/`。可替换的页面有 `home`、`post`、`archive`、`page`、`notFound`，写法和主题页面一样，见 [Theme API](Theme-API)。

## 想自己做一个

从 [Starter 模板](Theme-Development) 开始。
