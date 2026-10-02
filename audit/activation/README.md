# 正式版上线补充 — 2026-10-03

正式网址：https://bemine.cc.cd/bemine-v5/

2026-10-03 07:39 CST 完成 v5 网站、API、索引、签名及购机/挖矿服务的发布。
业务构建仍为 `dea3a78b51352df45771ce6d54043b874e70383e`，合约没有重新部署。
本补充来自原仓库提交 [`52eaca480bf57d7c5e712c0c492419ebd66a73bf`](https://github.com/jianfengliao774-sketch/pinkuang/tree/52eaca480bf57d7c5e712c0c492419ebd66a73bf)。

- `publication-receipt.json`：路由切换、源码及 artifact 身份、追平区块和 HTTP 结果。
- `live-activation-proof.json`：区块 125380223 的角色/字节码图和旧 Gas nonce 0–7 的最终确认核对，切换 nonce 为 8。
- `public-read-verification.json`：外部 HTTPS 的统计、项目、挂单、行情、graph 和 23 个唯一初始资源的读取验证。
- `service-verification.json`：6 个运行服务和独立部署入口均 active/enabled；购机/挖矿 readiness 有效。
- `runtime/`：实际安装、切换和发布脚本，以及公共节点区块头读取并发配置。私密环境和凭据不在仓库内。

安装期间修复了环境文件中带引号的 RPC 值解析，并为 nginx 优雅重载加入有界等待。
首次索引从真实部署区块完整追赶；没有跳过事件或伪造完成标记。购机/挖矿服务只绑定新图。

旧 v4 和完整测试站仍返回 503；旧资产与取回资料保持在原合约。部署入口
https://tapeout.cc.cd/pinkuang-deploy-v5/ 继续可用。新图暂时没有项目。

这是已保存的上线验收，不是持续健康保证，也不是独立安全审计。
没有进行真实资金认购、购机、出售或提款测试。graph 核验接口包含实时链上读取，
本次外部观测耗时约 14 秒；展示缓存接口约 0.9–1.5 秒，不应把两类接口混为一谈。

原始 `deploy/ops/v5/release-status.json` 的 false 值是初次审核快照的历史状态。
为保留 1813 个源文件的逐字节一致性，该文件未覆盖；当前上线状态见本目录同名文件。
运行 `node audit/verify-snapshot.mjs` 检查原始快照，运行
`node audit/verify-activation.mjs` 检查本次新增证据与原始部署身份的一致性。
初始 `v5-review-2026-10-03` 标签保持不变。
