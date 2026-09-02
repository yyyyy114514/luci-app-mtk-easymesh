'use strict';
'require view';
'require rpc';
'require ui';

// The package version string. It is rewritten by the ipk build workflow
// (build-ipk.yml) via sed so the build can stamp an arbitrary version.
var PKG_VERSION = '0.2.1beta';

var callCollectDiagnostics = rpc.declare({
	object: 'luci.easymesh',
	method: 'collectDiagnostics',
	expect: { '': {} }
});

return view.extend({
	load: function() {
		return null;
	},

	handleDiagnostics: function(ev) {
		var btn = ev.target;
		btn.disabled = true;

		return callCollectDiagnostics().then(function(res) {
			if (!res || res.ok !== true || !res.content) {
				ui.addNotification(null, E('p', { 'class': 'alert-message error' },
					_('Failed to collect diagnostics: %s').format((res && res.error) || _('no data returned'))));
				return;
			}

			// trigger a browser download of the plain-text report
			var blob = new Blob([res.content], { type: 'text/plain;charset=utf-8' });
			var url = URL.createObjectURL(blob);
			var a = document.createElement('a');
			a.href = url;
			a.download = res.filename || 'easymesh-diagnostics.txt';
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			ui.addNotification(null, E('p', {},
				_('Diagnostics report downloaded as %s. It contains the plugin state, tool / daemon probes, wireless and MAP configuration (secrets masked) and the related system log lines - attach it when reporting an issue, it is plain text and safe to feed to an AI for analysis.')
					.format(a.download)));
		}).catch(function(err) {
			ui.addNotification(null, E('p', { 'class': 'alert-message error' },
				_('Failed to collect diagnostics: %s').format(err.message || err)));
		}).finally(function() {
			btn.disabled = false;
		});
	},

	render: function() {
		var links = E('div', { 'class': 'cbi-section', 'style': 'max-width:640px' }, [
			E('p', {}, _('MTK EasyMesh (MAP / wapp / bs20) configuration for the luci-app-mtk-easymesh package.')),

			E('div', { 'class': 'cbi-map-descr' }, [
				E('strong', {}, _('GitHub Repository')),
				E('br'),
				E('a', { 'href': 'https://github.com/yyyyy114514/luci-app-mtk-easymesh/', 'target': '_blank' },
				'https://github.com/yyyyy114514/luci-app-mtk-easymesh/')
		]),

			E('br'),

			E('div', { 'class': 'cbi-map-descr' }, [
				E('strong', {}, _('Developer')),
				E('br'),
				'ysy114514',
				' ',
				E('a', { 'href': 'https://www.right.com.cn/forum/space-uid-1069053.html', 'target': '_blank' },
					E('em', {}, _('Enshan (right.com.cn) Profile'))),
				' (' + _('恩山论坛') + ')'
			]),

			E('br'),

			E('div', { 'class': 'cbi-map-descr' }, [
				E('strong', {}, _('Version')),
				E('br'),
				PKG_VERSION
			]),

			E('br'),

			E('div', { 'class': 'cbi-map-descr' }, [
				E('strong', {}, _('Diagnostics')),
				E('br'),
				E('button', {
					'class': 'cbi-button cbi-button-action important',
					'click': ui.createHandlerFn(this, 'handleDiagnostics')
				}, _('Collect Diagnostics Report')),
				E('br'),
				E('span', { 'style': 'font-size:smaller' },
					_('Collects the plugin state, tool / daemon probes, wireless and MAP configuration (secrets masked) and related system log lines into a plain-text file and downloads it.'))
			])
		]);

		return E('div', {}, [
			E('h2', {}, _('About')),
			links
		]);
	}
});
