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

var callWizardApply = rpc.declare({
	object: 'luci.easymesh',
	method: 'wizardApply',
	params: [
		'enabled', 'device_mode', 'device_role', 'mesh_sr', 'bandsteering',
		'steeringthresold', 'bh_type', 'bh0_ssid', 'bh0_auth', 'bh0_enc',
		'bh0_key', 'bh0_raid'
	],
	expect: { '': {} }
});

var callPbcTrigger = rpc.declare({
	object: 'luci.easymesh',
	method: 'pbcTrigger',
	params: [ 'iface' ],
	expect: { '': {} }
});

var callSetBhType = rpc.declare({
	object: 'luci.easymesh',
	method: 'setBhType',
	params: [ 'type' ],
	expect: { '': {} }
});

var callBhScan = rpc.declare({
	object: 'luci.easymesh',
	method: 'bhScan',
	params: [ 'iface' ],
	expect: { '': {} }
});

var callBhStatus = rpc.declare({
	object: 'luci.easymesh',
	method: 'bhStatus',
	expect: { '': {} }
});

var callBhConnect = rpc.declare({
	object: 'luci.easymesh',
	method: 'bhConnect',
	params: [ 'iface', 'ssid', 'auth', 'enc', 'key' ],
	expect: { '': {} }
});

