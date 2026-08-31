'use strict';
'require rpc';
'require ui';
'require view';

var callBackupConfig = rpc.declare({
	object: 'luci.easymesh',
	method: 'backupConfig',
	expect: { '': {} }
});

var callRestoreConfig = rpc.declare({
	object: 'luci.easymesh',
	method: 'restoreConfig',
	params: [ 'content' ],
	expect: { '': {} }
});

var callResetAll = rpc.declare({
	object: 'luci.easymesh',
	method: 'resetAll',
	expect: { '': {} }
});

var callResetDefault = rpc.declare({
	object: 'luci.easymesh',
	method: 'resetDefault',
	expect: { '': {} }
});

function notifyResult(okMsg, res) {
	if (res && res.ok) {
		ui.addNotification(null, E('p', {}, okMsg));
		setTimeout(function() { location.reload(); }, 2000);
	}
	else {
		ui.addNotification(null, E('p', { 'class': 'alert-message warning' },
			_('Operation failed: %s').format((res && res.error) || _('unknown error'))));
	}
}

function downloadBackup() {
	return L.resolveDefault(callBackupConfig(), {}).then(function(res) {
		if (!res || !res.ok) {
			ui.addNotification(null, E('p', { 'class': 'alert-message warning' },
				_('Backup failed: %s').format((res && res.error) || _('unknown error'))));
			return;
		}

		var d = new Date();
		var pad = function(n) { return (n < 10 ? '0' : '') + n; };
		var stamp = '%04d%02d%02d-%02d%02d%02d'.format(
			d.getFullYear(), d.getMonth() + 1, d.getDate(),
			d.getHours(), d.getMinutes(), d.getSeconds());

		var blob = new Blob([ res.content ], { type: 'text/plain' });
		var url = URL.createObjectURL(blob);
		var a = document.createElement('a');
		a.href = url;
		a.download = 'easymesh-backup-%s.uci'.format(stamp);
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);

		ui.addNotification(null, E('p', {}, _('Backup downloaded. Keep the file in a safe place, it can be restored on this page.')));
	});
}

function confirmRestore(content, filename) {
	ui.showModal(_('Restore Backup'), [
		E('p', {}, _('Restore the EasyMesh configuration from "%s"?').format(filename)),
		E('p', {}, _('The current configuration is overwritten, mapd_cfg / 1905d.cfg are rewritten and the wapp / bs20 daemons restart. The wireless configuration is synced to the restored settings.')),
		E('p', {}, E('code', {
			'style': 'display:block;max-height:200px;overflow:auto;white-space:pre-wrap;word-break:break-all'
		}, content.substring(0, 2048))),
		E('div', { 'class': 'right' }, [
			E('button', { 'class': 'btn', 'click': ui.hideModal }, [ _('Cancel') ]),
			' ',
			E('button', {
				'class': 'btn cbi-button-negative important',
				'click': function(ev) {
					ev.target.disabled = true;
					return L.resolveDefault(callRestoreConfig(content), {}).then(function(res) {
						ui.hideModal();
						notifyResult(_('Backup restored and applied. Reloading the page...'), res);
					});
				}
			}, [ _('Restore and apply') ])
		])
	]);
}

/* first stage of the two-step reset confirmation */
function confirmResetStage1(kind) {
	var title = kind == 'full'
		? _('Full Reset (including wireless)')
		: _('Reset EasyMesh Configuration');
	var desc = kind == 'full'
		? _('This resets every EasyMesh option to its defaults, stops the wapp / bs20 daemons and removes the plugin-synced wireless settings (band steering, 802.11r, steeringthresold, wapp flags). Other wireless settings such as SSID and passwords are kept.')
		: _('This resets every EasyMesh option to its defaults (easymesh UCI, mapd_cfg and 1905d.cfg) and stops the wapp / bs20 daemons. The wireless configuration is not touched.');

	return new Promise(function(resolve) {
		ui.showModal(title, [
			E('p', {}, desc),
			E('p', { 'class': 'alert-message warning' },
				_('This action cannot be undone. Consider downloading a backup first.')),
			E('div', { 'class': 'right' }, [
				E('button', { 'class': 'btn', 'click': function() { ui.hideModal(); resolve(false); } }, [ _('Cancel') ]),
				' ',
				E('button', {
					'class': 'btn cbi-button-negative important',
					'click': function() { ui.hideModal(); resolve(true); }
				}, [ _('Continue') ])
			])
		]);
	});
}

