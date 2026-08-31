-- mock.lua - inject fake OpenWrt modules so luci.easymesh can run on a
-- plain desktop Lua 5.1 interpreter. Loaded via package.preload.
--
-- Provides:
--   luci.jsonc         : stringify + a streaming parse()/get() object
--   nixio.fs           : readfile / writefile / access (thin os wrapper)
--   luci.sys           : call() that shells out and records invocations
--   luci.model.uci     : real UCI-file-backed cursor (parse / set / commit)

local M = {}

-- stored so the test harness can inspect what sys.call() ran
M.log_lines = {}

------------------------------------------------------------------------------
-- luci.jsonc
------------------------------------------------------------------------------
local jsonc = {}

local function escape_str(s)
	s = tostring(s or "")
	s = s:gsub("\\", "\\\\")
	s = s:gsub('"', '\\"')
	s = s:gsub("\n", "\\n")
	s = s:gsub("\r", "\\r")
	s = s:gsub("\t", "\\t")
	s = s:gsub("[%z\1-\31]", function(c) return string.format("\\u%04x", c:byte()) end)
	return '"' .. s .. '"'
end

local function encode(v, indent, lvl)
	lvl = lvl or 0
	local pad = string.rep(indent or "", (indent and lvl) or 0)
	local pad1 = string.rep(indent or "", (indent and lvl + 1) or 0)
	local t = type(v)
	if t == "nil" then return "null"
	elseif t == "boolean" then return v and "true" or "false"
	elseif t == "number" then return tostring(v)
	elseif t == "string" then return escape_str(v)
	elseif t == "table" then
		local is_array = true
		local n = 0
		for k in pairs(v) do
			n = n + 1
			if type(k) ~= "number" then is_array = false end
		end
		if n == 0 then return "[]" end
		if is_array then
			local parts = {}
			for i = 1, n do
				table.insert(parts, encode(v[i], indent, lvl + 1))
			end
			local sep = indent and (",\n" .. pad1) or ","
			local body = table.concat(parts, sep)
			if indent then body = "\n" .. body .. "\n" .. pad end
			return "[" .. body .. "]"
		end
		-- object
		local keys = {}
		for k in pairs(v) do table.insert(keys, k) end
		table.sort(keys, function(a, b) return tostring(a) < tostring(b) end)
		local parts = {}
		for _, k in ipairs(keys) do
			local ek = escape_str(k) .. ":" .. (indent and " " or "") .. encode(v[k], indent, lvl + 1)
			table.insert(parts, (indent and pad1 or "") .. ek)
		end
		local sep = indent and (",\n" .. pad1) or ","
		local body = table.concat(parts, sep)
		if indent then body = "\n" .. body .. "\n" .. pad end
		return "{" .. body .. "}"
	else
		return "null"
	end
end

function jsonc.stringify(v)
	return encode(v)
end

