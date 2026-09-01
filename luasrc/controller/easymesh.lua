-- Legacy LuCI1 (pre-23.05) menu entry for the MTK EasyMesh panel.
--
-- Fwirmwares built on LuCI2 (23.05+ / master) read htdocs/ + menu.d and do
-- NOT load Lua controllers for menu generation, whereas LuCI1 firmwares
-- ignore menu.d entirely and only register menus through luasrc/controller.
-- Both are packed together so the panel shows up on either generation.
--
-- The actual pages are JS views (htdocs/luci-static/resources/view/easymesh/*),
-- same files used by LuCI2; here they are simply registered via view() so the
-- legacy engine points at the identical views and RPC backend (luci.easymesh).

module("luci.controller.easymesh", package.seeall)

function index()
	entry({"admin", "network", "easymesh"}, firstchild(), _("EasyMesh"), 55).dependent = true

	entry({"admin", "network", "easymesh", "basic"},
		view("easymesh/basic"), _("Basic Settings"), 10).acl = "luci-app-mtk-easymesh"

	entry({"admin", "network", "easymesh", "advanced"},
		view("easymesh/advanced"), _("Advanced Settings"), 20).acl = "luci-app-mtk-easymesh"

	entry({"admin", "network", "easymesh", "topology"},
		view("easymesh/topology"), _("Topology"), 30).acl = "luci-app-mtk-easymesh"

	entry({"admin", "network", "easymesh", "maintenance"},
		view("easymesh/maintenance"), _("Backup, Restore and Reset"), 40).acl = "luci-app-mtk-easymesh"

	entry({"admin", "network", "easymesh", "about"},
		view("easymesh/about"), _("About"), 50).acl = "luci-app-mtk-easymesh"
end