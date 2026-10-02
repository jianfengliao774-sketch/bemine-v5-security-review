# 审核范围与信任边界

## 1. 主网身份与权限

地址真源为 [`deploy/ops/v5/mainnet-deployment.json`](../deploy/ops/v5/mainnet-deployment.json)，代理和实现合约请分开核对。

| 角色 / 合约 | 地址 |
| --- | --- |
| 部署钱包 | `0x042B23288E2316DFb6503488292FD0Ad2F811Ae7` |
| 管理员一 | `0x7674fa446D42b1f7f150DC5e678cc525d275Ea53` |
| 管理员二 | `0xeD2FCBe59EBe1754a3676aeb9CcfBA20f193FcbB` |
| Gas 钱包 | `0xA285d1933e32b5990625aC1F5BEa205Cf2606619` |
| Authority | `0x434b837ADeE65D81923E8dcB329a36b40Aa68fB3` |
| 单机 Factory 代理 | `0x4A866e14816d8339A530c6c82300DBBb6544b37c` |
| 份额 Market 代理 | `0xaB42D8624920974c2a9348b0181AAC0BA3Aa567e` |
| 多机 Factory 代理 | `0x2A02bA72B1c65beFaC1d4Aa912E21D0fa89dFD9A` |
| 多机 Market 代理 | `0xc06A1B28354C64c3E43adb272B984E21D32167EF` |
| Timelock | `0xA04584204C1F39F2f98Ac3413ceDcDcF0EB40108` |

已保存的独立链上核验显示两个 Factory 的 owner 为 Timelock，operator 和 treasury 为 Authority。Authority 自身由同一个 Timelock 拥有。审核人应重新读取当前角色、实现槽位和 timelock proposer/executor/canceller，不能只凭构造参数推断现时权限。

`PlatformAuthority._authorizeFor` 接受两个登记管理员中的任一个签名；签名者可以自行发送，或者由 Gas 钱包代发。管理员拥有各自 nonce。审核任意 calldata、chain/domain/target、deadline、已退休管理员、管理员轮换、nonce 失效和重放情况。费用领取不是自动平均分给两位管理员，应核对 `claimFees` 的签名 recipient 和实际转账。

`executeOperation` 允许 Gas 钱包执行指定矿池的受限挖矿操作；`reclaim` 不在免管理员签名的范围。不要将所有 worker 行为都假定为“只支付 Gas”：逐项枚举它们可以调用的链上方法，以及服务端校验和合约校验之间的区别。

## 2. 资金与状态

| 场景 | 主要入口 | 需要验证的性质 |
| --- | --- | --- |
| 募集、退款、购机 | `PoolVault`、`FreshPoolFactory`、`PoolFunds`、`FlexiblePurchase`、`PurchaseValidation` | 总份额上限、付款精度、部分认购、过期退款、重复执行、NFT 所有权、价格上限、余款归属 |
| 多机预算项目 | `BudgetPortfolioFactory/Vault`、子池创建与购买 | 总预算/单机限额、父子池绑定、子池资金隔离、列表或交易失败恢复、余款与收益归属 |
| 挖矿和 BEM 收益 | `MiningOperations`、`RewardAccounting`、`PoolRewardState`、`TransferableBemRewards` | 转让前后收益债务、已领取与待领取、外部协议失败、整数舍入、重入、停止/重启权限 |
| 份额交易 | `ShareMarket`、`ShareCheckpoints`、池转让限制 | 重复成交、部分成交、过期/取消、托管与受益人、手续费、售机提案/挂牌/成交同时发生时旧份额单是否仍可成交 |
| 整机出售 | `SaleGovernance`、`SaleReviewPolicy`、`FirstoSale`、`FirstoSaleExecutor`、`SaleSettlement` | 3 天边界、24 小时快照投票、反复提案、不同地址绕过轮次限制、低价审核、签名订单到期、原生 Firsto 成交/撤单、最终 NFT/BNB/BEM 归属 |
| 升级 | Factory、Beacon、Timelock、Authority | 48 小时最短延迟、角色交接、初始化竞争、实现绑定、库链接、存储布局和升级后已有份额权益 |

这些是审核目标，不表示已证明全部性质。请重点构造：整机出售与挂单份额成交竞争；同一区块多次提案/转让；相同 nonce 的多笔代发；外部市场已成交但本地缓存尚未更新；矿机买入成功后 worker 崩溃并重启。

## 3. 网站、后端与运维

端到端流程：用户钱包 → 网站/API → 直接合约交易，或管理员 EIP-712 操作 → 签名队列 → 独立 Gas signer → Authority → Factory/池。索引与展示缓存向网站提供读取结果；它们不应成为绕过链上资金权限的依据。

- 验证钱包切换、链切换、session、CSRF/CORS、输入校验和错误处理。用户要求直接唤起钱包、取消应用层交易模拟；这不是删除合约权限校验的理由。
- 检查缓存按链/合约/账户隔离，首次冷启动、过时快照、重组与交易确认刷新；缓存不可让错误项目被签名。
- 检查 API 限流、重复请求合并、批量查询、索引游标和有界重试，尤其是付费 RPC 的无用请求及放大路径。
- 检查 signer 的 IPC 身份校验、HMAC、Unix 权限、typed-data 白名单、calldata 绑定、日志脱敏和管理员签名是否持久化暴露。
- 检查购机、挖矿、Authority relay 的共享钱包锁、nonce 预占/恢复、崩溃后的已广播交易认领、预算与 Gas 上限、禁止重复发送。
- 检查 Firsto 签名订单发布、参考价来源与时效、官方挂单优先查询、多服务读写权限，以及网页和后端能否使用不同合约图。
- 检查 `deploy/ops/v5/` 新旧服务隔离、数据库隔离、不可变发布包校验、切换失败与回滚。安装脚本尚未在本次服务器执行，需额外审阅；不能用本地通过代替上线验收。

## 4. 外部依赖与边界

TapeOut NFT、挖矿协议、BEM、官方市场、Firsto、RPC 和行情接口都是外部信任边界。固定地址在 `contracts/script/Addresses.sol`、源码常量、发布 manifest 和主网凭证中；请核对每种交互的授权、费用、订单格式、NFT 转移及回调语义。仓库不包含这些外部协议的完整源码，mock 和历史 fork 只验证各自覆盖的行为。

不能将旧 `docs/` 中的“仅站内受控成交”等描述当作当前事实；本次代码包含原生 Firsto 出售支持，应从 `FirstoSale` / `FirstoSaleExecutor` 和相应测试确认实际路径。

旧 v4/测试资产仍在旧合约，它们不迁入此图。原站历史二进制标记 `d90f5f09...`、测试标记 `1f3c3809...` 的 Git 对象未在可访问仓库找到；本次新发布包从可追溯的 `dea3a78...` 重建，不宣称与这些历史二进制相同。
