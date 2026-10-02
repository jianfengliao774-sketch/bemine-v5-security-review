# 编译与复现

## 源码身份

```sh
node audit/verify-snapshot.mjs
```

无需安装依赖，也不请求网络。校验原仓库全部文件 SHA-256、已保存的 Solidity sourceHashes、正式部署地址和本次 artifact digest 绑定。清单中的原 README 被映射至 `audit/upstream/README.md`。

本审核仓库是新 Git 历史，HEAD 不等于原仓库构建提交。程序文件可逐个核对；构建器会将本地审核仓库的新 HEAD 写入新产物，这是预期的元数据差异。需要原提交身份时，在原仓库检出 `dea3a78b51352df45771ce6d54043b874e70383e`，使用本目录的 v5 manifest/activation 证据。

## 工具和依赖

- Node.js `24.x`；三个目录的锁文件分别固定依赖。
- Solidity `0.8.24`，Shanghai，optimizer runs `1`，viaIR `false`。
- Foundry `1.7.1`，或安装 `deploy` 的锁定依赖后使用仓库提供的运行包装器。
- Web 使用 `pnpm@11.5.2`。OpenZeppelin Contracts / Upgradeable 均为 `5.0.2`。

```sh
npm ci
npm --prefix deploy ci
corepack pnpm --dir web install --frozen-lockfile
```

若本机未提供 Corepack，可自行安装锁定的 pnpm 版本。审核者自行提供 fork 所需 RPC；仓库不提供私人节点凭据。

## 合约

```sh
npm run build
npm test
npm run validate:upgrades
npm --prefix deploy run artifacts:check
node scripts/formal-v5/verify-graph.mjs
```

`npm test` 排除需要外部 RPC 的 `test/fork/**`。`verify-graph.mjs` 自行启动回环地址的临时 Anvil 节点，验证完整图与三天边界，输出位于 `deploy/public/formal-v5/`；里面是本地测试地址和测试交易，不是主网部署证据。

`artifacts:check` 重新编译并比较合约内容，忽略 sourceCommit 元数据差异。不要将重新生成的本地合约地址或 artifact 覆盖到 v5 主网 manifest。

## 后台与网站

```sh
npm --prefix deploy test
npm --prefix deploy run build
corepack pnpm --dir web check
corepack pnpm --dir web contracts:check
```

完整测试入口包含历史回归用例。历史测试运行记录不等于本审核快照的完整新运行结果；本次已运行的范围见 [VALIDATION.md](VALIDATION.md)。

正式网站构建器需显式指定 `version: '5'`，默认参数仍兼容旧版本。安装依赖、提交本地修改使工作树干净后，在仓库根目录运行：

```sh
node --input-type=module <<'JS'
import { resolve } from 'node:path';
import { buildFreshProduct } from './web/scripts/build-fresh-product.mjs';
console.log(buildFreshProduct(
  resolve('deploy/ops/v5/frontend-manifest.json'),
  resolve('deploy/ops/v5/fresh-activation.json'),
  { version: '5', outputDir: resolve('web/out-v5-audit'), publicOrigin: 'https://bemine.cc.cd' },
));
JS
```

输出目录必须事先不存在。此命令只生成静态文件，不发布服务器，也不发送主网交易。后台打包入口为 `deploy/scripts/package-fresh-console.mjs` 的 `packageReviewedFreshProductBackend`；它需要完整已确认部署记录，与初始部署控制台打包入口不同。

## Fork 与线上核对

`npm run test:fork` / `npm run test:fork:firsto` 需要读取 `.env.example` 和对应脚本规定的区块参数；它们使用外部 RPC，会产生节点请求。付费节点调用不属于上述默认离线验证。

主网核对至少包含：chainId、全部代理/实现/库 runtime、Beacon implementation、Factory 与 Market/Authority 绑定、管理员与 Gas 地址、Timelock 角色和延迟、16+7 交易回执及区块哈希。已保存证据的区块是 `125317258`，不是未来持续有效的在线状态保证。

`deploy/ops/v5/install-runtime.py` 和 `verify-cutover.mjs` 是实际服务器安装/切换工具，不是普通测试入口；它们依赖受保护运维文件和旧钱包交易账本。审核者应阅读源码，不应把它们当成通用本地测试直接运行。
