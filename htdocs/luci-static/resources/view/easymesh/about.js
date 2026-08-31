'use strict';
'require view';

// The package version string. It is rewritten by the ipk build workflow
// (build-ipk.yml) via sed so the build can stamp an arbitrary version.
var PKG_VERSION = '0.2.1beta';

return view.extend({
	load: function() {
		return null;
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
			])
		]);

		return E('div', {}, [
			E('h2', {}, _('About')),
			links
		]);
	}
});