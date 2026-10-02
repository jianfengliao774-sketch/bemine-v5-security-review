# BEMine v5 安全审核源码

这是提供给外部审核人的**完整代码快照**，对应新正式版 v5：智能合约、网站、部署后台、索引服务、Gas 代发与自动购机/挖矿服务均在仓库内。请先阅读本页，再按 [审核范围](audit/SCOPE.md) 和 [复现说明](audit/REPRODUCE.md) 开始。

**发布状态：主网合约及 Authority 配置已完成；v5 网站和后台发布尚未完成。** 服务器 SSH 与 HTTPS 连接超时，发布包尚未上传安装。不能把本仓库或已有测试通过解释为正式站已经上线，也不能解释为已通过独立安全审计。最新已保存状态见 [release-status.json](deploy/ops/v5/release-status.json)。

| 核对项 | 固定版本 / 证据 |
| --- | --- |
| 原仓库代码快照 | [`05d48032478b657ef0357467c1b67d98cdf9c76d`](https://github.com/jianfengliao774-sketch/pinkuang/tree/05d48032478b657ef0357467c1b67d98cdf9c76d) |
| 网站与后台发布包源码 | `dea3a78b51352df45771ce6d54043b874e70383e`；之后仅增加安装脚本和发布记录 |
| 合约构建来源提交 | `0166f545b4e45910fabc6e36dd9a53aeff3674cc` |
| 网络 | BNB Smart Chain 主网，chainId `56` |
| 合约 artifact digest | `0x9523dd920e91dcab4358eceddff660d65357bfe1fe3bf6f3e7823cbc94af2502` |
| 链上核验 | [125317258 区块的合约图核验](deploy/ops/v5/live-graph-verification.json) |
| 部署交易 | [16 笔初始化 + 7 笔 Authority 配置](deploy/ops/v5/mainnet-deployment.json) |
| 正式站目标地址 | `https://bemine.cc.cd/bemine-v5/`，当前待发布 |

本仓库的 Git 提交号与原仓库不同。原始 1813 个文件均逐文件保存并登记 SHA-256；仅原 README 移到 `audit/upstream/README.md`，由本页替换审核入口。合约、业务代码、依赖锁文件没有为审核另行改写。运行 `node audit/verify-snapshot.mjs` 可离线核验原始文件和主网配置之间的一致性。新增加的审核说明不属于已构建业务程序。

## 从这里开始

- [审核范围、权限和重点问题](audit/SCOPE.md)
- [依赖安装、编译、测试与复现](audit/REPRODUCE.md)
- [测试证据与尚未完成的验证](audit/VALIDATION.md)
- [主网地址及角色](deploy/ops/v5/mainnet-deployment.json)
- [源码出处与逐文件校验清单](audit/source-manifest.json)
- [报告提交格式](audit/REPORT-TEMPLATE.md)

## 目录

| 路径 | 内容 |
| --- | --- |
| `contracts/src/` | 单矿机池、多矿机预算项目、份额市场、整机出售、Authority、Beacon、Timelock、资金与治理库 |
| `contracts/test/` | 单元、状态不变量、历史 fork 测试与测试用 mock |
| `deploy/src/`、`deploy/shared/` | 部署浏览器、钱包交易、签名结构、合约与运行环境核验 |
| `deploy/server/` | API、签名操作队列、索引与展示缓存、Firsto 接口、通知 |
| `deploy/scripts/` | Gas 代发、购机/挖矿 worker、构建与打包工具 |
| `web/` | Next.js 网站、钱包接入、交易弹窗、份额与收益页面 |
| `deploy/ops/v5/` | 本次正式版配置、主网凭证、安装与切换脚本 |
| `scripts/formal-v5/` | 独立本地链的完整部署与三天规则验证 |
| `docs/`、其他 `deploy/ops/` | 保留的历史文档、测试证据和运维实现；不能作为 v5 已上线的依据 |

整机最早出售提案、提案频率与轮次间隔采用 **3 天**；投票期 **24 小时**；挂牌有效期 **7 天**；升级 timelock 最短 **48 小时**。详细时间基准请逐项核对合约，不能理解为只有一个通用的“等待三天”开关。

两个管理员属于“任一管理员签名即可执行”的权限模型，**不是 2/2 多签**。Gas 钱包是独立热钱包；其可执行操作、目标限制、nonce、签名绑定和费用领取收款地址都在审核范围内。

旧 v4 和测试合约与资产保留在原合约；本次为独立新部署，没有资产迁移。历史测试地址不得混入新正式配置。内部 `fresh-v4` 字符串是兼容的协议/数据 schema 名称，v5 的部署地址、文件路径、端口与数据库另行隔离。

仓库不包含运行服务器私钥、实际 `.env`、Gas credential、数据库、钱包状态或私人备份。公开地址、主网交易哈希以及已有测试 fixture 是核验材料。审核仓库不启用 GitHub Actions，避免复制来的历史工作流触发部署或消耗 RPC 配额。

历史 README 和文档中可能有已经被后续实现替代的规则；以本次固定代码、v5 主网凭证和上述审核说明为入口。针对旧版本的审核报告不自动覆盖 v5。
