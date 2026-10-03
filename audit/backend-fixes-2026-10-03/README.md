# 2026-10-03 后端修复补充

线上 API 业务源码已更新到 [`788cd0d705ba053615b5f5a8c319a6eeb752a1a7`](https://github.com/jianfengliao774-sketch/pinkuang/commit/788cd0d705ba053615b5f5a8c319a6eeb752a1a7)。安装及复核证据在原仓库 `41307dd`。本目录是对原始审核快照的增量，根目录的旧源码和 1813 文件哈希保持不变，不能把旧根目录源码当成当前 API 版本。

- [逐项复核、已修与未修清单](REVIEW.md)
- [可应用到原审核快照的后端源码及测试补丁](backend.patch)
- [安装结果](evidence/installation.json)、[对外 HTTP 与浏览器验收](evidence/http-verification.json)
- [后端回归 78 项](evidence/backend-tests.tap)、[展示缓存回归 9 项](evidence/display-tests.tap)
- [受限安装脚本](evidence/install.py)、[nginx v5 路由](nginx.conf)、[nginx http 限流区](nginx-http-limits.conf)

87 项定向测试在服务器 Node 24.20.0 通过，不是完整安全审计。R1/R2 合约问题、R4–R6 前端恢复问题及报告列出的其他后端扩展性/能力识别问题仍未解决。合约 digest、静态网站、signer 和 worker 版本不变，本次没有发起链上交易。

## 离线检查

先运行原有 `node audit/verify-snapshot.mjs`、`node audit/verify-activation.mjs`，再运行 `node audit/verify-backend-fixes.mjs`。新补充有独立 SHA-256 清单。

如需测试新源码，请在额外副本内应用 `git apply audit/backend-fixes-2026-10-03/backend.patch`。这会修改原始业务快照，原快照验证器之后报出变动是预期行为。安装器只用于指定生产基础包，审核方不要执行它；普通审核和本地测试无需实际凭据、资金或生产权限。