-- minimal JSON decoder (objects/arrays/strings/numbers/booleans/null)
local function new_decoder()
	local pos = 1
	local function skip()
		local s = M.buf
		while pos <= #s and s:sub(pos, pos):match("%s") do pos = pos + 1 end
	end
	local function fail(msg)
		error("jsonc parse error at " .. pos .. ": " .. (msg or "unknown"), 0)
	end
	local function parse_value()
		skip()
		local s = M.buf
		if pos > #s then fail("unexpected eof") end
		local c = s:sub(pos, pos)
		if c == "{" then
			pos = pos + 1
			local o = {}
			skip()
			if s:sub(pos, pos) == "}" then pos = pos + 1 return o end
			while true do
				skip()
				local k = parse_value()
				skip()
				if s:sub(pos, pos) ~= ":" then fail("expected ':'") end
				pos = pos + 1
				o[k] = parse_value()
				skip()
				local d = s:sub(pos, pos)
				if d == "}" then pos = pos + 1 break
				elseif d == "," then pos = pos + 1
				else fail("expected ',' or '}'") end
			end
			return o
		elseif c == "[" then
			pos = pos + 1
			local a = {}
			skip()
			if s:sub(pos, pos) == "]" then pos = pos + 1 return a end
			while true do
				table.insert(a, parse_value())
				skip()
				local d = s:sub(pos, pos)
				if d == "]" then pos = pos + 1 break
				elseif d == "," then pos = pos + 1
				else fail("expected ',' or ']'") end
			end
			return a
		elseif c == '"' then
			pos = pos + 1
			local out = {}
			while pos <= #s do
				local ch = s:sub(pos, pos)
				if ch == '"' then pos = pos + 1 break end
				if ch == "\\" then
					pos = pos + 1
					local e = s:sub(pos, pos)
					if e == "n" then table.insert(out, "\n")
					elseif e == "t" then table.insert(out, "\t")
					elseif e == "r" then table.insert(out, "\r")
					elseif e == "u" then
						local h = s:sub(pos + 1, pos + 4)
						table.insert(out, string.char(tonumber(h, 16) and tonumber(h, 16) or 63))
						pos = pos + 4
					else table.insert(out, e) end
					pos = pos + 1
				else
					table.insert(out, ch)
					pos = pos + 1
				end
			end
			return table.concat(out)
		else
			local word = s:match("^[%w%.-]+", pos)
			if word == "true" then pos = pos + #word return true end
			if word == "false" then pos = pos + #word return false end
			if word == "null" then pos = pos + #word return nil end
			if word and word:match("^-?%d") then
				pos = pos + #word
				return tonumber(word) or 0
			end
			fail("unexpected char '" .. c .. "'")
		end
	end
	return parse_value
end

function jsonc.new()
	local obj = { _STATE = "init" }
	function obj:parse(chunk)
		if self._STATE == "done" then return true end
		M.buf = (M.buf or "") .. (chunk or "")
		return true
	end
	function obj:get()
		local decode = new_decoder()
		if not M.buf or #M.buf == 0 then return nil end
		local rv = decode()
		return rv
	end
	return obj
end
package.preload["luci.jsonc"] = function() return jsonc end

------------------------------------------------------------------------------
-- nixio.fs
------------------------------------------------------------------------------
local fs = {}
local function raw_read(p)
	local f = io.open(p, "rb")
	if not f then return nil end
	local s = f:read("*a")
	f:close()
	return s
end
function fs.readfile(p)
	local s = raw_read(p)
	return s
end
function fs.writefile(p, data)
	local f = io.open(p, "wb")
	if not f then return nil end
	f:write(data)
	f:close()
	return true
end
function fs.access(p)
	local f = io.open(p, "rb")
	if f then f:close(); return true end
	return nil
end
function fs.rmdir(p)
	os.remove(p)
end
package.preload["nixio.fs"] = function() return fs end

