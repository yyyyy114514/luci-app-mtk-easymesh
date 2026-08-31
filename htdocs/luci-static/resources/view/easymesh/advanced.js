'use strict';
'require form';
'require rpc';
'require uci';
'require ui';
'require view';

var callGetConfig = rpc.declare({
	object: 'luci.easymesh',
	method: 'getConfig',
	expect: { '': {} }
});

var callGetStatus = rpc.declare({
	object: 'luci.easymesh',
	method: 'getStatus',
	expect: { '': {} }
});

var callApplyConfig = rpc.declare({
	object: 'luci.easymesh',
	method: 'applyConfig',
	expect: { '': {} }
});

var callResetPage = rpc.declare({
	object: 'luci.easymesh',
	method: 'resetPage',
	params: [ 'scope' ],
	expect: { '': {} }
});

var callWappReload = rpc.declare({
	object: 'luci.easymesh',
	method: 'wappReload',
	params: [ 'iface' ],
	expect: { '': {} }
});

var callWappVersion = rpc.declare({
	object: 'luci.easymesh',
	method: 'wappVersion',
	params: [ 'iface' ],
	expect: { '': {} }
});

var callSteerSta = rpc.declare({
	object: 'luci.easymesh',
	method: 'steerSta',
	params: [ 'iface', 'mac' ],
	expect: { '': {} }
});

var callBtmReq = rpc.declare({
	object: 'luci.easymesh',
	method: 'btmReq',
	params: [ 'mac', 'ess_imm', 'timer', 'url' ],
	expect: { '': {} }
});

var callDppQrCode = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppQrCode',
	params: [ 'uri' ],
	expect: { '': {} }
});

var callDppBootstrapGen = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppBootstrapGen',
	params: [ 'chan', 'mac', 'info', 'curve', 'key' ],
	expect: { '': {} }
});

var callDppBootstrapGetUri = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppBootstrapGetUri',
	params: [ 'id' ],
	expect: { '': {} }
});

var callDppBootstrapInfo = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppBootstrapInfo',
	params: [ 'id' ],
	expect: { '': {} }
});

var callDppBootstrapRemove = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppBootstrapRemove',
	params: [ 'id' ],
	expect: { '': {} }
});

var callDppStart = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppStart',
	expect: { '': {} }
});

var callDppListen = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppListen',
	params: [ 'freq' ],
	expect: { '': {} }
});

var callDppStopListen = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppStopListen',
	expect: { '': {} }
});

var callDppSetBhWifi = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppSetBhWifi',
	expect: { '': {} }
});

var callDppResetConfig = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppResetConfig',
	expect: { '': {} }
});

var callDppResetMapdUserConfig = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppResetMapdUserConfig',
	expect: { '': {} }
});

var callDppConfiguratorAdd = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppConfiguratorAdd',
	params: [ 'curve', 'key' ],
	expect: { '': {} }
});

var callDppConfiguratorRemove = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppConfiguratorRemove',
	params: [ 'id' ],
	expect: { '': {} }
});

var callDppConfiguratorSign = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppConfiguratorSign',
	params: [ 'id' ],
	expect: { '': {} }
});

var callDppConfiguratorGetKey = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppConfiguratorGetKey',
	params: [ 'id' ],
	expect: { '': {} }
});

var callDppAuthInit = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppAuthInit',
	params: [ 'peer', 'own' ],
	expect: { '': {} }
});

var callDppControllerStart = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppControllerStart',
	expect: { '': {} }
});

var callDppControllerStop = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppControllerStop',
	expect: { '': {} }
});

var callDppPkexAdd = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppPkexAdd',
	params: [ 'code' ],
	expect: { '': {} }
});

var callDppPkexRemove = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppPkexRemove',
	params: [ 'id' ],
	expect: { '': {} }
});

var callDppChirpChEn = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppChirpChEn',
	params: [ 'enable', 'chan_list' ],
	expect: { '': {} }
});

var callDppChirpNotif = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppChirpNotif',
	expect: { '': {} }
});

var callDppOnboardType = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppOnboardType',
	params: [ 'type' ],
	expect: { '': {} }
});

var callDppPresenceEnable = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppPresenceEnable',
	expect: { '': {} }
});

var callDppReconfigEnable = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppReconfigEnable',
	expect: { '': {} }
});

var callDppCceIndicationStart = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppCceIndicationStart',
	expect: { '': {} }
});

var callDppDevSetCfg = rpc.declare({
	object: 'luci.easymesh',
	method: 'dppDevSetCfg',
	params: [ 'path' ],
	expect: { '': {} }
});

var callWnmReq = rpc.declare({
	object: 'luci.easymesh',
	method: 'wnmReq',
	params: [ 'iface', 'mac', 'url' ],
	expect: { '': {} }
});

var callWnmReq2 = rpc.declare({
	object: 'luci.easymesh',
	method: 'wnmReq2',
	params: [ 'iface', 'mac', 'code', 'delay', 'url' ],
	expect: { '': {} }
});

var callQosMap = rpc.declare({
	object: 'luci.easymesh',
	method: 'qosMap',
	params: [ 'iface', 'mac', 'dscp_exception', 'dscp_range' ],
	expect: { '': {} }
});

var callProxyArpList = rpc.declare({
	object: 'luci.easymesh',
	method: 'proxyArpList',
	params: [ 'family' ],
	expect: { '': {} }
});

function showOutput(title, res) {
	var out = (res && (res.output || res.uri)) || '';
	var lines = [
		E('p', {}, E('code', { 'style': 'white-space:pre-wrap;word-break:break-all;display:block' },
			out || _('(no output)')))
	];
	if (res && res.error)
		lines.unshift(E('p', { 'class': 'alert-message warning' }, res.error));
	lines.push(E('div', { 'class': 'right' },
		E('button', { 'class': 'cbi-button', 'click': ui.hideModal }, [ _('Dismiss') ])));
	ui.showModal(title, lines);
}

function roleText(role) {
	return role == 'controller' ? _('Controller')
		: role == 'agent' ? _('Agent')
		: role == 'auto' ? _('Auto')
		: role == 'router' ? _('Router')
		: role == 'bridge' ? _('Bridge')
		: role == 'unknown' ? _('Unknown')
		: (role || '-');
}

/* two-step confirmation for destructive page resets */
function confirmResetPage(title) {
	return new Promise(function(resolve) {
		ui.showModal(title, [
			E('p', {}, _('This restores all options of this page to their defaults. The change takes effect immediately and the wapp / bs20 daemons are restarted.')),
			E('p', {}, _('The wireless configuration is not touched. Consider downloading a backup first on the "Backup, Restore and Reset" page.')),
			E('div', { 'class': 'right' }, [
				E('button', {
					'class': 'btn',
					'click': function() { ui.hideModal(); resolve(false); }
				}, [ _('Cancel') ]),
				' ',
				E('button', {
					'class': 'btn cbi-button-negative important',
					'click': function() { ui.hideModal(); resolve(true); }
				}, [ _('Continue') ])
			])
		]);
	});
}

