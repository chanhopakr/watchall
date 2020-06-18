Ext.define('apps.container.arbor.GraphContainer', {
  extend: 'Ext.container.Container',

  requires: [
    'Ext.form.field.ComboBox',
    'Ext.layout.container.HBox',
    'apps.store.arbor.Class',
    'apps.store.arbor.Graph'
  ],

  alias: 'widget.arborgraphcontainer',

  layout: {
    type: 'hbox'
  },

  items: [
    {
      fieldLabel: '그래프 유형',
      name: 'graph_type',
      value: 'Stacked',
      xtype: 'combobox',
      store: {
        type: 'arbor.graph'
      },
      listeners: {
        select: (cmp, record, eOpts) => {
          cmp.getRefOwner().fireEvent('onSelectGraphType', cmp, record, eOpts);
        }
      }
    },
    {
      fieldLabel: 'Class',
      itemId: 'class',
      name: 'class',
      value: 'in',
      disabled: true,
      hidden: true,
      xtype: 'combobox',
      store: {
        type: 'arbor.class'
      }
    }
  ],

  listeners: {
    onSelectGraphType: (cmp, record, eOpts) => {
      const ownerCt = cmp.getRefOwner();
      const graphType = record.get('value');
      const hidden = graphType === 'Stacked';
      const value = hidden ? null : 'in';

      const classComboBox = ownerCt.getComponent('class');
      if (classComboBox) {
        classComboBox.setDisabled(hidden);
        classComboBox.setHidden(hidden);
        classComboBox.setValue(value);
      }
    }
  }
});