------------------------------------------------------------------------------
-- luci.sys
------------------------------------------------------------------------------
local sys = {}
function sys.call(cmd)
	M.log_lines[#M.log_lines + 1] = "sys.call: " .. tostring(cmd)
	local ok = os.execute("/bin/sh -c '" .. tostring(cmd):gsub("'", "'\\''") .. "'")
	return (ok == true) and 0 or 1
end
-- host hints table: [mac] = { name = "...", ipv4 = "..." };
-- tests can override M.host_hints before invoking a method
sys.net = {}
function sys.net.host_hints()
	local hints = M.host_hints or {}
	if type(hints) == "function" then return hints() end
	return hints
end
package.preload["luci.sys"] = function() return sys end

------------------------------------------------------------------------------
-- luci.model.uci
------------------------------------------------------------------------------
-- UCI file layout on disk: a file per config name under /etc/config/.
-- We keep in-memory parsed copies; each cursor() re-reads from disk so
-- behaviour matches the real daemon (committed changes persist to file,
-- uncommitted changes are lost when a new cursor is created).
local uci_mem = {}   -- [configname] = { [type] = { [secname] = {...} } }

local function parse_file(path)
	local cfg = {}
	local cur_type, cur_sec
	local f = io.open(path, "rb")
	if not f then return cfg end
	for line in f:lines() do
		local s = line:gsub("%s+$", ""):gsub("^%s+", "")
		if #s == 0 or s:sub(1, 1) == "#" then
			-- fall through
		elseif s:match("^config%s+") then
			local tname, secname = s:match("^config%s+(%S+)%s*['\"]?([^'\"]*)['\"]?")
			cur_type = tname
			cur_sec = (secname ~= nil and secname ~= "") and secname or ("__anon_" .. tostring(#cfg))
			cfg[cur_type] = cfg[cur_type] or {}
			cfg[cur_type][cur_sec] = cfg[cur_type][cur_sec] or {}
			local sec = cfg[cur_type][cur_sec]
			sec[".name"] = cur_sec
			sec[".type"] = tname
		elseif s:match("^option%s+") then
			local k, v = s:match("^option%s+(%S+)%s*(.*)$")
			if k and cur_type and cur_sec then
				v = (v ~= "") and v:match("^['\"](.*)['\"]$") or ""
				cfg[cur_type][cur_sec][k] = v or ""
			end
		elseif s:match("^list%s+") then
			local k, v = s:match("^list%s+(%S+)%s*(.*)$")
			if k and cur_type and cur_sec then
				local sec = cfg[cur_type][cur_sec]
				sec[k] = sec[k] or {}
				table.insert(sec[k], (v or ""):match("^['\"](.*)['\"]$") or "")
			end
		end
	end
	f:close()
	return cfg
end

local function uci_path(name)
	return "/etc/config/" .. name
end

local function load_cfg(name)
	if uci_mem[name] == nil then
		uci_mem[name] = parse_file(uci_path(name))
	end
	return uci_mem[name]
end

local function cursor_table(name)
	return load_cfg(name)
end

local function new_cursor()
	local self = {}
	function self:get(cfg, sec, opt)
		local c = cursor_table(cfg)
		if not c then return nil end
		for t, secs in pairs(c) do
			local s = secs[sec]
			if s and (s[".type"] == t) then
				if opt == nil then return s end
				if type(s[opt]) == "table" then
					return s[opt]
				end
				local v = s[opt]
				return v
			end
		end
		return nil
	end
	function self:set(cfg, sec, opt, val)
		local c = cursor_table(cfg)
		-- locate section across types
		local found
		for t, secs in pairs(c) do
			if secs[sec] then found = secs[sec] break end
		end
		if not found then
			-- create under a default type
			c["__default__"] = c["__default__"] or {}
			found = c["__default__"]
			found[sec] = { [".name"] = sec, [".type"] = "__default__" }
			found = found[sec]
		end
		if val == nil or val == false then
			found[opt] = nil
		else
			found[opt] = tostring(val)
		end
	end
	function self:foreach(cfg, type, cb)
		local c = cursor_table(cfg)
		local secs = c[type]
		if not secs then return end
		for secname, s in pairs(secs) do
			s[".name"] = secname
			s[".type"] = type
			cb(s)
		end
	end
	function self:commit(cfg)
		local c = cursor_table(cfg)
		-- render back to file
		local out = {}
		local seen_secs = {}
		for t, secs in pairs(c) do
			if t ~= "__default__" then
				for secname, s in pairs(secs) do
					table.insert(out, string.format("config %s '%s'", t, secname))
					for k, v in pairs(s) do
						-- skip meta, skip sections already printed
						if k ~= ".name" and k ~= ".type" then
							if type(v) == "table" then
								for _, item in ipairs(v) do
									table.insert(out, string.format("\tlist %s '%s'", k, tostring(item)))
								end
							else
								table.insert(out, string.format("\toption %s '%s'", k, tostring(v)))
							end
						end
					end
					table.insert(out, "")
				end
			end
		end
		local content = table.concat(out, "\n")
		local f = io.open(uci_path(cfg), "wb")
		if not f then return end
		f:write(content)
		f:close()
	end
	return self
end

uci = {}
function uci.cursor()
	return new_cursor()
end
-- test hook: drop the in-memory cache so the next cursor() re-reads from disk
function uci.reset()
	uci_mem = {}
end

package.preload["luci.model.uci"] = function() return uci end

return M