function notifyResetResult(res) {
	if (res && res.ok) {
		ui.addNotification(null, E('p', {}, _('Page options have been restored to defaults. Reload the page to see the updated values.')));
		setTimeout(function() { location.reload(); }, 1500);
	}
	else {
		ui.addNotification(null, E('p', {}, _('Reset failed: %s').format((res && res.error) || _('unknown error'))));
	}
}

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('easymesh'),
			L.resolveDefault(callGetConfig(), {}),
			L.resolveDefault(callGetStatus(), {})
		]);
	},

	handleSave: function(ev) {
		var self = this;
		return this.super('handleSave', ev).then(function() {
			return self.load().then(function(data) {
				var cfg = data[1] || {};
				return L.resolveDefault(callApplyConfig(), {}).then(function(res) {
					var msg;
					if (!cfg.startwapp_available)
						msg = _('Applied, but /sbin/startwapp.sh was not found. Is mtwifi-cfg installed?');
					else if (res.enabled == '1')
						msg = _('EasyMesh configuration applied, wapp / bs20 have been restarted.');
					else
						msg = _('EasyMesh has been disabled. Note: band steering and 802.11r are also disabled on the radios to keep wapp stopped.');
					ui.addNotification(null, E('p', {}, msg));
				});
			});
		});
	},

	render: function(data) {
		var cfg = data[1] || {};
		var status = data[2] || {};
		var m, s, o;

		m = new form.Map('easymesh', _('EasyMesh Advanced Settings'),
			_('Expert level MTK EasyMesh (MAP / wapp / bs20) options. Changing these values may break the MAP feature set, please edit with care.'));

		s = m.section(form.NamedSection, 'config', 'easymesh');
		s.tab('advanced', _('Steering / MAP'));
		s.tab('backhaul', _('Backhaul'));
		s.tab('mapqos', _('Channel Planning / Optimization'));
		s.tab('device', _('Interfaces / Device Info'));
		s.tab('dpp', _('DPP / Onboarding'));
		s.tab('runtime', _('Runtime Tools'));
		s.tab('status', _('Status'));

		o = s.taboption('advanced', form.Button, '_reset_page', _('Reset this page'),
			_('Restore all options of the Advanced Settings page to their defaults and restart the daemons. The wireless configuration is not touched.'));
		o.inputtitle = _('Reset Advanced Settings');
		o.inputstyle = 'reset';
		o.onclick = function() {
			return confirmResetPage(_('Reset Advanced Settings')).then(function() {
				return L.resolveDefault(callResetPage('advanced'), {}).then(function(res) {
					notifyResetResult(res);
				});
			});
		};

		o = s.taboption('dpp', form.Value, 'dpp_uri', _('DPP URI'),
			_('Paste a DPP bootstrap URI (QR code) and submit it to wapp via wappctrl.'));
		o.optional = true;

		o = s.taboption('dpp', form.Button, '_dpp_submit', _('Submit DPP URI'));
		o.inputtitle = _('Submit DPP URI');
		o.inputstyle = 'apply';
		o.onclick = function(ev, section_id) {
			var uri = s.formvalue(section_id, 'dpp_uri');
			if (!uri) {
				ui.addNotification(null, E('p', {}, _('Please enter a DPP URI first.')));
				return;
			}
			return L.resolveDefault(callDppQrCode(uri), {}).then(function(res) {
				showOutput(_('Submit DPP URI'), res);
			});
		};

		o = s.taboption('dpp', form.Value, 'dpp_id', _('DPP Bootstrap ID'),
			_('Bootstrap information index used by the DPP query / remove buttons below.'));
		o.placeholder = '0';
		o.default = '0';
		o.datatype = 'uinteger';
		o.rmempty = false;

		o = s.taboption('dpp', form.Value, 'dpp_gen_chan', _('Bootstrap Generation Channel'),
		_('Optional chan= parameter for the bootstrap generation, e.g. 81 or 1.'));
	o.optional = true;
	o.datatype = 'uinteger';

	o = s.taboption('dpp', form.Value, 'dpp_gen_mac', _('Bootstrap Generation MAC'),
		_('Optional mac= parameter for the bootstrap generation.'));
	o.optional = true;
	o.datatype = 'macaddr';

	o = s.taboption('dpp', form.Value, 'dpp_gen_info', _('Bootstrap Generation Info'),
		_('Optional human readable info= parameter stored in the bootstrap information.'));
	o.optional = true;

	o = s.taboption('dpp', form.Value, 'dpp_gen_curve', _('Bootstrap Generation Curve'),
		_('Optional curve= parameter, e.g. P-256 / P-384.'));
	o.optional = true;

	o = s.taboption('dpp', form.Value, 'dpp_gen_key', _('Bootstrap Generation Key'),
		_('Optional private key= parameter (hexdump format).'));
	o.optional = true;
	o.password = true;

	o = s.taboption('dpp', form.Button, '_dpp_gen', _('Generate DPP URI'));
	o.inputtitle = _('Generate Bootstrapping URI');
	o.inputstyle = 'apply';
	o.onclick = function(ev, section_id) {
		return L.resolveDefault(callDppBootstrapGen(
			s.formvalue(section_id, 'dpp_gen_chan') || '',
			s.formvalue(section_id, 'dpp_gen_mac') || '',
			s.formvalue(section_id, 'dpp_gen_info') || '',
			s.formvalue(section_id, 'dpp_gen_curve') || '',
			s.formvalue(section_id, 'dpp_gen_key') || ''
		), {}).then(function(res) {
			showOutput(_('Generate Bootstrapping URI'), res);
		});
	};

		o = s.taboption('dpp', form.Button, '_dpp_show', _('Display Bootstrapping URI'));
		o.inputtitle = _('Display Bootstrapping URI');
		o.inputstyle = 'button';
		o.onclick = function(ev, section_id) {
			var id = s.formvalue(section_id, 'dpp_id') || '0';
			return L.resolveDefault(callDppBootstrapGetUri(id), {}).then(function(res) {
				showOutput(_('Bootstrapping URI'), res);
			});
		};

		o = s.taboption('dpp', form.Button, '_dpp_info', _('Show DPP Bootstrap Info'));
		o.inputtitle = _('Show Bootstrap Info');
		o.inputstyle = 'button';
		o.onclick = function(ev, section_id) {
			var id = s.formvalue(section_id, 'dpp_id') || '0';
			return L.resolveDefault(callDppBootstrapInfo(id), {}).then(function(res) {
				showOutput(_('Bootstrap Info'), res);
			});
		};

		o = s.taboption('dpp', form.Button, '_dpp_remove', _('Remove DPP Bootstrap'));
		o.inputtitle = _('Remove Bootstrap Info');
		o.inputstyle = 'reset';
		o.onclick = function(ev, section_id) {
			var id = s.formvalue(section_id, 'dpp_id') || '0';
			return L.resolveDefault(callDppBootstrapRemove(id), {}).then(function(res) {
				showOutput(_('Remove Bootstrap Info'), res);
			});
		};

		o = s.taboption('dpp', form.Button, '_dpp_start', _('DPP Onboarding'),
			_('Start DPP onboarding for the enrollee.'));
		o.inputtitle = _('Start DPP Onboarding');
		o.inputstyle = 'apply';
		o.onclick = function() {
			return L.resolveDefault(callDppStart(), {}).then(function(res) {
				showOutput(_('Start DPP Onboarding'), res);
			});
		};

		o = s.taboption('dpp', form.Value, 'dpp_freq', _('DPP Listen Frequency (MHz)'),
			_('Frequency for the DPP listen command, e.g. 2412 / 5180.'));
		o.placeholder = '2412';
		o.default = '2412';
		o.datatype = 'uinteger';
		o.rmempty = false;

		o = s.taboption('dpp', form.Button, '_dpp_listen', _('DPP Listen'));
		o.inputtitle = _('Start DPP Listen');
		o.inputstyle = 'apply';
		o.onclick = function(ev, section_id) {
			var freq = s.formvalue(section_id, 'dpp_freq') || '2412';
			return L.resolveDefault(callDppListen(freq), {}).then(function(res) {
				showOutput(_('Start DPP Listen'), res);
			});
		};

		o = s.taboption('dpp', form.Button, '_dpp_stop_listen', _('Stop DPP Listen'));
		o.inputtitle = _('Stop DPP Listen');
		o.inputstyle = 'reset';
		o.onclick = function() {
			return L.resolveDefault(callDppStopListen(), {}).then(function(res) {
				showOutput(_('Stop DPP Listen'), res);
			});
		};

		o = s.taboption('dpp', form.Button, '_dpp_bh', _('Set Backhaul to Wi-Fi (DPP)'));
		o.inputtitle = _('DPP Set Backhaul Wi-Fi');
		o.inputstyle = 'apply';
		o.onclick = function() {
			return L.resolveDefault(callDppSetBhWifi(), {}).then(function(res) {
				showOutput(_('DPP Set Backhaul Wi-Fi'), res);
			});
		};

		o = s.taboption('dpp', form.Button, '_dpp_reset', _('Reset DPP Configuration'));
	o.inputtitle = _('Reset DPP Config File');
	o.inputstyle = 'reset';
	o.onclick = function() {
		return L.resolveDefault(callDppResetConfig(), {}).then(function(res) {
			showOutput(_('Reset DPP Config File'), res);
		});
	};

	o = s.taboption('dpp', form.Button, '_dpp_reset_mapd', _('Reset MAPD Backhaul Config'));
	o.inputtitle = _('Reset MAPD Backhaul Config');
	o.inputstyle = 'reset';
	o.onclick = function() {
		return L.resolveDefault(callDppResetMapdUserConfig(), {}).then(function(res) {
			showOutput(_('Reset MAPD Backhaul Config'), res);
		});
	};

	o = s.taboption('dpp', form.Value, 'dpp_cfg_id', _('DPP Configurator ID'),
		_('Configurator index used by the configurator buttons below. Use * for all entries where supported.'));
	o.placeholder = '0';
	o.default = '0';
	o.rmempty = false;

	o = s.taboption('dpp', form.Value, 'dpp_cfg_curve', _('Configurator Curve'),
		_('Optional curve= parameter when adding a configurator, e.g. P-256.'));
	o.optional = true;

	o = s.taboption('dpp', form.Value, 'dpp_cfg_key', _('Configurator Key'),
		_('Optional private key= parameter when adding a configurator (hexdump format).'));
	o.optional = true;
	o.password = true;

	o = s.taboption('dpp', form.Button, '_dpp_cfg_add', _('Add DPP Configurator'));
	o.inputtitle = _('Add Configurator');
	o.inputstyle = 'apply';
	o.onclick = function(ev, section_id) {
		return L.resolveDefault(callDppConfiguratorAdd(
			s.formvalue(section_id, 'dpp_cfg_curve') || '',
			s.formvalue(section_id, 'dpp_cfg_key') || ''
		), {}).then(function(res) {
			showOutput(_('Add Configurator'), res);
		});
	};

	o = s.taboption('dpp', form.Button, '_dpp_cfg_key', _('Get Configurator Key'));
	o.inputtitle = _('Get Configurator Key');
	o.inputstyle = 'button';
	o.onclick = function(ev, section_id) {
		var id = s.formvalue(section_id, 'dpp_cfg_id') || '0';
		return L.resolveDefault(callDppConfiguratorGetKey(id), {}).then(function(res) {
			showOutput(_('Get Configurator Key'), res);
		});
	};

	o = s.taboption('dpp', form.Button, '_dpp_cfg_sign', _('Sign Own Bootstrap (Self Config)'));
	o.inputtitle = _('Self Configuration');
	o.inputstyle = 'apply';
	o.onclick = function(ev, section_id) {
		var id = s.formvalue(section_id, 'dpp_cfg_id') || '0';
		return L.resolveDefault(callDppConfiguratorSign(id), {}).then(function(res) {
			showOutput(_('Self Configuration'), res);
		});
	};

	o = s.taboption('dpp', form.Button, '_dpp_cfg_rm', _('Remove DPP Configurator'));
	o.inputtitle = _('Remove Configurator');
	o.inputstyle = 'reset';
	o.onclick = function(ev, section_id) {
		var id = s.formvalue(section_id, 'dpp_cfg_id') || '0';
		return L.resolveDefault(callDppConfiguratorRemove(id), {}).then(function(res) {
			showOutput(_('Remove Configurator'), res);
		});
	};

	o = s.taboption('dpp', form.Value, 'dpp_auth_peer', _('Auth Init Peer Bootstrap ID'),
		_('Bootstrap id of the peer for dpp_auth_init.'));
	o.placeholder = '0';
	o.default = '0';
	o.datatype = 'uinteger';
	o.rmempty = false;

	o = s.taboption('dpp', form.Value, 'dpp_auth_own', _('Auth Init Own Bootstrap ID'),
		_('Optional own bootstrap id for dpp_auth_init.'));
	o.optional = true;
	o.datatype = 'uinteger';

	o = s.taboption('dpp', form.Button, '_dpp_auth', _('Initiate DPP Authentication'));
	o.inputtitle = _('Initiate Authentication');
	o.inputstyle = 'apply';
	o.onclick = function(ev, section_id) {
		var peer = s.formvalue(section_id, 'dpp_auth_peer') || '0';
		var own = s.formvalue(section_id, 'dpp_auth_own') || '';
		return L.resolveDefault(callDppAuthInit(peer, own), {}).then(function(res) {
			showOutput(_('Initiate DPP Authentication'), res);
		});
	};

	o = s.taboption('dpp', form.Button, '_dpp_ctrl_start', _('Start DPP GAS Controller'));
	o.inputtitle = _('Start GAS Controller');
	o.inputstyle = 'apply';
	o.onclick = function() {
		return L.resolveDefault(callDppControllerStart(), {}).then(function(res) {
			showOutput(_('Start GAS Controller'), res);
		});
	};

	o = s.taboption('dpp', form.Button, '_dpp_ctrl_stop', _('Stop DPP GAS Controller'));
	o.inputtitle = _('Stop GAS Controller');
	o.inputstyle = 'reset';
	o.onclick = function() {
		return L.resolveDefault(callDppControllerStop(), {}).then(function(res) {
			showOutput(_('Stop GAS Controller'), res);
		});
	};

	o = s.taboption('dpp', form.Value, 'dpp_pkex_code', _('PKEX Code'),
		_('PKEX code to register for password based DPP bootstrapping.'));
	o.optional = true;

	o = s.taboption('dpp', form.Button, '_dpp_pkex_add', _('Add PKEX Code'));
	o.inputtitle = _('Add PKEX Code');
	o.inputstyle = 'apply';
	o.onclick = function(ev, section_id) {
		var code = s.formvalue(section_id, 'dpp_pkex_code');
		if (!code) {
			ui.addNotification(null, E('p', {}, _('Please enter a PKEX code first.')));
			return;
		}
		return L.resolveDefault(callDppPkexAdd(code), {}).then(function(res) {
			showOutput(_('Add PKEX Code'), res);
		});
	};

	o = s.taboption('dpp', form.Button, '_dpp_pkex_rm', _('Remove PKEX Code'));
	o.inputtitle = _('Remove PKEX Code');
	o.inputstyle = 'reset';
	o.onclick = function(ev, section_id) {
		var id = s.formvalue(section_id, 'dpp_cfg_id') || '0';
		return L.resolveDefault(callDppPkexRemove(id), {}).then(function(res) {
			showOutput(_('Remove PKEX Code'), res);
		});
	};

	o = s.taboption('dpp', form.ListValue, 'dpp_chirp_enable', _('DPP Chirp'),
		_('Enable or disable DPP chirp on the channel list below.'));
	o.value('1', _('Enabled'));
	o.value('0', _('Disabled'));
	o.default = '1';
	o.rmempty = false;

	o = s.taboption('dpp', form.Value, 'dpp_chirp_list', _('DPP Chirp Channel List'),
		_('Optional channel list for the chirp command, e.g. 1,6,11.'));
	o.optional = true;

	o = s.taboption('dpp', form.Button, '_dpp_chirp_en', _('Apply DPP Chirp Setting'));
	o.inputtitle = _('Apply Chirp Setting');
	o.inputstyle = 'apply';
	o.onclick = function(ev, section_id) {
		var enable = s.formvalue(section_id, 'dpp_chirp_enable') || '1';
		var list = s.formvalue(section_id, 'dpp_chirp_list') || '';
		return L.resolveDefault(callDppChirpChEn(enable, list), {}).then(function(res) {
			showOutput(_('Apply Chirp Setting'), res);
		});
	};

	o = s.taboption('dpp', form.Button, '_dpp_chirp_notif', _('Send DPP Chirp Notification'));
	o.inputtitle = _('Send Chirp Notification');
	o.inputstyle = 'apply';
	o.onclick = function() {
		return L.resolveDefault(callDppChirpNotif(), {}).then(function(res) {
			showOutput(_('Send Chirp Notification'), res);
		});
	};

	o = s.taboption('dpp', form.Value, 'dpp_onboard_type', _('DPP Onboard Type'),
		_('Onboard type for dpp_onboard_type, e.g. wifi / eth.'));
	o.optional = true;

	o = s.taboption('dpp', form.Button, '_dpp_onboard_type', _('Set DPP Onboard Type'));
	o.inputtitle = _('Set Onboard Type');
	o.inputstyle = 'apply';
	o.onclick = function(ev, section_id) {
		var t = s.formvalue(section_id, 'dpp_onboard_type');
		if (!t) {
			ui.addNotification(null, E('p', {}, _('Please enter an onboard type first.')));
			return;
		}
		return L.resolveDefault(callDppOnboardType(t), {}).then(function(res) {
			showOutput(_('Set Onboard Type'), res);
		});
	};

	o = s.taboption('dpp', form.Button, '_dpp_presence', _('Enable DPP Presence Announcement'));
	o.inputtitle = _('Enable Presence Announcement');
	o.inputstyle = 'apply';
	o.onclick = function() {
		return L.resolveDefault(callDppPresenceEnable(), {}).then(function(res) {
			showOutput(_('Enable Presence Announcement'), res);
		});
	};

	o = s.taboption('dpp', form.Button, '_dpp_reconfig', _('Enable DPP Reconfiguration'));
	o.inputtitle = _('Enable Reconfiguration');
	o.inputstyle = 'apply';
	o.onclick = function() {
		return L.resolveDefault(callDppReconfigEnable(), {}).then(function(res) {
			showOutput(_('Enable Reconfiguration'), res);
		});
	};

	o = s.taboption('dpp', form.Button, '_dpp_cce', _('Start DPP CCE Indication'));
	o.inputtitle = _('Start CCE Indication');
	o.inputstyle = 'apply';
	o.onclick = function() {
		return L.resolveDefault(callDppCceIndicationStart(), {}).then(function(res) {
			showOutput(_('Start CCE Indication'), res);
		});
	};

	o = s.taboption('dpp', form.Value, 'dpp_dev_cfg_path', _('DPP Device Config Path'),
		_('Path of the MAP WTS file for dpp_dev_set_cfg.'));
	o.optional = true;

	o = s.taboption('dpp', form.Button, '_dpp_dev_cfg', _('Set DPP Device Configuration'));
	o.inputtitle = _('Set Device Configuration');
	o.inputstyle = 'apply';
	o.onclick = function(ev, section_id) {
		var path = s.formvalue(section_id, 'dpp_dev_cfg_path');
		if (!path) {
			ui.addNotification(null, E('p', {}, _('Please enter a configuration file path first.')));
			return;
		}
		return L.resolveDefault(callDppDevSetCfg(path), {}).then(function(res) {
			showOutput(_('Set Device Configuration'), res);
		});
	};

		o = s.taboption('runtime', form.Button, '_topology', _('Runtime Topology'));
		o.inputtitle = _('Display Runtime Topology');
		o.inputstyle = 'button';
		o.onclick = function() {
			location.href = L.url('admin/network/easymesh/topology');
		};

		/* ------------------------------------------------------------------ */
		/* advanced (steering / roaming / feature switches)                    */
		/* ------------------------------------------------------------------ */

		o = s.taboption('advanced', form.Flag, 'steering', _('Steering'),
			_('Enable MAP steering (SteerEnable in mapd_cfg).'));
		o.default = o.enabled;
		o.rmempty = false;

		o = s.taboption('advanced', form.Value, 'steer_rssi_th', _('AP Steering RSSI Threshold'),
			_('APSteerRssiTh in mapd_cfg (dBm).'));
		o.datatype = 'integer';
		o.default = '-54';
		o.rmempty = false;

		o = s.taboption('advanced', form.Value, 'roam_rssi_th', _('Force Roam RSSI Threshold'),
			_('force_roam_rssi_th in mapd_cfg (dBm).'));
		o.datatype = 'integer';
		o.default = '-70';
		o.rmempty = false;

		o = s.taboption('advanced', form.Value, 'lr_steer_edge', _('Low RSSI Steering Edge'),
		_('LowRSSIAPSteerEdge_RE in mapd_cfg.'));
	o.datatype = 'uinteger';
	o.default = '25';
	o.rmempty = false;

	o = s.taboption('advanced', form.Value, 'lr_steer_edge_root', _('Low RSSI Steering Edge (Root)'),
		_('LowRSSIAPSteerEdge_root in mapd_cfg. Leave empty for driver default.'));
	o.optional = true;
	o.datatype = 'uinteger';

		o = s.taboption('advanced', form.Value, 'scan_th_2g', _('Scan Threshold 2.4G'),
			_('ScanThreshold2g in mapd_cfg (dBm).'));
		o.datatype = 'integer';
		o.default = '-88';
		o.rmempty = false;

		o = s.taboption('advanced', form.Value, 'scan_th_5g', _('Scan Threshold 5G'),
			_('ScanThreshold5g in mapd_cfg (dBm).'));
		o.datatype = 'integer';
		o.default = '-88';
		o.rmempty = false;

		o = s.taboption('advanced', form.Value, 'scan_th_6g', _('Scan Threshold 6G'),
			_('ScanThreshold6g in mapd_cfg (dBm).'));
		o.datatype = 'integer';
		o.default = '-88';
		o.rmempty = false;

		o = s.taboption('advanced', form.Value, 'bh_steer_timeout', _('Backhaul Steering Timeout'),
			_('BHSteerTimeout in mapd_cfg (seconds).'));
		o.datatype = 'uinteger';
		o.default = '120';
		o.rmempty = false;

		o = s.taboption('advanced', form.Flag, 'centralized_steering', _('Centralized Steering'),
			_('CentralizedSteering in mapd_cfg.'));
		o.default = o.disabled;
		o.rmempty = false;

		o = s.taboption('advanced', form.Value, 'metric_interval', _('Metric Report Interval'),
			_('MetricRepIntv in mapd_cfg (seconds).'));
		o.datatype = 'uinteger';
		o.default = '60';
		o.rmempty = false;

		o = s.taboption('advanced', form.Value, 'max_scan', _('Max Allowed Scan'),
			_('MaxAllowedScan in mapd_cfg. Leave empty for driver default.'));
		o.optional = true;

		o = s.taboption('advanced', form.Flag, 'non_map_ap', _('Non-MAP AP Support'),
			_('NonMAPAPEnable in mapd_cfg: allow non-MAP APs in the network.'));
		o.default = o.enabled;
		o.rmempty = false;

		o = s.taboption('advanced', form.Flag, 'third_party', _('Third Party Connection'),
			_('ThirdPartyConnection in mapd_cfg.'));
		o.default = o.disabled;
		o.rmempty = false;

		o = s.taboption('advanced', form.Flag, 'role_detect_ext', _('External Role Detection'),
			_('role_detection_external in mapd_cfg.'));
		o.default = o.disabled;
		o.rmempty = false;

		o = s.taboption('advanced', form.Flag, 'dhcp_ctl', _('DHCP Control'),
			_('DhcpCtl in mapd_cfg: controller-side DHCP handling for agents.'));
		o.default = o.disabled;
		o.rmempty = false;

		o = s.taboption('advanced', form.Flag, 'quick_ch_change', _('Quick Channel Change'),
			_('MAP_QuickChChange in mapd_cfg.'));
		o.default = o.enabled;
		o.rmempty = false;

		o = s.taboption('advanced', form.Flag, 'psc_6g', _('PSC Channel on 6G'),
			_('SetPSCChannel_6G in mapd_cfg: restrict 6G to PSC channels.'));
		o.default = o.disabled;
		o.rmempty = false;

		/* ------------------------------------------------------------------ */
		/* backhaul                                                            */
		/* ------------------------------------------------------------------ */

		o = s.taboption('backhaul', form.Value, 'radio_band', _('Radio Band Layout'),
			_('radio_band in 1905d.cfg: semicolon separated band per radio, e.g. 24G;5G;5G; or 24G;5GH;5GL; for tri-band.'));
		o.default = '24G;5G;5G;';
		o.rmempty = false;

		o = s.taboption('backhaul', form.Flag, 'auto_bh_switch', _('Auto Backhaul Switch'),
			_('AutoBHSwitching in mapd_cfg: allow automatic backhaul link switching.'));
		o.default = o.enabled;
		o.rmempty = false;

		o = s.taboption('backhaul', form.Flag, 'bh_prio_2g', _('Backhaul Priority 2.4G'),
			_('BhPriority2G in mapd_cfg: allow 2.4G as backhaul.'));
		o.default = o.disabled;
		o.rmempty = false;

		o = s.taboption('backhaul', form.Flag, 'bh_prio_5gl', _('Backhaul Priority 5G Low'),
			_('BhPriority5GL in mapd_cfg: allow 5G low band as backhaul.'));
		o.default = o.enabled;
		o.rmempty = false;

		o = s.taboption('backhaul', form.Flag, 'bh_prio_5gh', _('Backhaul Priority 5G High'),
			_('BhPriority5GH in mapd_cfg: allow 5G high band as backhaul.'));
		o.default = o.enabled;
		o.rmempty = false;

		o = s.taboption('backhaul', form.Flag, 'bh_prio_6g', _('Backhaul Priority 6G'),
			_('BhPriority6G in mapd_cfg: allow 6G as backhaul.'));
		o.default = o.enabled;
		o.rmempty = false;

		o = s.taboption('backhaul', form.Value, 'dual_bh', _('Dual Backhaul'),
			_('DualBH in mapd_cfg. Leave empty to disable dual backhaul.'));
		o.optional = true;

		o = s.taboption('backhaul', form.Value, 'band_switch_time', _('Band Switch Time'),
			_('BandSwitchTime in mapd_cfg. Leave empty for driver default.'));
		o.optional = true;

		o = s.taboption('backhaul', form.Value, 'bss_prio', _('BSS Config Priority'),
			_('bss_config_priority: semicolon separated BSS bring-up order (mapd_cfg and 1905d.cfg).'));
		o.default = 'ra0;rax0;apclix0';
		o.rmempty = false;

		[1, 2].forEach(function(i) {
			o = s.taboption('backhaul', form.Flag, 'bh%d_valid'.format(i), _('Backhaul Profile %d Active').format(i),
				_('BhProfile%dValid in mapd_cfg.'.format(i)));
			o.default = o.disabled;
			o.rmempty = false;

			o = s.taboption('backhaul', form.Value, 'bh%d_ssid'.format(i), _('Backhaul Profile %d SSID').format(i),
				_('BhProfile%dSsid in mapd_cfg.'.format(i)));
			o.optional = true;

			o = s.taboption('backhaul', form.ListValue, 'bh%d_auth'.format(i), _('Backhaul Profile %d Authentication').format(i),
				_('BhProfile%dAuthMode in mapd_cfg.'.format(i)));
			o.value('', _('-- auto --'));
			o.value('OPEN', _('Open'));
			o.value('WPAPSK', _('WPA-PSK'));
			o.value('WPA2PSK', _('WPA2-PSK'));
			o.value('WPA3PSK', _('WPA3-PSK (SAE)'));
			o.optional = true;

			o = s.taboption('backhaul', form.Value, 'bh%d_key'.format(i), _('Backhaul Profile %d Passphrase').format(i),
				_('BhProfile%dWpaPsk in mapd_cfg.'.format(i)));
			o.optional = true;
			o.password = true;

			o = s.taboption('backhaul', form.Value, 'bh%d_enc'.format(i), _('Backhaul Profile %d Encryption').format(i),
				_('BhProfile%dEncrypType in mapd_cfg, e.g. AES / TKIP / CCMP128.'.format(i)));
			o.optional = true;

			o = s.taboption('backhaul', form.Value, 'bh%d_raid'.format(i), _('Backhaul Profile %d Ra ID').format(i),
				_('BhProfile%dRaID in mapd_cfg.'.format(i)));
			o.optional = true;
		});

		/* ------------------------------------------------------------------ */
		/* mapqos (channel planning / network optimization)                    */
		/* ------------------------------------------------------------------ */

		o = s.taboption('mapqos', form.Flag, 'ch_plan_enable', _('Channel Planning'),
			_('ChPlanningEnable in mapd_cfg: controller-driven channel planning.'));
		o.default = o.disabled;
		o.rmempty = false;

		o = s.taboption('mapqos', form.Value, 'ch_plan_enable_r2', _('Channel Planning R2'),
			_('ChPlanningEnableR2 in mapd_cfg. Leave empty for default.'));
		o.optional = true;

		o = s.taboption('mapqos', form.Value, 'ch_plan_r2_bw', _('Channel Planning R2 with Bandwidth'),
			_('ChPlanningEnableR2withBW in mapd_cfg. Leave empty for default.'));
		o.optional = true;

		o = s.taboption('mapqos', form.Value, 'ch_plan_init_timeout', _('Channel Planning Init Timeout'),
			_('ChPlanningInitTimeout in mapd_cfg (seconds).'));
		o.datatype = 'uinteger';
		o.default = '120';
		o.rmempty = false;

		o = s.taboption('mapqos', form.Value, 'ch_plan_scan_valid', _('Channel Planning Scan Valid'),
			_('ChPlanningScanValidTime in mapd_cfg (seconds).'));
		o.datatype = 'uinteger';
		o.default = '14400';
		o.rmempty = false;

		o = s.taboption('mapqos', form.Value, 'ch_plan_idle_bytes', _('Channel Planning Idle Byte Count'),
			_('ChPlanningIdleByteCount in mapd_cfg. Leave empty for default.'));
		o.optional = true;

		o = s.taboption('mapqos', form.Value, 'ch_plan_idle_time', _('Channel Planning Idle Time'),
			_('ChPlanningIdleTime in mapd_cfg. Leave empty for default.'));
		o.optional = true;

		o = s.taboption('mapqos', form.Value, 'ch_plan_ch_2g', _('Preferred Channels 2.4G'),
			_('ChPlanningUserPreferredChannel2G: comma separated channel list, empty for automatic.'));
		o.optional = true;

		o = s.taboption('mapqos', form.Value, 'ch_plan_ch_5gl', _('Preferred Channels 5G Low'),
			_('ChPlanningUserPreferredChannel5G: comma separated channel list, empty for automatic.'));
		o.optional = true;

		o = s.taboption('mapqos', form.Value, 'ch_plan_ch_5gh', _('Preferred Channels 5G High'),
			_('ChPlanningUserPreferredChannel5GH: comma separated channel list, empty for automatic.'));
		o.optional = true;

		o = s.taboption('mapqos', form.Value, 'ch_plan_ch_6g', _('Preferred Channels 6G'),
		_('ChPlanningUserPreferredChannel6G: comma separated channel list, empty for automatic.'));
	o.optional = true;

	o = s.taboption('mapqos', form.Value, 'ch_plan_cu_th_2g', _('ChUtil Threshold 2.4G'),
		_('ChPlanningChUtilThresh_24G in mapd_cfg. Leave empty for driver default.'));
	o.optional = true;
	o.datatype = 'range(0, 100)';

	o = s.taboption('mapqos', form.Value, 'ch_plan_cu_th_5gl', _('ChUtil Threshold 5G Low'),
		_('ChPlanningChUtilThresh_5GL in mapd_cfg. Leave empty for driver default.'));
	o.optional = true;
	o.datatype = 'range(0, 100)';

	o = s.taboption('mapqos', form.Value, 'ch_plan_cu_th_6g', _('ChUtil Threshold 6G'),
		_('ChPlanningChUtilThresh_6G in mapd_cfg. Leave empty for driver default.'));
	o.optional = true;
	o.datatype = 'range(0, 100)';

	o = s.taboption('mapqos', form.Value, 'ch_plan_edcca_th_2g', _('EDCCA Threshold 2.4G'),
		_('ChPlanningEDCCAThresh_24G in mapd_cfg. Leave empty for driver default.'));
	o.optional = true;
	o.datatype = 'range(0, 100)';

	o = s.taboption('mapqos', form.Value, 'ch_plan_edcca_th_5gl', _('EDCCA Threshold 5G Low'),
		_('ChPlanningEDCCAThresh_5GL in mapd_cfg. Leave empty for driver default.'));
	o.optional = true;
	o.datatype = 'range(0, 100)';

	o = s.taboption('mapqos', form.Value, 'ch_plan_edcca_th_6g', _('EDCCA Threshold 6G'),
		_('ChPlanningEDCCAThresh_6G in mapd_cfg. Leave empty for driver default.'));
	o.optional = true;
	o.datatype = 'range(0, 100)';

	o = s.taboption('mapqos', form.Value, 'ch_plan_obss_th_2g', _('OBSS Threshold 2.4G'),
		_('ChPlanningOBSSThresh_24G in mapd_cfg. Leave empty for driver default.'));
	o.optional = true;
	o.datatype = 'range(0, 100)';

	o = s.taboption('mapqos', form.Value, 'ch_plan_obss_th_5gl', _('OBSS Threshold 5G Low'),
		_('ChPlanningOBSSThresh_5GL in mapd_cfg. Leave empty for driver default.'));
	o.optional = true;
	o.datatype = 'range(0, 100)';

	o = s.taboption('mapqos', form.Value, 'ch_plan_obss_th_6g', _('OBSS Threshold 6G'),
		_('ChPlanningOBSSThresh_6G in mapd_cfg. Leave empty for driver default.'));
	o.optional = true;
	o.datatype = 'range(0, 100)';

	o = s.taboption('mapqos', form.Value, 'ch_plan_r2_metric_intv', _('R2 Metric Reporting Interval'),
		_('ChPlanningR2MetricReportingInterval in mapd_cfg (seconds). Leave empty for driver default.'));
	o.optional = true;
	o.datatype = 'uinteger';

	o = s.taboption('mapqos', form.Value, 'ch_plan_r2_min_score', _('R2 Minimum Score Margin'),
		_('ChPlanningR2MinScoreMargin in mapd_cfg. Leave empty for driver default.'));
	o.optional = true;
	o.datatype = 'uinteger';

	o = s.taboption('mapqos', form.Value, 'ch_plan_r2_mon_prohibit', _('R2 Monitor Prohibit Time'),
		_('ChPlanningR2MonitorProhibitSecs in mapd_cfg (seconds). Leave empty for driver default.'));
	o.optional = true;
	o.datatype = 'uinteger';

	o = s.taboption('mapqos', form.Value, 'ch_plan_r2_mon_timeout', _('R2 Monitor Timeout'),
		_('ChPlanningR2MonitorTimeoutSecs in mapd_cfg (seconds). Leave empty for driver default.'));
	o.optional = true;
	o.datatype = 'uinteger';

		o = s.taboption('mapqos', form.Flag, 'divergent_ch_plan', _('Divergent Channel Planning'),
			_('DivergentChPlanning in mapd_cfg.'));
		o.default = o.disabled;
		o.rmempty = false;

		o = s.taboption('mapqos', form.Flag, 'nop_enable', _('Network Optimization'),
			_('NetworkOptimizationEnabled in mapd_cfg.'));
		o.default = o.disabled;
		o.rmempty = false;

		o = s.taboption('mapqos', form.Value, 'nop_bootup_wait', _('NOP Bootup Wait'),
			_('NtwrkOptBootupWaitTime in mapd_cfg (seconds).'));
		o.datatype = 'uinteger';
		o.default = '45';
		o.rmempty = false;

		o = s.taboption('mapqos', form.Value, 'nop_connect_wait', _('NOP Connect Wait'),
			_('NtwrkOptConnectWaitTime in mapd_cfg (seconds).'));
		o.datatype = 'uinteger';
		o.default = '45';
		o.rmempty = false;

		o = s.taboption('mapqos', form.Value, 'nop_disconnect_wait', _('NOP Disconnect Wait'),
			_('NtwrkOptDisconnectWaitTime in mapd_cfg (seconds).'));
		o.datatype = 'uinteger';
		o.default = '45';
		o.rmempty = false;

		o = s.taboption('mapqos', form.Value, 'nop_periodicity', _('NOP Periodicity'),
			_('NtwrkOptPeriodicity in mapd_cfg (seconds).'));
		o.datatype = 'uinteger';
		o.default = '3600';
		o.rmempty = false;

		o = s.taboption('mapqos', form.Value, 'nop_score_margin', _('NOP Score Margin'),
			_('NetworkOptimizationScoreMargin in mapd_cfg.'));
		o.datatype = 'uinteger';
		o.default = '100';
		o.rmempty = false;

		o = s.taboption('mapqos', form.Flag, 'nop_prefer_5g', _('NOP Prefer 5G over 2G'),
			_('NetworkOptPrefer5Gover2G in mapd_cfg.'));
		o.default = o.disabled;
		o.rmempty = false;

		o = s.taboption('mapqos', form.Value, 'nop_prefer_5g_retry', _('NOP Prefer 5G Retry Count'),
			_('NetworkOptPrefer5Gover2GRetryCnt in mapd_cfg.'));
		o.datatype = 'uinteger';
		o.default = '0';
		o.rmempty = false;

		o = s.taboption('mapqos', form.Value, 'nop_post_cac', _('NOP Post-CAC Trigger'),
			_('NtwrkOptPostCACTriggerTime in mapd_cfg (seconds).'));
		o.datatype = 'uinteger';
		o.default = '30';
		o.rmempty = false;

		o = s.taboption('mapqos', form.Value, 'nop_data_collect', _('NOP Data Collection Time'),
			_('NtwrkOptDataCollectionTime in mapd_cfg (seconds).'));
		o.datatype = 'uinteger';
		o.default = '60';
		o.rmempty = false;

		o = s.taboption('mapqos', form.Value, 'nop_user_prio', _('NOP User Priority'),
			_('NetOptUserSetPriority in mapd_cfg.'));
		o.datatype = 'uinteger';
		o.default = '0';
		o.rmempty = false;

		o = s.taboption('mapqos', form.Value, 'cu_th_2g', _('CU Overload Threshold 2.4G'),
			_('CUOverloadTh_2G in mapd_cfg (percent).'));
		o.datatype = 'range(0, 100)';
		o.default = '70';
		o.rmempty = false;

		o = s.taboption('mapqos', form.Value, 'cu_th_5gl', _('CU Overload Threshold 5G Low'),
			_('CUOverloadTh_5G_L in mapd_cfg (percent).'));
		o.datatype = 'range(0, 100)';
		o.default = '80';
		o.rmempty = false;

		o = s.taboption('mapqos', form.Value, 'cu_th_5gh', _('CU Overload Threshold 5G High'),
			_('CUOverloadTh_5G_H in mapd_cfg (percent).'));
		o.datatype = 'range(0, 100)';
		o.default = '80';
		o.rmempty = false;

		o = s.taboption('mapqos', form.Value, 'cu_th_6g', _('CU Overload Threshold 6G'),
			_('CUOverloadTh_6G in mapd_cfg (percent).'));
		o.datatype = 'range(0, 100)';
		o.default = '80';
		o.rmempty = false;

		/* ------------------------------------------------------------------ */
		/* device (interfaces / 1905d general / data element)                  */
		/* ------------------------------------------------------------------ */

		o = s.taboption('device', form.Value, 'lan_if', _('LAN Interface'),
			_('lan_interface in mapd_cfg.'));
		o.default = 'eth0';
		o.rmempty = false;

		o = s.taboption('device', form.Value, 'wan_if', _('WAN Interface'),
			_('wan_interface in mapd_cfg.'));
		o.default = 'eth1';
		o.rmempty = false;

		o = s.taboption('device', form.Value, 'br_inf', _('Bridge Interface'),
			_('br_inf in 1905d.cfg: bridge used by the MAP AL entity.'));
		o.default = 'br-lan';
		o.rmempty = false;

		o = s.taboption('device', form.Value, 'al_inf', _('AL Interface'),
			_('al_inf in 1905d.cfg: fixed AL MAC interface (Wi-Fi interface).'));
		o.default = 'ra0';
		o.rmempty = false;

		o = s.taboption('device', form.Value, 'eth_dev', _('Ethernet Device Name'),
			_('ethernet_dev_name in 1905d.cfg: ethernet device used to read the switch table. Leave empty unless you know what it does.'));
		o.optional = true;

		o = s.taboption('device', form.ListValue, 'map_ver', _('MAP Version'),
			_('map_ver in 1905d.cfg. Wrong values may break the MAP feature set, change with care.'));
		o.value('R1', 'R1');
		o.value('R2', 'R2');
		o.value('R3', 'R3');
		o.default = 'R1';
		o.rmempty = false;

		o = s.taboption('device', form.Value, 'decrypt_fail_th', _('Decrypt Fail Threshold'),
			_('decrypt_fail_threshold in 1905d.cfg.'));
		o.datatype = 'uinteger';
		o.default = '10';
		o.rmempty = false;

		o = s.taboption('device', form.Value, 'gtk_rekey', _('GTK Rekey Interval'),
			_('gtk_rekey_interval in 1905d.cfg (seconds).'));
		o.datatype = 'uinteger';
		o.default = '3600';
		o.rmempty = false;

		o = s.taboption('device', form.Flag, 'ob_wan_only', _('Onboarding over WAN'),
			_('ob_wan_only in 1905d.cfg: restrict onboarding traffic to the WAN interface.'));
		o.default = o.disabled;
		o.rmempty = false;

		o = s.taboption('device', form.Value, 'ctrl_alid', _('Controller ALID Override'),
			_('map_controller_alid in 1905d.cfg. Leave empty to use the br-lan MAC address automatically.'));
		o.optional = true;
		o.datatype = 'macaddr';

		o = s.taboption('device', form.Value, 'agent_alid', _('Agent ALID Override'),
			_('map_agent_alid in 1905d.cfg. Leave empty to use the br-lan MAC address automatically.'));
		o.optional = true;
		o.datatype = 'macaddr';

		o = s.taboption('device', form.Value, 'de_serial', _('Data Element Serial Number'),
			_('DESerialNumber in mapd_cfg.'));
		o.default = 'v3.0';
		o.rmempty = false;

		o = s.taboption('device', form.Value, 'de_sw_ver', _('Data Element Software Version'),
			_('DESoftwareVersion in mapd_cfg.'));
		o.default = 'v3.0';
		o.rmempty = false;

		o = s.taboption('device', form.Value, 'de_exec_env', _('Data Element Execution Environment'),
			_('DEExecutionEnv in mapd_cfg.'));
		o.default = 'Linux-Openwrt';
		o.rmempty = false;

		o = s.taboption('device', form.Value, 'de_chipset_vendor', _('Data Element Chipset Vendor'),
			_('DEChipsetVendor in mapd_cfg.'));
		o.default = 'MediaTek';
		o.rmempty = false;

		o = s.taboption('device', form.Value, 'de_sta_event_path', _('Data Element STA Event Path'),
			_('DEStaConEventPath in mapd_cfg. Leave empty for default.'));
		o.optional = true;

		/* ------------------------------------------------------------------ */
		/* runtime tools                                                       */
		/* ------------------------------------------------------------------ */

		o = s.taboption('runtime', form.ListValue, 'rt_iface', _('Runtime Interface'),
			_('wappctrl interface used by the runtime tools below.'));
		o.value('ra0', 'ra0 (2.4G)');
		o.value('rax0', 'rax0 (5G)');
		o.value('rai0', 'rai0');
		o.default = 'ra0';
		o.rmempty = false;

		o = s.taboption('runtime', form.Button, '_reload', _('Reload wapp Configuration'));
		o.inputtitle = _('Reload wapp');
		o.inputstyle = 'apply';
		o.onclick = function(ev, section_id) {
			var iface = s.formvalue(section_id, 'rt_iface') || 'ra0';
			return L.resolveDefault(callWappReload(iface), {}).then(function(res) {
				showOutput(_('Reload wapp'), res);
			});
		};

		o = s.taboption('runtime', form.Button, '_version', _('wapp Version Information'));
		o.inputtitle = _('Query Versions');
		o.inputstyle = 'button';
		o.onclick = function(ev, section_id) {
			var iface = s.formvalue(section_id, 'rt_iface') || 'ra0';
			return L.resolveDefault(callWappVersion(iface), {}).then(function(res) {
				var out = [
					'version:     ' + (res.version || ''),
					'hs_version:  ' + (res.hs_version || ''),
					'drv_version: ' + (res.drv_version || '')
				].join('\n');
				showOutput(_('wapp Versions'), { output: out });
			});
		};

		o = s.taboption('runtime', form.Value, 'steer_mac', _('Steer Station MAC'),
			_('Ask wapp (mbo steer_sta) to steer this client to a better BSS.'));
		o.optional = true;
		o.datatype = 'macaddr';

		o = s.taboption('runtime', form.Button, '_steer', _('Steer Station'));
		o.inputtitle = _('Steer Station');
		o.inputstyle = 'apply';
		o.onclick = function(ev, section_id) {
			var iface = s.formvalue(section_id, 'rt_iface') || 'ra0';
			var mac = s.formvalue(section_id, 'steer_mac');
			if (!mac) {
				ui.addNotification(null, E('p', {}, _('Please enter a station MAC address first.')));
				return;
			}
			return L.resolveDefault(callSteerSta(iface, mac), {}).then(function(res) {
				showOutput(_('Steer Station'), res);
			});
		};

		o = s.taboption('runtime', form.Value, 'btm_mac', _('BTM Request MAC'),
			_('Send an 802.11 BSS transition management request to this client (wappctrl btmreq).'));
		o.optional = true;
		o.datatype = 'macaddr';

		o = s.taboption('runtime', form.Flag, 'btm_imm', _('BTM Disassociation Imminent'));
		o.default = o.disabled;
		o.rmempty = false;

		o = s.taboption('runtime', form.Value, 'btm_timer', _('BTM Disassociation Timer'),
			_('Disassociation timer in TBTT units.'));
		o.placeholder = '0';
		o.default = '0';
		o.datatype = 'uinteger';
		o.rmempty = false;

		o = s.taboption('runtime', form.Value, 'btm_url', _('BTM Session Information URL'),
			_('Optional session information URL.'));
		o.optional = true;

		o = s.taboption('runtime', form.Button, '_btm', _('Send BTM Request'));
	o.inputtitle = _('Send BTM Request');
	o.inputstyle = 'apply';
	o.onclick = function(ev, section_id) {
		var mac = s.formvalue(section_id, 'btm_mac');
		if (!mac) {
			ui.addNotification(null, E('p', {}, _('Please enter a station MAC address first.')));
			return;
		}
		var imm = s.formvalue(section_id, 'btm_imm') == '1' ? '1' : '0';
		var timer = s.formvalue(section_id, 'btm_timer') || '0';
		var url = s.formvalue(section_id, 'btm_url') || '';
		return L.resolveDefault(callBtmReq(mac, imm, timer, url), {}).then(function(res) {
			showOutput(_('Send BTM Request'), res);
		});
	};

	o = s.taboption('runtime', form.Value, 'wnm_mac', _('WNM Request MAC'),
		_('Send a WNM notification request to this client (wappctrl wnmreq / wnmreq2).'));
	o.optional = true;
	o.datatype = 'macaddr';

	o = s.taboption('runtime', form.Value, 'wnm_url', _('WNM Server URL'),
		_('Server URL for the WNM remediation request (wnmreq).'));
	o.optional = true;

	o = s.taboption('runtime', form.Button, '_wnm', _('Send WNM Remediation Request'));
	o.inputtitle = _('Send WNM Request');
	o.inputstyle = 'apply';
	o.onclick = function(ev, section_id) {
		var iface = s.formvalue(section_id, 'rt_iface') || 'ra0';
		var mac = s.formvalue(section_id, 'wnm_mac');
		if (!mac) {
			ui.addNotification(null, E('p', {}, _('Please enter a station MAC address first.')));
			return;
		}
		var url = s.formvalue(section_id, 'wnm_url') || '';
		return L.resolveDefault(callWnmReq(iface, mac, url), {}).then(function(res) {
			showOutput(_('Send WNM Request'), res);
		});
	};

	o = s.taboption('runtime', form.Value, 'wnm2_code', _('WNM Deauth Code'),
		_('Reason code for the WNM deauth imminent notification (wnmreq2).'));
	o.placeholder = '1';
	o.default = '1';
	o.datatype = 'uinteger';
	o.rmempty = false;

	o = s.taboption('runtime', form.Value, 'wnm2_delay', _('WNM Deauth Delay'),
		_('Delay for the WNM deauth imminent notification (wnmreq2).'));
	o.placeholder = '0';
	o.default = '0';
	o.datatype = 'uinteger';
	o.rmempty = false;

	o = s.taboption('runtime', form.Button, '_wnm2', _('Send WNM Deauth Imminent Request'));
	o.inputtitle = _('Send WNM Deauth Request');
	o.inputstyle = 'apply';
	o.onclick = function(ev, section_id) {
		var iface = s.formvalue(section_id, 'rt_iface') || 'ra0';
		var mac = s.formvalue(section_id, 'wnm_mac');
		if (!mac) {
			ui.addNotification(null, E('p', {}, _('Please enter a station MAC address first.')));
			return;
		}
		var code = s.formvalue(section_id, 'wnm2_code') || '1';
		var delay = s.formvalue(section_id, 'wnm2_delay') || '0';
		var url = s.formvalue(section_id, 'wnm_url') || '';
		return L.resolveDefault(callWnmReq2(iface, mac, code, delay, url), {}).then(function(res) {
			showOutput(_('Send WNM Deauth Request'), res);
		});
	};

	o = s.taboption('runtime', form.Value, 'qosmap_dscp_exc', _('QoS Map DSCP Exception'),
		_('Optional DSCP exception for the QoS map configure command.'));
	o.optional = true;
	o.datatype = 'uinteger';

	o = s.taboption('runtime', form.Value, 'qosmap_dscp_range', _('QoS Map DSCP Range'),
		_('Optional DSCP range for the QoS map configure command.'));
	o.optional = true;

	o = s.taboption('runtime', form.Button, '_qosmap', _('Send QoS Map Configure'));
	o.inputtitle = _('Send QoS Map');
	o.inputstyle = 'apply';
	o.onclick = function(ev, section_id) {
		var iface = s.formvalue(section_id, 'rt_iface') || 'ra0';
		var mac = s.formvalue(section_id, 'wnm_mac');
		if (!mac) {
			ui.addNotification(null, E('p', {}, _('Please enter a station MAC address first.')));
			return;
		}
		var exc = s.formvalue(section_id, 'qosmap_dscp_exc') || '';
		var rng = s.formvalue(section_id, 'qosmap_dscp_range') || '';
		return L.resolveDefault(callQosMap(iface, mac, exc, rng), {}).then(function(res) {
			showOutput(_('Send QoS Map'), res);
		});
	};

	o = s.taboption('runtime', form.ListValue, 'proxy_arp_family', _('Proxy ARP Table Family'));
	o.value('ipv4', _('IPv4'));
	o.value('ipv6', _('IPv6'));
	o.default = 'ipv4';
	o.rmempty = false;

	o = s.taboption('runtime', form.Button, '_proxyarp', _('Show Proxy ARP Table'));
	o.inputtitle = _('Show Proxy ARP Table');
	o.inputstyle = 'button';
	o.onclick = function(ev, section_id) {
		var family = s.formvalue(section_id, 'proxy_arp_family') || 'ipv4';
		return L.resolveDefault(callProxyArpList(family), {}).then(function(res) {
			showOutput(_('Proxy ARP Table'), res);
		});
	};

		/* ------------------------------------------------------------------ */
		/* status                                                              */
		/* ------------------------------------------------------------------ */

		o = s.taboption('status', form.DummyValue, '_wapp', _('wapp daemon'));
		o.cfgvalue = function() {
			return status.wapp_running ? _('Running') : _('Stopped');
		};

		o = s.taboption('status', form.DummyValue, '_bs20', _('bs20 daemon'));
		o.cfgvalue = function() {
			return status.bs20_running ? _('Running') : _('Stopped');
		};

		o = s.taboption('status', form.DummyValue, '_almac', _('AL MAC'));
		o.cfgvalue = function() {
			return status.al_mac || '-';
		};

		o = s.taboption('status', form.DummyValue, '_mapver', _('MAP version'));
		o.cfgvalue = function() {
			return status.map_ver || '-';
		};

		o = s.taboption('status', form.DummyValue, '_role', _('Device Role'));
		o.cfgvalue = function() {
			return roleText(status.device_role);
		};

		o = s.taboption('status', form.DummyValue, '_mode', _('Device Mode'));
		o.cfgvalue = function() {
			return roleText(status.device_mode);
		};

		o = s.taboption('status', form.DummyValue, '_calid', _('Controller ALID'));
		o.cfgvalue = function() {
			return status.controller_alid || '-';
		};

		o = s.taboption('status', form.DummyValue, '_aalid', _('Agent ALID'));
		o.cfgvalue = function() {
			return status.agent_alid || '-';
		};

		o = s.taboption('status', form.DummyValue, '_radios', _('Radios'));
		o.cfgvalue = function() {
			var radios = status.radios || [];
			if (!radios.length)
				return '-';
			return radios.map(function(r) {
				return '%s (%s, ch %s)'.format(r.name, r.band || '?', r.channel || '?');
			}).join(', ');
		};

		return m.render();
	}
});
