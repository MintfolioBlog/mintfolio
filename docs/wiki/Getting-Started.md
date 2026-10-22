# 快速开始

需要 [Node.js](https://nodejs.org/) 22.23.4+（22.x）、24.22.1+（24.x）或 26.12.1+（26.x），推荐 24.x LTS。

## 建站

```sh
npm install -g @mintfolio/core
mintfolio create my-blog
cd my-blog
mintfolio dev
```

打开终端里显示的地址（通常是 `http://localhost:4321`），就能看到网站了。里面有一篇示例文章。

想一开始就用 Verdant 主题，把第二条换成 `mintfolio create my-blog --theme verdant`。

已经有一个放 Markdown 笔记的文件夹？不用 `create`，进那个文件夹运行 `mintfolio init`。原来的文件不会被改动。

## 看看目录

```
my-blog/
  hello.md              示例文章
  _mintfolio/
    site.config.ts      站点资料
    theme.config.mjs    主题
    pages/links.md      一个独立页面，对应 /links
    public/             图片等静态文件
```

规则只有一条：**根目录（和子目录）里的 `.md` 都是文章，`_mintfolio/` 里是其他所有东西。** 以 `_` 或 `.` 开头的文件和目录、README 这类说明文件不会被当成文章。

## 改成你自己的

打开 `_mintfolio/site.config.ts`，把标题、网址、名字换掉：

```ts
export default defineSiteConfig({
  site: { title: '我的博客', description: '记录与分享', url: 'https://example.com', language: 'zh-CN' },
  profile: { name: '作者', bio: '欢迎来到我的博客。' },
});
```

开发服务开着的话，保存后页面会自动刷新。更多字段见 [站点配置](Configuration)。

## 写第一篇文章

最简单的方式是直接运行 `mintfolio`，在菜单里选“写一篇新文章”。也可以用命令：

```sh
mintfolio post new "你好，世界" --slug hello-world
```

这会在根目录生成 `hello-world.md`。新文章默认是草稿，普通的 `mintfolio dev` 看不到它，要这样预览：

```sh
mintfolio dev --drafts
```

写好了就发布：

```sh
mintfolio post publish hello-world
```

frontmatter 有哪些字段、怎么放图片、怎么设密码，见 [写文章](Writing)。

## 上线

```sh
mintfolio build
```

把 `_mintfolio/dist/` 整个上传到任意静态托管就行。各平台怎么设置见 [部署](Deployment)。

## 以后

- 升级这个站点用的 Mintfolio：`mintfolio upgrade`
- 出问题先跑：`mintfolio doctor`
- 记不住命令：直接运行 `mintfolio` 用菜单
