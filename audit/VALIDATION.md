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

## 尚未完成

- v5 网站、API、索引、signer、purchase/mining 服务在正式服务器的安装与运行验收。
- 服务器 Gas nonce 0–7 的旧交易完整性核对和切换 drain proof；具体以安装时实时状态为准。
- Nginx v5 发布、根入口切换、线上读取与钱包流程验收。
- 审核仓库整个历史回归测试全集的新一轮运行；请区分本次列出的检查与仓库中早期日志。
- 外部专业审核、重新读取主网后形成的当前角色/字节码报告，以及审核发现后的修复复核。

服务器目前连接超时，未为了绕过超时改动旧资产或重新部署合约。`websitePublished: false` 和 `servicesInstalled: false` 仍为本次打包时的准确状态。恢复连接后的发布记录应追加证据，并固定新的审核提交号。

## 凭据排除

审核快照通过 `git archive` 导出原仓库的已跟踪文件，没有包含原仓库 Git 历史、本机私密记录、服务器状态目录、数据库、node_modules、私钥或实际环境文件。发布前检查文件名与文本中的私钥、令牌、URL 凭据等；测试中故意构造的无效凭据字符串与公开示例应与真实秘密区分。

文件扫描只能说明其覆盖范围的检查结果，不能证明不存在所有秘密，更不能替代代码安全审计。实际扫描结果见 `audit/evidence/`。
