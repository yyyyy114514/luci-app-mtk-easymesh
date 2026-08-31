'use strict';
'require rpc';
'require ui';
'require view';

var callGetTopology = rpc.declare({
	object: 'luci.easymesh',
	method: 'getTopology',
	expect: { '': {} }
});

var showAll = false;
var autoRefresh = false;
var refreshTimer = null;

function roleText(role) {
	return role == 'controller' ? _('Controller')
		: role == 'agent' ? _('Agent')
		: role == 'auto' ? _('Auto')
		: role == 'router' ? _('Router')
		: role == 'bridge' ? _('Bridge')
		: role == 'unknown' ? _('Unknown')
		: (role || '-');
}

function roleColor(role) {
	return (role == 'agent') ? '#e8912d'
		: (role == 'controller') ? '#2f6fd0'
		: '#808894';
}

/* one node card; no hardcoded background so dark themes keep working */
function nodeBox(title, lines, color, extraClass) {
	var kids = [
		E('div', { 'style': 'font-weight:bold;color:%s;margin-bottom:6px'.format(color) }, title)
	];
	for (var i = 0; i < lines.length; i++)
		kids.push(E('div', { 'style': 'font-size:12px;line-height:1.6' }, lines[i]));

	return E('div', {
		'class': 'easymesh-node' + (extraClass ? ' ' + extraClass : ''),
		'style': 'display:inline-block;vertical-align:top;margin:6px;padding:10px 14px;' +
			'border:2px solid %s;border-radius:8px;min-width:190px'.format(color)
	}, kids);
}

/* a tree level: children are indented below their parent with a guide line */
function treeLevel(children) {
	return E('div', {
		'style': 'margin:4px 0 4px 18px;padding-left:18px;border-left:2px solid #808894'
	}, children);
}

function renderTopology(topo) {
	topo = topo || {};
	var role = topo.device_role || 'auto';
	var color = roleColor(role);
	var children = [];

	if (!topo.wapp_running)
		children.push(E('div', { 'class': 'alert-message warning', 'style': 'margin-bottom:12px' },
			_('wapp is not running. Enable EasyMesh and apply the configuration first.')));

	var devLines = [
		'%s: %s'.format(_('Role'), roleText(role)),
		'%s: %s'.format(_('Mode'), roleText(topo.device_mode)),
		'%s: %s'.format(_('AL MAC'), topo.al_mac || '-'),
		'%s: %s'.format(_('MAP version'), topo.map_ver || '-')
	];
	if (showAll) {
		devLines.push('%s: %s'.format(_('Controller ALID'), topo.controller_alid || '-'));
		devLines.push('%s: %s'.format(_('Agent ALID'), topo.agent_alid || '-'));
	}

	/* group stations by radio so the mesh hierarchy is visible */
	var stas = topo.stations || [];
	var stasByRadio = {};
	var orphans = [];
	stas.forEach(function(st) {
		if (st.radio)
			(stasByRadio[st.radio] = stasByRadio[st.radio] || []).push(st);
		else
			orphans.push(st);
	});

	var radios = topo.radios || [];
	var radioNodes = radios.map(function(r) {
		var lines = [
			'%s: %s'.format(_('Band'), r.band || '-'),
			'%s: %s'.format(_('Channel'), r.channel || '-')
		];
		if (showAll)
			lines.push('%s: %s'.format(_('DBDC main'), r.dbdc_main || '0'));

		var rStas = stasByRadio[r.name] || [];
		lines.push('%s: %d'.format(_('Stations'), rStas.length));

		var node = nodeBox('%s: %s'.format(_('Radio'), r.name), lines, '#808894');

		if (rStas.length) {
			var staNodes = rStas.map(function(st) {
				var sLines = [ '%s: %s dBm'.format(_('RSSI'), st.rssi || '?') ];
				if (showAll) {
					sLines.push('%s: %s'.format(_('Interface'), st.ifname || '-'));
					sLines.push('%s: %s'.format(_('Band'), st.band || '-'));
					if (st.ip)
						sLines.push('%s: %s'.format(_('IP'), st.ip));
				}
				/* prefer the DHCP hostname as the node title, like the
				 * legacy luci-app-mtk station list did */
				return nodeBox(st.hostname || st.mac || _('Unknown'), sLines, '#3a9a3a');
			});
			return E('div', {}, [
				node,
				treeLevel(staNodes)
			]);
		}
		return E('div', {}, [ node ]);
	});

	/* stations that could not be mapped to a radio */
	if (orphans.length) {
		radioNodes.push(E('div', {}, [
			nodeBox(_('Unassigned'), [ '%s: %d'.format(_('Stations'), orphans.length) ], '#808894'),
			treeLevel(orphans.map(function(st) {
				return nodeBox(st.mac || _('Unknown'),
					[ '%s: %s dBm'.format(_('RSSI'), st.rssi || '?') ], '#3a9a3a');
			}))
		]));
	}

	/* wireless backhaul (apcli) links, shown as an extra child of this device */
	var bhLinks = (topo.backhaul || []).filter(function(b) {
		return b.conn_state == 'Connected';
	});
	if (bhLinks.length) {
		radioNodes.push(treeLevel(bhLinks.map(function(b) {
			var lines = [
				'%s: %s'.format(_('Interface'), b.ifname || '-'),
				'%s: %s'.format(_('SSID'), b.ssid || '-'),
				'%s: %s'.format(_('BSSID'), b.bssid || '-')
			];
			if (b.rssi)
				lines.push('%s: %s dBm'.format(_('RSSI'), b.rssi));
			return nodeBox('%s: %s'.format(_('Backhaul'), b.ifname), lines, '#2f6fd0');
		})));
	}

	children.push(E('div', {}, [
		nodeBox(_('This Device'), devLines, color),
		treeLevel(radioNodes)
	]));

	if (!radios.length && !stas.length)
		children.push(E('div', { 'style': 'margin-top:8px' },
			E('em', {}, _('No radios or stations detected.'))));

	return E('div', {}, children);
}