var callBhDisconnect = rpc.declare({
	object: 'luci.easymesh',
	method: 'bhDisconnect',
	params: [ 'iface' ],
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

/* ---------------------------------------------------------------------- */
/* backhaul scan (ported from the legacy luci-app-mtk apcli_scan page)     */
/* ---------------------------------------------------------------------- */

/* map a survey "Security" column like "WPA2PSK/AES" onto the auth modes */
function authFromSecurity(sec) {
	sec = sec || '';
	if (sec.indexOf('WPA3') >= 0 || sec.indexOf('SAE') >= 0) return 'WPA3PSK';
	if (sec.indexOf('WPA2PSK') >= 0) return 'WPA2PSK';
	if (sec.indexOf('WPAPSK') >= 0) return 'WPAPSK';
	if (sec.indexOf('WPA2') >= 0) return 'WPA2PSK';
	if (sec.indexOf('WPA') >= 0) return 'WPAPSK';
	return 'OPEN';
}

/* prefer the 5 GHz radio for a backhaul scan when one is present */
function pickScanIface(status) {
	var radios = (status && status.radios) || [];
	for (var i = 0; i < radios.length; i++)
		if (radios[i].band == '5g' || radios[i].band == '6g')
			return 'rax0';
	return 'ra0';
}

/* the wireless backhaul client interface matching the radio picked above */
function pickBhIface(status) {
	return (pickScanIface(status).indexOf('rax') === 0) ? 'apclix0' : 'apcli0';
}

function showBhScanModal(iface, onSelect) {
	ui.showModal(_('Backhaul Scan'), [
		E('p', {}, _('A site survey is running on %s. This takes a few seconds, please wait.').format(iface))
	]);

	return L.resolveDefault(callBhScan(iface), {}).then(function(res) {
		if (!res || res.ok !== true) {
			ui.showModal(_('Backhaul Scan'), [
				E('p', { 'class': 'alert-message warning' },
					(res && res.error) || _('The scan failed or returned no results.')),
				E('div', { 'class': 'right' },
					E('button', { 'class': 'cbi-button', 'click': ui.hideModal }, [ _('Dismiss') ]))
			]);
			return;
		}

		var rows = (res.results || []).map(function(ap) {
			return E('tr', {
				'class': 'tr',
				'style': 'cursor:pointer',
				'click': function() {
					ui.hideModal();
					if (onSelect)
						onSelect(ap);
				}
			}, [
				E('td', { 'class': 'td left' }, ap.ssid || _('(hidden network)')),
				E('td', { 'class': 'td left' }, ap.bssid || '-'),
				E('td', { 'class': 'td left' }, ap.channel || '-'),
				E('td', { 'class': 'td left' }, ap.rssi || '-'),
				E('td', { 'class': 'td left' }, ap.security || '-')
			]);
		});

		ui.showModal(_('Backhaul Scan') + ' (%s)'.format(iface), [
			E('p', {}, _('Click a network to adopt its SSID and authentication mode.')),
			rows.length
				? E('table', { 'class': 'table' }, [
					E('tr', { 'class': 'tr table-titles' }, [
						E('th', { 'class': 'th' }, _('SSID')),
						E('th', { 'class': 'th' }, _('BSSID')),
						E('th', { 'class': 'th' }, _('Channel')),
						E('th', { 'class': 'th' }, _('RSSI (dBm)')),
						E('th', { 'class': 'th' }, _('Security'))
					]) ].concat(rows))
				: E('p', {}, _('No networks found.')),
			E('div', { 'class': 'right' },
				E('button', { 'class': 'cbi-button', 'click': ui.hideModal }, [ _('Dismiss') ]))
		]);
	});
}

/* one line of backhaul link state per apcli interface */
function bhStatusText(bh) {
	var list = (bh && bh.backhaul) || [];
	if (!list.length)
		return '-';
	return list.map(function(b) {
		if (b.conn_state == 'Connected')
			return '%s: %s "%s" (%s) %s'.format(b.ifname, _('connected to'), b.ssid || '?', b.bssid || '-', b.rssi ? b.rssi + ' dBm' : '');
		return '%s: %s'.format(b.ifname, _('disconnected'));
	}).join('<br />');
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

/* ---------------------------------------------------------------------- */
/* status overview card                                                    */
/* ---------------------------------------------------------------------- */

function statusBadge(ok, okText, badText) {
	return E('span', {
		'class': ok ? 'label notice' : 'label',
		'style': ok ? '' : 'background:#c44;white-space:nowrap'
	}, ok ? okText : badText);
}

function renderStatusCard(cfg, status) {
	status = status || {};

	var rows = [
		E('tr', { 'class': 'tr' }, [
			E('td', { 'class': 'td left', 'style': 'width:30%' }, [ E('strong', {}, _('EasyMesh')) ]),
			E('td', { 'class': 'td left' }, [
				statusBadge(cfg.enabled == '1', _('enabled'), _('disabled'))
			])
		]),
		E('tr', { 'class': 'tr' }, [
			E('td', { 'class': 'td left' }, [ E('strong', {}, _('wapp daemon')) ]),
			E('td', { 'class': 'td left' }, [
				statusBadge(status.wapp_running, _('running'), _('not running'))
			])
		]),
		E('tr', { 'class': 'tr' }, [
			E('td', { 'class': 'td left' }, [ E('strong', {}, _('bs20 daemon')) ]),
			E('td', { 'class': 'td left' }, [
				statusBadge(status.bs20_running, _('running'), _('not running'))
			])
		]),
		E('tr', { 'class': 'tr' }, [
			E('td', { 'class': 'td left' }, [ E('strong', {}, _('Current Device Role')) ]),
			E('td', { 'class': 'td left' }, roleText(status.device_role))
		]),
		E('tr', { 'class': 'tr' }, [
			E('td', { 'class': 'td left' }, [ E('strong', {}, _('MAP version')) ]),
			E('td', { 'class': 'td left' }, status.map_ver || '-')
		])
	];

	var radios = status.radios || [];
	var radioNames = radios.map(function(r) { return r.name; }).join(', ');
	rows.push(E('tr', { 'class': 'tr' }, [
		E('td', { 'class': 'td left' }, [ E('strong', {}, _('Radios')) ]),
		E('td', { 'class': 'td left' }, radioNames ? '%d (%s)'.format(radios.length, radioNames) : '-')
	]));

	return E('div', { 'class': 'cbi-section' }, [
		E('h3', {}, _('Status Overview')),
		E('table', { 'class': 'table' }, rows)
	]);
}

/* ---------------------------------------------------------------------- */
/* unapplied changes detection (uci value vs live config file value)       */
/* ---------------------------------------------------------------------- */

function detectDrift(cfg) {
	if (!cfg || !cfg.live)
		return null;

	var drifted = [];
	for (var key in cfg.live) {
		if (String(cfg[key] != null ? cfg[key] : '') != String(cfg.live[key] != null ? cfg.live[key] : ''))
			drifted.push(key);
	}

	if (cfg.device_role && cfg.cur_role && cfg.device_role != 'auto' && cfg.device_role != cfg.cur_role)
		drifted.push('device_role');
	if (cfg.device_mode && cfg.cur_mode && cfg.cur_mode != 'unknown' && cfg.device_mode != cfg.cur_mode)
		drifted.push('device_mode');

	return drifted.length ? drifted : null;
}

function renderDriftBanner(drifted) {
	return E('div', { 'class': 'alert-message warning', 'style': 'margin-bottom:12px' }, [
		E('p', {}, _('Some settings differ from the running configuration: %s').format(drifted.join(', '))),
		E('p', {}, _('Click "Save & Apply" to push the pending options to mapd_cfg / 1905d.cfg and restart the daemons.'))
	]);
}

/* ---------------------------------------------------------------------- */
/* daemon health check after apply                                         */
/* ---------------------------------------------------------------------- */

function checkDaemonHealth(enabled, done) {
	if (enabled != '1') {
		if (done) done();
		return;
	}
	setTimeout(function() {
		L.resolveDefault(callGetStatus(), {}).then(function(status) {
			if (status && !status.wapp_running)
				ui.addNotification(null, E('p', { 'class': 'alert-message error' },
					_('wapp is still not running. Check that an EasyMesh daemon set is installed (mtwifi-wapp: wapp / bs20 / startwapp.sh in /sbin, or the MTK SDK set: /etc/init.d/wapp with wapp / p1905_managerd / mapd) and inspect the system log: logread | grep -e wapp -e bs20 -e 1905 -e mapd.')));
			if (done) done();
		});
	}, 3000);
}

/* ---------------------------------------------------------------------- */
/* wizard validation                                                       */
/* ---------------------------------------------------------------------- */

function validateWizard(v) {
	if (v.bh_type == 'wifi') {
		if (!v.bh0_ssid)
			return _('Please enter the backhaul SSID for wireless backhaul.');
		if (v.bh0_auth && v.bh0_auth != 'OPEN' && !v.bh0_key)
			return _('Please enter the backhaul passphrase for the selected authentication mode.');
	}
	var th = parseInt(v.steeringthresold, 10);
	if (isNaN(th) || th > 0 || th < -100)
		return _('The steering RSSI threshold must be a negative dBm value (e.g. -65).');
	return null;
}

/* ---------------------------------------------------------------------- */
/* setup wizard: a small guided flow that writes the same options as the  */
/* form below (same source of truth, two-way synced)                      */
/* ---------------------------------------------------------------------- */

var WIZ_STEPS = 4;

function wizardSummary(v) {
	var rows = [
		[ _('Enable EasyMesh'), v.enabled == '1' ? _('enabled') : _('disabled') ],
		[ _('Device Role'), roleText(v.device_role) ],
		[ _('Device Mode'), roleText(v.device_mode) ],
		[ _('Mesh SR'), v.mesh_sr == '1' ? _('enabled') : _('disabled') ],
		[ _('Band Steering'), v.bandsteering == '1' ? _('enabled') : _('disabled') ],
		[ _('Steering RSSI Threshold'), v.steeringthresold ],
		[ _('Backhaul Type'), v.bh_type == 'wifi' ? _('Wireless backhaul') : _('Ethernet backhaul') ]
	];
	if (v.bh_type == 'wifi') {
		rows.push([ _('Backhaul SSID'), v.bh0_ssid || '-' ]);
		rows.push([ _('Backhaul Authentication'), v.bh0_auth || '-' ]);
	}
	return E('table', { 'class': 'table' },
		rows.map(function(r) {
			return E('tr', { 'class': 'tr' }, [
				E('td', { 'class': 'td left', 'style': 'width:40%' }, [ E('strong', {}, r[0]) ]),
				E('td', { 'class': 'td left' }, [ r[1] ])
			]);
		}));
}

function renderWizardStep(step, v, cfg) {
	var body = [];

	if (step == 1) {
		body.push(E('p', {}, _('Step %d of %d: device role and mode.').format(step, WIZ_STEPS)));
		body.push(E('div', { 'class': 'cbi-value' }, [
			E('label', { 'class': 'cbi-value-title' }, [ _('Enable EasyMesh') ]),
			E('div', { 'class': 'cbi-value-field' }, [
				E('input', {
					'type': 'checkbox', 'id': 'wiz-enabled',
					'checked': v.enabled == '1' ? 'checked' : null
				})
			])
		]));
		body.push(E('div', { 'class': 'cbi-value' }, [
			E('label', { 'class': 'cbi-value-title' }, [ _('Device Role') ]),
			E('div', { 'class': 'cbi-value-field' }, [
				E('select', { 'id': 'wiz-role', 'class': 'cbi-input-select' }, [
					E('option', { 'value': 'controller', 'selected': v.device_role == 'controller' ? 'selected' : null }, [ _('Controller') ]),
					E('option', { 'value': 'agent', 'selected': v.device_role == 'agent' ? 'selected' : null }, [ _('Agent') ]),
					E('option', { 'value': 'auto', 'selected': v.device_role == 'auto' ? 'selected' : null }, [ _('Auto') ])
				]),
				E('div', { 'class': 'cbi-value-description' },
					_('Current role: %s').format(roleText(cfg.cur_role)))
			])
		]));
		body.push(E('div', { 'class': 'cbi-value' }, [
			E('label', { 'class': 'cbi-value-title' }, [ _('Device Mode') ]),
			E('div', { 'class': 'cbi-value-field' }, [
				E('select', { 'id': 'wiz-mode', 'class': 'cbi-input-select' }, [
					E('option', { 'value': 'router', 'selected': v.device_mode == 'router' ? 'selected' : null }, [ _('Router') ]),
					E('option', { 'value': 'bridge', 'selected': v.device_mode == 'bridge' ? 'selected' : null }, [ _('Bridge') ])
				])
			])
		]));
	}
	else if (step == 2) {
		body.push(E('p', {}, _('Step %d of %d: radio features.').format(step, WIZ_STEPS)));
		body.push(E('div', { 'class': 'cbi-value' }, [
			E('label', { 'class': 'cbi-value-title' }, [ _('Mesh SR') ]),
			E('div', { 'class': 'cbi-value-field' }, [
				E('input', {
					'type': 'checkbox', 'id': 'wiz-meshsr',
					'checked': v.mesh_sr == '1' ? 'checked' : null
				}),
				E('div', { 'class': 'cbi-value-description' },
					_('Mesh seamless roaming (802.11r fast transition) on the radios.'))
			])
		]));
		body.push(E('div', { 'class': 'cbi-value' }, [
			E('label', { 'class': 'cbi-value-title' }, [ _('Band Steering') ]),
			E('div', { 'class': 'cbi-value-field' }, [
				E('input', {
					'type': 'checkbox', 'id': 'wiz-bs',
					'checked': v.bandsteering == '1' ? 'checked' : null
				})
			])
		]));
		body.push(E('div', { 'class': 'cbi-value' }, [
			E('label', { 'class': 'cbi-value-title' }, [ _('Steering RSSI Threshold') ]),
			E('div', { 'class': 'cbi-value-field' }, [
				E('input', {
					'type': 'text', 'id': 'wiz-th', 'class': 'cbi-input-text',
					'value': v.steeringthresold
				}),
				E('div', { 'class': 'cbi-value-description' }, _('dBm'))
			])
		]));
	}
	else if (step == 3) {
		body.push(E('p', {}, _('Step %d of %d: backhaul connection.').format(step, WIZ_STEPS)));
		body.push(E('div', { 'class': 'cbi-value' }, [
			E('label', { 'class': 'cbi-value-title' }, [ _('Backhaul Type') ]),
			E('div', { 'class': 'cbi-value-field' }, [
				E('select', {
					'id': 'wiz-bhtype', 'class': 'cbi-input-select',
					'change': function(ev) {
						var box = document.getElementById('wiz-bhwifi');
						if (box)
							box.style.display = (ev.target.value == 'wifi') ? '' : 'none';
					}
				}, [
					E('option', { 'value': 'eth', 'selected': v.bh_type != 'wifi' ? 'selected' : null }, [ _('Ethernet backhaul') ]),
					E('option', { 'value': 'wifi', 'selected': v.bh_type == 'wifi' ? 'selected' : null }, [ _('Wireless backhaul') ])
				]),
				E('div', { 'class': 'cbi-value-description' },
					_('How this device connects to the mesh network.'))
			])
		]));
		body.push(E('div', { 'id': 'wiz-bhwifi', 'style': (v.bh_type == 'wifi') ? '' : 'display:none' }, [
			E('div', { 'class': 'cbi-value' }, [
				E('label', { 'class': 'cbi-value-title' }, [ _('Backhaul SSID') ]),
				E('div', { 'class': 'cbi-value-field' }, [
					E('input', { 'type': 'text', 'id': 'wiz-bhssid', 'class': 'cbi-input-text', 'value': v.bh0_ssid }),
					' ',
					E('button', {
						'class': 'btn',
						'click': function() {
							showBhScanModal(pickScanIface(cfg), function(ap) {
								var el = document.getElementById('wiz-bhssid');
								if (el) el.value = ap.ssid || '';
								var au = document.getElementById('wiz-bhauth');
								if (au) au.value = authFromSecurity(ap.security);
							});
						}
					}, [ _('Scan...') ])
				])
			]),
			E('div', { 'class': 'cbi-value' }, [
				E('label', { 'class': 'cbi-value-title' }, [ _('Backhaul Authentication') ]),
				E('div', { 'class': 'cbi-value-field' }, [
					E('select', { 'id': 'wiz-bhauth', 'class': 'cbi-input-select' }, [
						E('option', { 'value': 'OPEN', 'selected': v.bh0_auth == 'OPEN' ? 'selected' : null }, [ _('Open') ]),
						E('option', { 'value': 'WPAPSK', 'selected': v.bh0_auth == 'WPAPSK' ? 'selected' : null }, [ _('WPA-PSK') ]),
						E('option', { 'value': 'WPA2PSK', 'selected': v.bh0_auth == 'WPA2PSK' ? 'selected' : null }, [ _('WPA2-PSK') ]),
						E('option', { 'value': 'WPA3PSK', 'selected': v.bh0_auth == 'WPA3PSK' ? 'selected' : null }, [ _('WPA3-PSK (SAE)') ])
					])
				])
			]),
			E('div', { 'class': 'cbi-value' }, [
				E('label', { 'class': 'cbi-value-title' }, [ _('Backhaul Passphrase') ]),
				E('div', { 'class': 'cbi-value-field' }, [
					E('input', { 'type': 'password', 'id': 'wiz-bhkey', 'class': 'cbi-input-text', 'value': v.bh0_key })
				])
			])
		]));
	}
	else {
		body.push(E('p', {}, _('Step %d of %d: review and apply.').format(step, WIZ_STEPS)));
		body.push(wizardSummary(v));
		body.push(E('p', {}, _('The wizard writes the same options as the form on this page; the Advanced Settings page always shows the same values.')));
	}

	return body;
}

function collectWizardStep(step, v) {
	if (step == 1) {
		var e = document.getElementById('wiz-enabled');
		var r = document.getElementById('wiz-role');
		var m = document.getElementById('wiz-mode');
		if (e) v.enabled = e.checked ? '1' : '0';
		if (r) v.device_role = r.value;
		if (m) v.device_mode = m.value;
	}
	else if (step == 2) {
		var s = document.getElementById('wiz-meshsr');
		var b = document.getElementById('wiz-bs');
		var t = document.getElementById('wiz-th');
		if (s) v.mesh_sr = s.checked ? '1' : '0';
		if (b) v.bandsteering = b.checked ? '1' : '0';
		if (t) v.steeringthresold = t.value.trim();
	}
	else if (step == 3) {
		var ty = document.getElementById('wiz-bhtype');
		var ssid = document.getElementById('wiz-bhssid');
		var auth = document.getElementById('wiz-bhauth');
		var key = document.getElementById('wiz-bhkey');
		if (ty) v.bh_type = ty.value;
		if (ssid) v.bh0_ssid = ssid.value.trim();
		if (auth) v.bh0_auth = auth.value;
		if (key) v.bh0_key = key.value;
	}
	return v;
}

function showWizardStep(step, v, cfg) {
	var buttons = [
		E('button', {
			'class': 'btn',
			'click': function() { ui.hideModal(); }
		}, [ _('Cancel') ])
	];
	if (step > 1)
		buttons.push(E('button', {
			'class': 'btn',
			'click': function() {
				collectWizardStep(step, v);
				showWizardStep(step - 1, v, cfg);
			}
		}, [ _('Previous') ]));

	if (step < WIZ_STEPS)
		buttons.push(E('button', {
			'class': 'btn cbi-button-positive important',
			'click': function() {
				collectWizardStep(step, v);
				var err = validateWizard(v);
				if (err) {
					ui.addNotification(null, E('p', { 'class': 'alert-message warning' }, err));
					return;
				}
				showWizardStep(step + 1, v, cfg);
			}
		}, [ _('Next') ]));
	else
		buttons.push(E('button', {
			'class': 'btn cbi-button-positive important',
			'click': function(ev) {
				ev.target.disabled = true;
				return L.resolveDefault(callWizardApply(
					v.enabled, v.device_mode, v.device_role,
					v.mesh_sr, v.bandsteering, v.steeringthresold,
					v.bh_type, v.bh0_ssid, v.bh0_auth,
					v.bh0_enc, v.bh0_key, v.bh0_raid
				), {}).then(function(res) {
					ui.hideModal();
					if (res && res.ok) {
						ui.addNotification(null, E('p', {}, _('Setup wizard finished, EasyMesh configuration applied.')));
						checkDaemonHealth(res.enabled, function() {
							setTimeout(function() { location.reload(); }, 1000);
						});
					}
					else {
						ui.addNotification(null, E('p', {}, _('Setup wizard failed: %s').format((res && res.error) || _('unknown error'))));
					}
				});
			}
		}, [ _('Finish and apply') ]));

	ui.showModal(_('EasyMesh Setup Wizard'), renderWizardStep(step, v, cfg).concat([
		E('div', { 'class': 'right' }, buttons)
	]));
}

function runWizard(cfg) {
	var v = {
		enabled: cfg.enabled || '0',
		device_role: cfg.device_role || 'controller',
		device_mode: cfg.device_mode || 'router',
		mesh_sr: cfg.mesh_sr || '1',
		bandsteering: cfg.bandsteering || '1',
		steeringthresold: cfg.steeringthresold || '-65',
		bh_type: cfg.bh_type || 'eth',
		bh0_ssid: cfg.bh0_ssid || '',
		bh0_auth: cfg.bh0_auth || '',
		bh0_enc: cfg.bh0_enc || '',
		bh0_key: cfg.bh0_key || '',
		bh0_raid: cfg.bh0_raid || ''
	};
	showWizardStep(1, v, cfg);
}

return view.extend({
	load: function() {
		return Promise.all([
			uci.load('easymesh'),
			L.resolveDefault(callGetConfig(), {}),
			L.resolveDefault(callGetStatus(), {}),
			L.resolveDefault(callBhStatus(), {})
		]);
	},

	handleSave: function(ev) {
		var self = this;
		return this.super('handleSave', ev).then(function() {
			return self.load().then(function(data) {
				var cfg = data[1] || {};
				return L.resolveDefault(callApplyConfig(), {}).then(function(res) {
					var msg;
					if (res.enabled != '1')
						msg = _('EasyMesh has been disabled. Note: band steering and 802.11r are also disabled on the radios to keep wapp stopped.');
					else if (res.restarted)
						msg = _('EasyMesh configuration applied, wapp / bs20 have been restarted (via %s).').format(res.started_via || 'startwapp.sh');
					else if (!cfg.wapp_available)
						msg = _('Applied, but no EasyMesh daemon was found. Install either the mtwifi-wapp package (provides wapp / bs20 / startwapp.sh in /sbin) or the MTK SDK EasyMesh set (provides wapp / 1905daemon / mapd with /etc/init.d/wapp), then apply again.');
					else
						msg = _('EasyMesh configuration applied, but the wapp daemon did not come up: %s. Check the system log (logread | grep -e wapp -e bs20) and the wireless configuration.').format(res.started_via || _('unknown reason'));
					ui.addNotification(null, E('p', {}, msg));
					checkDaemonHealth(res.enabled);
				});
			});
		});
	},

	render: function(data) {
		var cfg = data[1] || {};
		var status = data[2] || {};
		var bhstatus = data[3] || {};
		var m, s, o;

		var header = E('div', {}, [ renderStatusCard(cfg, status) ]);
		var drifted = detectDrift(cfg);
		if (drifted)
			header.appendChild(renderDriftBanner(drifted));

		m = new form.Map('easymesh', _('EasyMesh Basic Settings'),
			_('Core options for MTK EasyMesh (MAP / wapp / bs20). Expert level options are available on the Advanced Settings page.'));

		s = m.section(form.NamedSection, 'config', 'easymesh');
		s.tab('general', _('General'));
		s.tab('wireless', _('Radio Features'));
		s.tab('backhaul', _('Backhaul'));

		/* ------------------------------------------------------------------ */
		/* general                                                             */
		/* ------------------------------------------------------------------ */

		o = s.taboption('general', form.Flag, 'enabled', _('Enable EasyMesh'),
			_('Master switch. When enabled, the wapp / bs20 daemons are started and the radios join the MAP network.'));
		o.default = o.disabled;
		o.rmempty = false;

		o = s.taboption('general', form.ListValue, 'device_mode', _('Device Mode'),
			_('Written to mapd_cfg "mode": Router (1) keeps DHCP / NAT, Bridge (2) turns the device into a pure MAP bridge.'));
		o.value('router', _('Router'));
		o.value('bridge', _('Bridge'));
		o.default = 'router';
		o.rmempty = false;

		o = s.taboption('general', form.DummyValue, '_cur_mode', _('Current Device Mode'));
		o.cfgvalue = function() {
			return roleText(cfg.cur_mode);
		};

		o = s.taboption('general', form.ListValue, 'device_role', _('Device Role'),
			_('Written to mapd_cfg "DeviceRole" and 1905d.cfg "map_root": Controller (MAP root), Agent (MAP repeater) or Auto.'));
		o.value('auto', _('Auto'));
		o.value('controller', _('Controller'));
		o.value('agent', _('Agent'));
		o.default = 'controller';
		o.rmempty = false;

		o = s.taboption('general', form.DummyValue, '_cur_role', _('Current Device Role'));
		o.cfgvalue = function() {
			return roleText(cfg.cur_role);
		};

		o = s.taboption('general', form.Button, '_wizard', _('Setup Wizard'),
			_('Guided setup for the most common EasyMesh options. It writes the same options as the form on this page.'));
		o.inputtitle = _('Start Setup Wizard');
		o.inputstyle = 'apply';
		o.onclick = function() {
			runWizard(cfg);
		};

		o = s.taboption('general', form.Button, '_pbc', _('PBC On-boarding'),
			_('Trigger WPS push-button on-boarding for MAP agents.'));
		o.inputtitle = _('Trigger Wi-Fi On-boarding');
		o.inputstyle = 'apply';
		o.onclick = function() {
			return L.resolveDefault(callPbcTrigger('ra0'), {}).then(function(res) {
				showOutput(_('Wi-Fi On-boarding (PBC)'), res);
			});
		};

		o = s.taboption('general', form.Button, '_reset_page', _('Reset this page'),
			_('Restore all options of the Basic Settings page to their defaults and restart the daemons. The wireless configuration is not touched.'));
		o.inputtitle = _('Reset Basic Settings');
		o.inputstyle = 'reset';
		o.onclick = function() {
			return confirmResetPage(_('Reset Basic Settings')).then(function() {
				return L.resolveDefault(callResetPage('basic'), {}).then(function(res) {
					notifyResetResult(res);
				});
			});
		};

		/* ------------------------------------------------------------------ */
		/* wireless                                                            */
		/* ------------------------------------------------------------------ */

		o = s.taboption('wireless', form.Flag, 'mesh_sr', _('Mesh SR'),
			_('Enable mesh seamless roaming (ieee80211r / fast transition) on the radios.'));
		o.default = o.enabled;
		o.rmempty = false;

		o = s.taboption('wireless', form.Flag, 'bandsteering', _('Band Steering'),
			_('Enable band steering on mtwifi radios (synced to wireless UCI).'));
		o.default = o.enabled;
		o.rmempty = false;

		o = s.taboption('wireless', form.Value, 'steeringthresold', _('Steering RSSI Threshold'),
			_('steeringthresold applied to every AP interface (dBm).'));
		o.datatype = 'integer';
		o.default = '-65';
		o.rmempty = false;

		/* ------------------------------------------------------------------ */
		/* backhaul                                                            */
		/* ------------------------------------------------------------------ */

		o = s.taboption('backhaul', form.ListValue, 'bh_type', _('Backhaul Type'),
		_('How this device connects to the mesh network (bh_type in 1905d.cfg).'));
	o.value('eth', _('Ethernet backhaul'));
	o.value('wifi', _('Wireless backhaul'));
	o.default = 'eth';
	o.rmempty = false;

	o = s.taboption('backhaul', form.DummyValue, '_bh_link', _('Backhaul Link State'),
		_('Current state of the wireless backhaul client interfaces (apcli).'));
	o.cfgvalue = function() {
		return bhStatusText(bhstatus);
	};
	o.rawhtml = true;

	o = s.taboption('backhaul', form.Button, '_bh_scan', _('Scan for Backhaul Networks'),
		_('Run a site survey and pick the backhaul SSID from the surrounding networks (ported from the legacy luci-app-mtk).'));
	o.inputtitle = _('Scan...');
	o.inputstyle = 'action';
	o.onclick = function() {
		showBhScanModal(pickScanIface(status), function(ap) {
			var el = document.querySelector('input[id$=".bh0_ssid"]');
			if (el) el.value = ap.ssid || '';
			var au = document.querySelector('select[id$=".bh0_auth"]');
			if (au) au.value = authFromSecurity(ap.security);
			ui.addNotification(null, E('p', {},
				_('Adopted "%s" (%s). Remember to save & apply.').format(ap.ssid || '', ap.bssid || '-')));
		});
	};

	o = s.taboption('backhaul', form.Button, '_bh_connect', _('Connect Wireless Backhaul'),
		_('Bring the wireless backhaul client (apcli) up with the backhaul profile 0 credentials entered on this page (ported from the legacy luci-app-mtk apcli connect).'));
	o.inputtitle = _('Connect Backhaul');
	o.inputstyle = 'apply';
	o.onclick = function(ev, section_id) {
		var ssid = (s.formvalue(section_id, 'bh0_ssid') || '').trim();
		var auth = s.formvalue(section_id, 'bh0_auth') || '';
		var enc = s.formvalue(section_id, 'bh0_enc') || '';
		var key = s.formvalue(section_id, 'bh0_key') || '';
		if (!ssid.length) {
			ui.addNotification(null, E('p', { 'class': 'alert-message warning' },
				_('Please enter the backhaul SSID (and passphrase) below first.')));
			return;
		}
		return L.resolveDefault(callBhConnect(pickBhIface(status), ssid, auth, enc, key), {})
			.then(function(res) {
				if (res && res.ok) {
					ui.addNotification(null, E('p', {},
						_('Backhaul connect issued on %s for "%s". The profile has been saved; the link state above updates after the page reloads.')
							.format(res.iface, res.ssid || ssid)));
					setTimeout(function() { location.reload(); }, 3000);
				}
				else {
					ui.addNotification(null, E('p', { 'class': 'alert-message warning' },
						(res && res.error) || _('The connect failed.')));
				}
			});
	};

	o = s.taboption('backhaul', form.Button, '_bh_disconnect', _('Disconnect Wireless Backhaul'),
		_('Tear the wireless backhaul client (apcli) connection down (ported from the legacy luci-app-mtk apcli disconnect).'));
	o.inputtitle = _('Disconnect Backhaul');
	o.inputstyle = 'reset';
	o.onclick = function() {
		return new Promise(function(resolve) {
			ui.showModal(_('Disconnect Backhaul'), [
				E('p', {}, _('This disables the apcli backhaul client and brings its interface down. The saved backhaul profile is kept.')),
				E('div', { 'class': 'right' }, [
					E('button', {
						'class': 'btn',
						'click': function() { ui.hideModal(); resolve(false); }
					}, [ _('Cancel') ]),
					' ',
					E('button', {
						'class': 'btn cbi-button-negative important',
						'click': function() { ui.hideModal(); resolve(true); }
					}, [ _('Disconnect') ])
				])
			]);
		}).then(function(go) {
			if (!go)
				return;
			return L.resolveDefault(callBhDisconnect(pickBhIface(status)), {})
				.then(function(res) {
					if (res && res.ok) {
						ui.addNotification(null, E('p', {},
							_('Backhaul client %s has been disconnected.').format(res.iface)));
						setTimeout(function() { location.reload(); }, 1500);
					}
					else {
						ui.addNotification(null, E('p', { 'class': 'alert-message warning' },
							(res && res.error) || _('The disconnect failed.')));
					}
				});
		});
	};

		o = s.taboption('backhaul', form.Button, '_set_bh_type', _('Apply Backhaul Type at Runtime'));
		o.inputtitle = _('Apply Backhaul Type');
		o.inputstyle = 'apply';
		o.onclick = function(ev, section_id) {
			var t = s.formvalue(section_id, 'bh_type') || 'eth';
			return L.resolveDefault(callSetBhType(t), {}).then(function(res) {
				showOutput(_('Apply Backhaul Type'), res);
			});
		};

		o = s.taboption('backhaul', form.Flag, 'bh0_valid', _('Backhaul Profile 0 Active'),
			_('BhProfile0Valid in mapd_cfg.'));
		o.default = o.disabled;
		o.rmempty = false;

		o = s.taboption('backhaul', form.Value, 'bh0_ssid', _('Backhaul Profile 0 SSID'),
			_('BhProfile0Ssid in mapd_cfg.'));
		o.optional = true;

		o = s.taboption('backhaul', form.ListValue, 'bh0_auth', _('Backhaul Profile 0 Authentication'),
			_('BhProfile0AuthMode in mapd_cfg.'));
		o.value('', _('-- auto --'));
		o.value('OPEN', _('Open'));
		o.value('WPAPSK', _('WPA-PSK'));
		o.value('WPA2PSK', _('WPA2-PSK'));
		o.value('WPA3PSK', _('WPA3-PSK (SAE)'));
		o.optional = true;

		o = s.taboption('backhaul', form.Value, 'bh0_key', _('Backhaul Profile 0 Passphrase'),
			_('BhProfile0WpaPsk in mapd_cfg.'));
		o.optional = true;
		o.password = true;

		o = s.taboption('backhaul', form.Value, 'bh0_enc', _('Backhaul Profile 0 Encryption'),
			_('BhProfile0EncrypType in mapd_cfg, e.g. AES / TKIP / CCMP128.'));
		o.optional = true;

		o = s.taboption('backhaul', form.Value, 'bh0_raid', _('Backhaul Profile 0 Ra ID'),
			_('BhProfile0RaID in mapd_cfg.'));
		o.optional = true;

		return m.render().then(function(node) {
			return E('div', {}, [ header, node ]);
		});
	}
});