/* second stage: explicit final confirmation */
function confirmResetStage2(kind) {
	var title = kind == 'full'
		? _('Full Reset (including wireless)')
		: _('Reset EasyMesh Configuration');

	return new Promise(function(resolve) {
		ui.showModal(title, [
			E('p', {}, _('Final confirmation: the reset runs now and takes effect immediately.')),
			E('div', { 'class': 'right' }, [
				E('button', { 'class': 'btn', 'click': function() { ui.hideModal(); resolve(false); } }, [ _('Cancel') ]),
				' ',
				E('button', {
					'class': 'btn cbi-button-negative important',
					'click': function() { ui.hideModal(); resolve(true); }
				}, [ _('Confirm reset') ])
			])
		]);
	});
}

function doReset(kind) {
	confirmResetStage1(kind).then(function(go) {
		if (!go)
			return Promise.resolve();
		return confirmResetStage2(kind).then(function(go2) {
			if (!go2)
				return Promise.resolve();
			return L.resolveDefault(kind == 'full' ? callResetDefault() : callResetAll(), {})
				.then(function(res) {
					notifyResult(_('Reset completed. Reloading the page...'), res);
				});
		});
	});
}

return view.extend({
	load: function() {
		return Promise.resolve();
	},

	render: function() {
		var backupSection = E('div', { 'class': 'cbi-section' }, [
			E('h3', {}, _('Backup')),
			E('p', {}, _('Download the current EasyMesh configuration (/etc/config/easymesh) as a plain UCI text file.')),
			E('button', {
				'class': 'btn cbi-button cbi-button-apply important',
				'click': function() { return downloadBackup(); }
			}, [ _('Download Backup') ])
		]);

		var fileInput = E('input', {
			'type': 'file',
			'id': 'easymesh-restore-file',
			'accept': '.uci,.txt,.conf,text/plain',
			'style': 'display:none'
		});

		fileInput.addEventListener('change', function(ev) {
			var file = ev.target.files && ev.target.files[0];
			if (!file)
				return;

			if (file.size > 65536) {
				ui.addNotification(null, E('p', { 'class': 'alert-message warning' },
					_('The selected file is too large to be a valid backup.')));
				return;
			}

			var reader = new FileReader();
			reader.onload = function() {
				var content = String(reader.result || '');
				if (!content.match(/config\s+easymesh/)) {
					ui.addNotification(null, E('p', { 'class': 'alert-message warning' },
						_('The selected file does not look like an easymesh UCI backup.')));
					return;
				}
				confirmRestore(content, file.name);
			};
			reader.readAsText(file);
			ev.target.value = '';
		});

		var restoreSection = E('div', { 'class': 'cbi-section' }, [
			E('h3', {}, _('Restore')),
			E('p', {}, _('Upload a previously downloaded backup file. The configuration is applied immediately and the daemons restart.')),
			fileInput,
			E('button', {
				'class': 'btn cbi-button cbi-button-apply important',
				'click': function() { fileInput.click(); }
			}, [ _('Upload and Restore Backup') ])
		]);

		var resetSection = E('div', { 'class': 'cbi-section' }, [
			E('h3', {}, _('Reset')),
			E('p', {}, _('Two levels of reset are available. Both require a double confirmation and take effect immediately.')),
			E('div', { 'style': 'margin-bottom:12px' }, [
				E('button', {
					'class': 'btn cbi-button cbi-button-reset important',
					'click': function() { doReset('easymesh'); }
				}, [ _('Reset EasyMesh Configuration') ]),
				E('div', { 'class': 'cbi-value-description' },
					_('All EasyMesh options return to defaults, wireless is left untouched.'))
			]),
			E('div', {}, [
				E('button', {
					'class': 'btn cbi-button cbi-button-remove important',
					'click': function() { doReset('full'); }
				}, [ _('Full Reset (including wireless)') ]),
				E('div', { 'class': 'cbi-value-description' },
					_('Additionally clears the plugin-synced wireless settings (band steering, 802.11r, wapp flags). SSID and passwords are kept.'))
			])
		]);

		return E('div', { 'class': 'cbi-map' }, [
			E('h2', {}, _('EasyMesh Backup, Restore and Reset')),
			backupSection,
			E('hr'),
			restoreSection,
			E('hr'),
			resetSection
		]);
	}
});
