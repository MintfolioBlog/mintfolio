# 内容规模基准

这是给维护者用的工具：改了内容查询、搜索索引、分页生成，或者升级了 Astro 之后，用它看看 100 篇、1000 篇文章时构建要多久、搜索索引有多大、搜索算得多快。日常开发和部署都用不着。

## 运行

先 `npm ci` 和 `npm run build`，然后：

```sh
node tools/benchmark-content.mjs                          # 默认分别构建 100 篇和 1000 篇
node tools/benchmark-content.mjs --counts 100 --label before
node tools/benchmark-content.mjs --counts 1000 --paragraphs 40 --iterations 50
```

| 参数 | 默认 | 说明 |
| --- | --- | --- |
| `--counts` | `100,1000` | 每次独立构建的文章数 |
| `--paragraphs` | `20` | 每篇文章的段落数 |
| `--iterations` | `25` | 每个搜索用例的计时次数（另有 3 次预热） |
| `--label` | — | 写进报告的名字，方便前后对比 |
| `--output-dir` | 系统临时目录 | 结果放在哪 |
| `--core-root` | 当前仓库 | 测另一份已编译的 Core |

每次运行会新建一个 `mintfolio-benchmark-*` 目录，里面有生成的文章、构建日志和 `benchmark.json`。工具不会自动清理，看完自己删。里面的 `node_modules` 是指向真实依赖的链接，删的时候别用会顺着链接递归删除的工具。

工具不联网、不装依赖、不改源码，也不会碰你的站点。

## 报告里看什么

| 字段 | 含义 |
| --- | --- |
| `build.elapsedMs` | Astro 构建从启动到退出的总时间 |
| `build.memory.peakRssBytes` | Astro 主进程的内存峰值（不含 esbuild 等子进程） |
| `index.rawBytes` / `index.gzipBytes` | `search-index.json` 的原始大小和 gzip 后大小 |
| `search[].rank` | 在已加载的索引上做一次排序的耗时 |
| `search[].rankAndFirst20Highlights` | 排序加前 20 条高亮，接近搜索组件实际做的计算 |

搜索耗时给出中位数、p95、最小、最大和平均值。

## 怎么比才有意义

- 同一台机器、同样的 Node 和依赖版本、同样的参数，别和其他重活同时跑。
- 先跑 100 篇确认没问题，再跑 1000 篇。要下结论的对比，前后各跑三次。
- 生成的文章之间有重复段落，gzip 压缩率会比真实文章好看。上线前用真实内容再看一次。
- Node 里搜得快不代表手机上也快。真关心体验，要在目标浏览器里看下载、解析和输入时的卡顿。
