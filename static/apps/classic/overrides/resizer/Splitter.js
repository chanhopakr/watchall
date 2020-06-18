Ext.define('apps.overrides.resizer.Splitter', {
  override: 'Ext.resizer.Splitter',

  /**
   * style 추가
   */
  renderTpl: [
    '<tpl if="collapsible===true">',
    '<div id="{id}-collapseEl" data-ref="collapseEl" role="presentation" class="',
    Ext.baseCSSPrefix,
    'collapse-el ',
    Ext.baseCSSPrefix,
    'layout-split-{collapseDir}{childElCls}" style="',
    'font-size: x-large;">',
    '</div>',
    '</tpl>'
  ]
});