function update(container) {
	return L.resolveDefault(callGetTopology(), {}).then(function(topo) {
		container.innerHTML = '';
		container.appendChild(renderTopology(topo));
	});
}

function stopAutoRefresh() {
	if (refreshTimer != null) {
		clearInterval(refreshTimer);
		refreshTimer = null;
	}
	autoRefresh = false;
}

return view.extend({
	handleSave: null,
	handleSaveApply: null,
	handleReset: null,

	load: function() {
		return L.resolveDefault(callGetTopology(), {});
	},

	render: function(topo) {
		var container = E('div', { 'id': 'easymesh-topology' }, renderTopology(topo));

		var refreshBtn = E('button', {
			'class': 'cbi-button',
			'click': function() {
				return update(container);
			}
		}, [ _('Refresh') ]);

		var autoLabel = E('label', { 'style': 'margin-left:12px;cursor:pointer' }, [
			E('input', {
				'type': 'checkbox',
				'change': function(ev) {
					if (ev.target.checked) {
						autoRefresh = true;
						refreshTimer = setInterval(function() {
							update(container);
						}, 5000);
					}
					else {
						stopAutoRefresh();
					}
				}
			}),
			' ',
			_('Auto refresh (every 5 seconds)')
		]);

		var toolbar = E('div', { 'style': 'margin-bottom:14px' }, [
			E('button', {
				'class': 'cbi-button cbi-button-apply',
				'click': function(ev) {
					showAll = !showAll;
					ev.currentTarget.textContent = showAll
						? _('Hide detailed info') : _('Show all device info');
					return update(container);
				}
			}, [ _('Show all device info') ]),
			' ',
			refreshBtn,
			autoLabel
		]);

		return E('div', {}, [
			E('h2', {}, _('EasyMesh Run-time Topology Display')),
			toolbar,
			container
		]);
	},

	handleDestroy: function() {
		stopAutoRefresh();
	}
});
