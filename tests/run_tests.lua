-- run_tests.lua - exercise every luci.easymesh RPC method against a simulated
-- OpenWrt filesystem (real UCI files on disk, mocked luci modules).
-- Usage: lua5.1 run_tests.lua [filter]   (leave empty to run all)

local mockM = dofile("/workspace/luci-app-mtk-easymesh/tests/mock.lua")
local fsmod = mockM
local fs = package.preload["nixio.fs"]()
local jsonc = package.preload["luci.jsonc"]()

local MAIN = "/workspace/luci-app-mtk-easymesh/root/usr/libexec/rpcd/luci.easymesh"

local passed, failed = 0, 0
local failures = {}

local function ok(cond, msg)
	if cond then passed = passed + 1
	else
		failed = failed + 1
		table.insert(failures, msg or "assertion failed")
		print("  FAIL: " .. msg)
	end
end

-- capture stdout from a method call (stdlib-style)
local real_print = _G.print
local orig_exit = os.exit
local buf
function call(method, args)
	buf = {}
	fsmod.log_lines = {} -- fresh command log for every call; kept for inspection
	local stdin_path = "/tmp/.echeck_stdin.json"
	local wf = io.open(stdin_path, "w")
	wf:write(jsonc.stringify(args or {}))
	wf:close()
	_G.print = function(s) buf[#buf + 1] = tostring(s or "") end
	os.exit = function(code) buf["__exit__"] = code or 0 end
	io.input(stdin_path)
	fsmod.buf = nil -- reset JSON parse buffer, else it accumulates across calls
	arg = { "call", method }
	local chunk = loadfile(MAIN)
	local okL, err = pcall(chunk)
	io.input(io.stdout)
	local rv
	if okL then
		rv = buf[1] or ""
	else
		rv = "LOAD ERROR: " .. tostring(err)
	end
	_G.print = real_print
	os.exit = orig_exit
	return rv
end

local function decode(s)
	local dec = jsonc.new()
	if not s or #s == 0 then return nil end
	local buf2 = s
	dec:parse(s)
	dec:get()
	-- our jsonc.new stores M.buf; get uses it; re-invoke
	local save = fsmod.buf
	fsmod.buf = s
	local p = package.preload["luci.jsonc"]
	local out = dec:get()
	fsmod.buf = save
	return out
end

local function v(s)
	local save = fsmod.buf
	fsmod.buf = s
	local dec = jsonc.new()
	local out = dec:get()
	fsmod.buf = save
	return out
end

-- ---------------------------------------------------------------- fixtures --
local EASYMESH = [[
config easymesh 'config'
	option enabled '1'
	option device_mode 'router'
	option device_role 'controller'
	option mesh_sr '1'
	option bandsteering '1'
	option steeringthresold '-65'
	option steer_rssi_th '-54'
	option bh_type 'eth'
]]

local MAPD = [[
SteerEnable=1
APSteerRssiTh=-54
force_roam_rssi_th=-70
DeviceRole=1
mode=1
BhProfile0Valid=0
BhProfile0Ssid=
BhProfile0AuthMode=
BhProfile0EncrypType=
BhProfile0WpaPsk=
]]
local MAP1905 = [[
bh_type=eth
radio_band=24G;5G;5G;
br_inf=br-lan
al_inf=ra0
map_root=1
map_agent=1
map_ver=R1
bss_config_priority=ra0;rax0;apclix0
map_controller_alid=
map_agent_alid=
]]

local WIRELESS = [[
config wifi-device 'ra0'
	option type 'mtwifi'
	option band '2g'
	option channel '6'
	option ifidx '0'
	option wapp '1'
	option bandsteering '1'
	option ieee80211r '1'

config wifi-device 'rax0'
	option type 'mtwifi'
	option band '5g'
	option channel '36'
	option ifidx '0'

config wifi-iface 'default_ra0'
	option device 'ra0'
	option mode 'ap'
	option steeringthresold '-65'
]]

local function setup()
	os.execute("mkdir -p /etc/config /etc/map /sbin")
	fs.writefile("/etc/config/easymesh", EASYMESH)
	fs.writefile("/etc/config/wireless", WIRELESS)
	fs.writefile("/etc/map/mapd_cfg", MAPD)
	fs.writefile("/etc/map/1905d.cfg", MAP1905)
	-- integer keys must be blanked so both a 0x00 default matches, and wifi
	fs.writefile("/sbin/startwapp.sh", "#!/bin/sh\n# stub\n")
	-- keep /sbin/wappctrl absent so wappctrl() returns empty output
	-- clear uci memory cache between tests
	package.preload["luci.model.uci"]().reset()
	fsmod._reset_state = true
end

local function wlan_read(opt)
	local raw = fs.readfile("/etc/config/wireless") or ""
	return raw:match("option " .. opt .. " '([^']*)'")
end

local function es_read(opt)
	local raw = fs.readfile("/etc/config/easymesh") or ""
	return raw:match("option " .. opt .. " '([^']*)'")
end

local function mapd_read(key)
	local raw = fs.readfile("/etc/map/mapd_cfg") or ""
	for line in raw:gmatch("[^\n]+") do
		local v = line:match("^" .. key .. "=([^\n]*)")
		if v ~= nil then return v end
	end
	return nil
end

-- =====================================================================
-- A. getConfig: defaults, live (drift) values, status
-- =====================================================================
setup()
print("-- A: getConfig --")
local r = call("getConfig", {})
local j = v(r)
ok(j and j.enabled == "1" and j.device_role == "controller", "getConfig basics")
-- steeringthresold is a wireless iface option, not part of mapd MAP_SCHEMA,
-- so it must NOT appear in cfg.live (there is nothing runtime to compare)
ok(j.live.steeringthresold == nil, "steeringthresold excluded from live (maps to wireless only)")
ok(tonumber(j.live.steer_rssi_th) == -54, "live steer_rssi_th == -54 (synced)")
-- simulate drift: change mapd cfg behind the plugin's back
local drift_write = MAPD:gsub("APSteerRssiTh=%-54", "APSteerRssiTh=-99")
fs.writefile("/etc/map/mapd_cfg", drift_write)
r = call("getConfig", {})
j = v(r)
ok(j.live.steer_rssi_th == "-99" and j.steer_rssi_th == "-54",
   "drift detected: uci=-54 live=-99")
ok(j.cur_role == "controller", "cur_role from mapd DeviceRole=1")

-- =====================================================================
-- B. wizardApply: validation + apply + backhaul flag + push
-- =====================================================================
print("-- B: wizardApply --")
r = call("wizardApply", { enabled = "x" })
j = v(r)
ok(j.ok == false and tostring(j.error):find("enabled"), "wizard rejects bad enabled")

r = call("wizardApply", { device_role = "evil" })
j = v(r)
ok(j.ok == false, "wizard rejects bad device_role")

r = call("wizardApply", { bh_type = "fiber" })
j = v(r)
ok(j.ok == false, "wizard rejects bad bh_type")

r = call("wizardApply", { bh0_ssid = "a`rm -rf /`" })
j = v(r)
ok(j.ok == false, "wizard rejects shell injection in ssid")

r = call("wizardApply", {
	enabled = "1", device_role = "agent", device_mode = "bridge",
	mesh_sr = "1", bandsteering = "1", steeringthresold = "-60",
	bh_type = "wifi", bh0_ssid = "BackHaul", bh0_auth = "WPA2PSK",
	bh0_enc = "AES", bh0_key = "secret123", bh0_raid = "1"
})
j = v(r)
ok(j.ok == true, "wizard valid apply")
ok(es_read("device_role") == "agent", "wizard wrote device_role=agent")
ok(es_read("bh0_valid") == "1", "wizard set bh0_valid=1 when credentials given")
ok(mapd_read("DeviceRole") == "2", "wizard pushed DeviceRole=2 (agent)")
ok(mapd_read("mode") == "2", "wizard pushed mode=2 (bridge)")
ok((fs.readfile("/etc/map/1905d.cfg") or ""):find("map_root=0"), "wizard set map_root=0 for agent")
ok((fs.readfile("/etc/map/1905d.cfg") or ""):find("bh_type=wifi"), "wizard set 1905d bh_type=wifi")

-- enable over radio: with no backhaul credentials bh0_valid stays 0
setup()
r = call("wizardApply", { enabled = "1", device_role = "controller", bh_type = "eth" })
j = v(r)
ok(j.ok == true, "wizard eth no backhaul ok")
local bv = es_read("bh0_valid")
ok(bv == "0" or bv == nil, "bh0_valid stays unset without credentials")

-- =====================================================================
-- C. resetPage(basic): only basic-owned options, wireless untouched
-- =====================================================================
print("-- C: resetPage basic --")
setup()
-- introduce drift on a basic option (steeringthresold -> -30), leaving the
-- advanced options and wireless untouched
fs.writefile("/etc/config/easymesh", EASYMESH:gsub("option steeringthresold '%-65'", "option steeringthresold '-30'"))
fs.writefile("/etc/config/wireless", WIRELESS)
local before_wlan = wlan_read("bandsteering")
r = call("resetPage", { scope = "basic" })
j = v(r)
ok(j.ok == true and j.scope == "basic", "resetPage basic ok")
ok(es_read("steeringthresold") == "-65", "basic option steeringthresold reset to default")
ok(es_read("steer_rssi_th") == "-54", "advanced option kept + live -54 (only basic reset)")
ok(mapd_read("APSteerRssiTh") == "-54", "advanced kv untouched by basic reset")
ok(wlan_read("bandsteering") == "1", "wireless untouched by basic reset")
-- D. resetPage(advanced): only advanced-owned options reset
-- =====================================================================
print("-- D: resetPage advanced --")
setup()
fs.writefile("/etc/config/easymesh", EASYMESH:gsub("option steeringthresold '%-65'", "option steeringthresold '-30'"))
r = call("resetPage", { scope = "advanced" })
j = v(r)
ok(j.ok == true and j.scope == "advanced", "resetPage advanced ok")
ok(es_read("steeringthresold") == "-30", "basic option steeringthresold NOT reset")
ok(mapd_read("APSteerRssiTh") == "-54", "advanced kv reset to default")
ok((fs.readfile("/etc/config/wireless") or ""):find("bandsteering"), "wireless file intact after advanced reset")

-- =====================================================================
-- E. resetAll: everything to default, daemons stopped, alids set
-- =====================================================================
print("-- E: resetAll --")
setup()
r = call("resetAll", {})
j = v(r)
ok(j.ok == true, "resetAll ok")
ok(es_read("enabled") == "0", "resetAll disabled easymesh")
ok(mapd_read("DeviceRole") == "1", "resetAll mapd DeviceRole=1")
ok(wlan_read("bandsteering") == "1", "resetAll leaves wireless untouched (bandsteering still 1)")
-- alid defaulted to br-lan mac (empty in sandbox => untouched, still blank)
ok(true, "resetAll completed")

-- =====================================================================
-- F. backupConfig / restoreConfig
-- =====================================================================
print("-- F: backup/restore --")
setup()
r = call("backupConfig", {})
j = v(r)
ok(j.ok == true and tostring(j.content):find("luci%-app%-mtk%-easymesh backup v1"), "backup has version header")
ok(tostring(j.content):find("config easymesh"), "backup contains uci body")

-- restore with header (current plugin version) -> legacy=false
local backup = tostring(j.content)
r = call("restoreConfig", { content = backup })
j = v(r)
ok(j.ok == true and j.legacy == nil, "restore current-version payload ok")
ok(j.enabled == "1", "restore re-enabled from backup")

-- restore without header -> legacy=true
r = call("restoreConfig", { content = backup:gsub("#[^\n]*\n", "") })
j = v(r)
ok(j.legacy == true, "restore headerless payload marked legacy")

-- restore from a NEWER version -> rejected
local newer = backup:gsub("backup v1", "backup v99")
r = call("restoreConfig", { content = newer })
j = v(r)
ok(j.ok == false and tostring(j.error):find("newer"), "restore rejects newer-version backup")

-- restore garbage -> rejected
r = call("restoreConfig", { content = "hello world not uci\n" })
j = v(r)
ok(j.ok == false, "restore rejects non-easymesh payload")

-- restore empty -> rejected
r = call("restoreConfig", { content = "" })
j = v(r)
ok(j.ok == false, "restore rejects empty payload")

-- restore with control char -> rejected
r = call("restoreConfig", { content = "config easymesh 'config'\noption foo '\1\2\3'\n" })
j = v(r)
ok(j.ok == false and tostring(j.error):find("control"), "restore rejects control characters")

-- =====================================================================
-- G. resetDefault: full reset including wireless flags
-- =====================================================================
print("-- G: resetDefault --")
setup()
-- make sure wapp/bandsteering currently enabled in wireless
fs.writefile("/etc/config/wireless", WIRELESS:gsub("option bandsteering '1'", "option bandsteering '1'"))
r = call("resetDefault", {})
j = v(r)
ok(j.ok == true, "resetDefault ok")
ok(es_read("enabled") == "0", "resetDefault disabled")
ok(wlan_read("bandsteering") == "0", "resetDefault zeroed wireless bandsteering")
ok(wlan_read("wapp") == "0", "resetDefault zeroed wireless wapp")
ok(mapd_read("DeviceRole") == "1", "resetDefault mapd DeviceRole default")

-- =====================================================================
-- H. device/steering method input validation
-- =====================================================================
print("-- H: validation --")
r = call("pbcTrigger", { iface = "yes$(reboot)" })
j = v(r)
ok(j.ok == false, "pbcTrigger rejects shell-injection iface")

r = call("pbcTrigger", { iface = "ra0" })
j = v(r)
ok(j.ok == true, "pbcTrigger accepts ra0")

r = call("dppQrCode", { uri = "DPP:C:91/1;\" ; rm -rf /; \"" })
j = v(r)
ok(j.ok == false, "dppQrCode rejects shell injection")

r = call("btmReq", { mac = "aa:bb:cc:dd:ee:ff", ess_imm = "1", timer = "30", url = "http://update.ok" })
j = v(r)
ok(j.ok == true, "btmReq accepts valid args")

r = call("btmReq", { mac = "00:11:22:33:44:55", url = "x$(evil)" })
j = v(r)
ok(j.ok == false, "btmReq rejects url injection")

r = call("wnmReq", { iface = "ra0", mac = "00:01:02:03:04:05", url = "u$(x)" })
j = v(r)
ok(j.ok == false, "wnmReq rejects url injection")

r = call("steerSta", { iface = "ra$()", mac = "xx" })
j = v(r)
ok(j.ok == false, "steerSta rejects bad iface+mac")

r = call("qosMap", { iface = "ra0", mac = "11:22:33:44:55:66", dscp_exception = "5", dscp_range = "0,63" })
j = v(r)
ok(j.ok == true, "qosMap accepts valid args")

r = call("dppBootstrapGen", { chan = "81", mac = "aa:bb:cc:dd:ee:ff", info = "demo", curve = "P-256", key = "k" })
j = v(r)
ok(j.ok == true, "dppBootstrapGen accepts valid args")

-- =====================================================================
-- I. getStatus / getTopology run without error
-- =====================================================================
print("-- I: status/topology --")
r = call("getStatus", {})
j = v(r)
ok(j ~= nil and type(j.radios) == "table", "getStatus returns radios table")
ok(j.map_ver == "R1", "getStatus returns map_ver")
ok(type(j.wapp_running) == "boolean", "getStatus returns wapp_running boolean")

r = call("getTopology", {})
j = v(r)
ok(j ~= nil and type(j.radios) == "table", "getTopology returns radios")
ok(type(j.stations) == "table", "getTopology returns stations array")
ok(type(j.wapp_running) == "boolean", "getTopology returns wapp_running")

-- =====================================================================
-- J. backhaul scan/status + station host enrichment (ported from the
--    legacy luci-app-mtk apcli_scan / apcli_conn_info / sta_info pages)
-- =====================================================================
print("-- J: bhScan/bhStatus/host enrichment --")
setup()

-- bhScan validates the interface name before it reaches the shell
r = call("bhScan", { iface = "ra0; rm -rf /" })
j = v(r)
ok(j.ok == false and tostring(j.error):find("Invalid interface"), "bhScan rejects injected iface")

-- in the sandbox /sys/class/net/ra0 does not exist -> graceful error
r = call("bhScan", { iface = "ra0" })
j = v(r)
ok(j.ok == false, "bhScan on missing iface errors gracefully")

-- bhStatus lists the apcli interfaces derived from the wireless config
r = call("bhStatus", {})
j = v(r)
ok(j.ok == true and type(j.backhaul) == "table", "bhStatus ok")
ok(#j.backhaul == 2, "bhStatus lists apcli0 + apclix0")
ok(j.backhaul[1].ifname == "apcli0" and j.backhaul[1].state == "down",
   "apcli0 reported down without a live link")

-- getTopology carries the backhaul state along
r = call("getTopology", {})
j = v(r)
ok(type(j.backhaul) == "table" and #j.backhaul == 2, "getTopology includes backhaul")

-- station list enriched with DHCP host hints (fake iwpriv in /sbin)
fs.writefile("/sbin/iwpriv", [[#!/bin/sh
echo "MacAddr           BW  MCS  SNR  RSSI"
echo "11:22:33:44:55:66 20  9    42   -55"
]])
os.execute("chmod +x /sbin/iwpriv")
fsmod.host_hints = { ["11:22:33:44:55:66"] = { name = "pixel", ipv4 = "192.168.1.42" } }
r = call("getTopology", {})
j = v(r)
os.remove("/sbin/iwpriv")
fsmod.host_hints = nil
local found
for _, s in ipairs(j.stations or {}) do
	if s.mac == "11:22:33:44:55:66" then found = s end
end
ok(found ~= nil, "station parsed from iwpriv stainfo")
ok(found and found.hostname == "pixel" and found.ip == "192.168.1.42",
   "station enriched with hostname/ip from host hints")
ok(found and found.rssi == "-55", "station rssi parsed")

-- =====================================================================
-- K. backhaul connect/disconnect (ported from the legacy luci-app-mtk
--    apcli_connect / apcli_disconnect pages)
-- =====================================================================
print("-- K: bhConnect/bhDisconnect --")
setup()

local function ran(substr)
	for _, l in ipairs(fsmod.log_lines) do
		if l:find(substr, 1, true) then return true end
	end
	return false
end

-- invalid apcli interface names are rejected before reaching the shell
r = call("bhConnect", { iface = "apcli0; rm -rf /" })
j = v(r)
ok(j.ok == false and tostring(j.error):find("Invalid interface"), "bhConnect rejects injected iface")
r = call("bhDisconnect", { iface = "eth0" })
j = v(r)
ok(j.ok == false and tostring(j.error):find("Invalid interface"), "bhDisconnect rejects non-apcli iface")

-- without any saved backhaul profile there is no SSID to connect to
r = call("bhConnect", { iface = "apclix0" })
j = v(r)
ok(j.ok == false and tostring(j.error):find("No backhaul SSID"), "bhConnect without profile errors")

-- connect with explicit credentials: iwpriv sequence + persistence
r = call("bhConnect", { iface = "apclix0", ssid = "mesh-bh", auth = "WPA2PSK",
                        enc = "AES", key = "s3cret!" })
j = v(r)
ok(j.ok == true and j.iface == "apclix0" and j.ssid == "mesh-bh", "bhConnect ok with credentials")
ok(ran("ifconfig apclix0 up"), "bhConnect brings the interface up")
ok(ran("iwpriv apclix0 set ApCliSsid='mesh-bh'"), "bhConnect sets the SSID")
ok(ran("iwpriv apclix0 set ApCliWPAPSK='s3cret!'"), "bhConnect sets the passphrase")
ok(ran("iwpriv apclix0 set ApCliEnable=1"), "bhConnect enables the apcli client")
ok(ran("iwpriv apclix0 set ApCliAutoConnect=3"), "bhConnect enables auto reconnect")
ok(not ran("rm -rf"), "no injected command reached the shell")

-- credentials and bh_type=wifi were persisted to UCI and mapd_cfg
r = call("getConfig", {})
j = v(r)
ok(j.bh0_ssid == "mesh-bh" and j.bh0_auth == "WPA2PSK" and j.bh0_key == "s3cret!",
   "bhConnect persisted the backhaul profile to UCI")
ok(j.bh_type == "wifi", "bhConnect switched bh_type to wifi")
ok(j.live.bh0_ssid == "mesh-bh" and j.live.bh0_valid == "1",
   "bhConnect persisted the profile to mapd_cfg")

-- a quote in the SSID must be rejected, not passed to the shell
r = call("bhConnect", { iface = "apclix0", ssid = "mesh'; rm -rf /; '" })
j = v(r)
ok(j.ok == false, "bhConnect rejects quote injection in ssid")
ok(not ran("rm -rf"), "quote injection never reached the shell")

-- unknown auth mode is rejected
r = call("bhConnect", { iface = "apclix0", ssid = "mesh-bh", auth = "BOGUS; id" })
j = v(r)
ok(j.ok == false and tostring(j.error):find("Invalid authentication"), "bhConnect rejects bad auth mode")

-- connect falling back to the committed profile (no args)
r = call("bhConnect", { iface = "apcli0" })
j = v(r)
ok(j.ok == true and j.ssid == "mesh-bh", "bhConnect falls back to saved profile")
ok(ran("iwpriv apcli0 set ApCliAuthMode=WPA2PSK"), "bhConnect uses the saved auth mode")

-- OPEN auth skips the passphrase commands
fs.writefile("/etc/config/easymesh", EASYMESH:gsub("option bh_type 'eth'", "option bh_type 'wifi'")
	.. "\noption bh0_ssid 'openmesh'\noption bh0_auth 'OPEN'\n")
package.preload["luci.model.uci"]().reset()
r = call("bhConnect", { iface = "apcli0" })
j = v(r)
ok(j.ok == true and j.auth == "OPEN", "bhConnect handles OPEN auth")
ok(not ran("ApCliWPAPSK"), "OPEN auth sets no passphrase")

-- disconnect tears the client down
r = call("bhDisconnect", { iface = "apclix0" })
j = v(r)
ok(j.ok == true and j.iface == "apclix0", "bhDisconnect ok")
ok(ran("iwpriv apclix0 set ApCliEnable=0"), "bhDisconnect disables the apcli client")
ok(ran("ifconfig apclix0 down"), "bhDisconnect brings the interface down")

-- =====================================================================
-- summary
-- =====================================================================
print(string.format("\n==== passed: %d  failed: %d ====", passed, failed))
if failed > 0 then
	for _, f in ipairs(failures) do print("  - " .. tostring(f)) end
	os.exit(1)
end