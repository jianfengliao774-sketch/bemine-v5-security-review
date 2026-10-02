# 验证记录与限制

## 已保存证据

| 内容 | 证据 |
| --- | --- |
| 主网初始化与 Authority 配置 | `deploy/ops/v5/mainnet-deployment.json`，16 + 7 步确认 |
| 独立主网合约图核验 | `deploy/ops/v5/live-graph-verification.json`，区块 125317258 |
| 本地完整部署与出售规则 | `deploy/public/formal-v5/`、`scripts/formal-v5/verify-graph.mjs`；仅本地链 |
| v5 发布包及已记录测试数量 | `deploy/ops/v5/release-status.json` |
| 业务源码一致性 | `audit/source-manifest.json`、`audit/verify-snapshot.mjs` |

上一轮发布准备记录：37 项前端/构建检查、131 项运行与 readiness 检查、41 项索引/relay 检查通过；6 项打包/layout 检查与上述集合存在重叠，**不要相加宣称总测试数**。正式静态构建完成，26 个初始 HTML 资源引用全部存在。审核打包时新增的验证与原始输出保存在 `audit/evidence/`。

这些检查是开发验证，不是第三方安全审计结论，也不是整体功能完整覆盖证明。

本次审核打包另行验证：导出的 1813 个原始文件全部逐字节匹配；artifact 中登记的 37 个本地 Solidity 源文件哈希一致；按锁文件重新安装根目录及 deploy 依赖后，重新编译的 bytecode、ABI、源码/依赖哈希和编译器设置与主网部署 artifact 完全匹配，重新计算的 artifact digest 也一致。证据为 `audit/evidence/snapshot-verification.json` 和 `audit/evidence/artifact-recompile.json`。这些步骤没有请求 RPC 或发送主网交易。

## 正式服务器验收 — 2026-10-03

网站、API、索引、signer、purchase/mining 与行情服务已安装并运行。
旧 Gas nonce 0–7 已完成最终确认核对，旧 signer 停用后启用新服务。
索引追平至 125381838 后发布 nginx；API 返回 fresh-active、operationalReady。
公开页面、统计、项目、挂单、行情、23 个唯一初始资源读取均返回 200；
浏览器首页与项目列表完成数据加载。旧 v4 / 完整测试入口仍返回 503，部署入口为 200。

完整新增证据和范围见 [上线补充](activation/README.md)。原始快照中的
`websitePublished: false` 保留为初次打包时的历史事实；上线补充中对应值为 true。

## 尚未完成

- 真实主网资金的钱包认购、购机、出售、提款全流程验收。本轮只进行了读取和部署运行核验。
- 审核仓库整个历史回归测试全集的新一轮运行；本次测试数量与历史日志应分别看待。
- 外部专业安全审核，以及发现问题后的修复复核。

## 凭据排除

审核快照通过 `git archive` 导出原仓库的已跟踪文件，没有包含原仓库 Git 历史、本机私密记录、服务器状态目录、数据库、node_modules、私钥或实际环境文件。发布前检查文件名与文本中的私钥、令牌、URL 凭据等；测试中故意构造的无效凭据字符串与公开示例应与真实秘密区分。

文件扫描只能说明其覆盖范围的检查结果，不能证明不存在所有秘密，更不能替代代码安全审计。实际扫描结果见 `audit/evidence/`。
