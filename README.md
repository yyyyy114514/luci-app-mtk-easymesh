# luci-app-mtk-easymesh

> 反馈：https://www.right.com.cn/forum/forum.php?mod=viewthread&tid=8487526（如没有恩山账号提issues也行）

LuCI 界面，用于在 OpenWrt / ImmortalWrt（MediaTek MT7981 / MT7986 + mtwifi 闭源驱动）上控制 MTK EasyMesh（MAP / wapp / bs20）。

## 功能

- Basic：开关 EasyMesh、设置 Device Mode（Router/Bridge）/ Device Role（Controller/Agent/Auto）、PBC 入网、恢复默认
- DPP / Onboarding：DPP URI 提交/生成（含 chan/mac/info/curve/key 参数）、bootstrap 查询/删除、configurator 增删/签名/取密钥、auth init、GAS controller、PKEX、chirp、onboard type、presence/reconfig、CCE indication、dev_set_cfg、重置 DPP / MAPD 用户配置
- Advanced：漫游/引导调优（SteerEnable、各类 RSSI 阈值、扫描阈值、Metric 上报等）、MAP 特性开关
- Backhaul：回程类型（eth/wifi，支持运行时切换）、band 优先级、BhProfile 0-2 无线回程凭据、bss_config_priority
- Channel Planning / Optimization：ChPlanning 全量参数（含 R2 阈值/EDCCA/OBSS/ChUtil）、Network Optimization 全量参数、CU 过载阈值
- Interfaces / Device Info：lan/wan 接口、br_inf/al_inf、MAP 版本、GTK rekey、ALID 覆盖、Data Element 信息
- Runtime Tools：wapp 重载/版本查询、steer_sta、BTM/WNM 请求、QoS Map、Proxy ARP 表
- Status：wapp / bs20 运行状态、AL MAC、MAP 版本、角色、ALID、无线列表
- Topology：运行时拓扑与在线客户端展示

## i18n

默认界面为英文。`po/templates/mtk-easymesh.pot` 为翻译模板，后续添加
`po/zh_Hans/mtk-easymesh.po` 后，构建系统会自动生成
`luci-i18n-mtk-easymesh-zh-cn` 汉化包，安装即可切换中文。
我的i18n中文仓库：https://github.com/yyyyy114514/luci-app-mtk-easymesh-i18n-zhcn （还未测试）

## 依赖

- `mtwifi-cfg`（含 wapp / 1905d 闭源驱动配置）
- `mtwifi-wapp`
- `lua-cjson`

## 编译

放到 `package/` 下，然后在固件根目录：

```sh
make package/luci-app-mtk-easymesh/compile
```

或直接在 menuconfig 中启用 `luci-app-mtk-easymesh` 后整体编译。

## 使用方法

编译进固件后，LuCI → 网络 → EasyMesh 即可配置。保存并应用后，插件会把配置写入
`/etc/map/mapd_cfg`、`/etc/map/1905d.cfg` 并重启 wapp / bs20。
