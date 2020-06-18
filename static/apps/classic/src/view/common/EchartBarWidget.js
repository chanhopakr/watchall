Ext.define('apps.view.common.EchartBarWidget', {
  extend: 'Ext.Widget',
  alias: 'widget.echartbar',
  element: {
    tag: 'div',
    reference: 'element',
    style: {
      height: '25px'
    }
  },
  config: {
    values: null
  },
  updateWidth: function(width) {
    this.element.setWidth(width);
    this.$chart.resize();
  },
  defaultBindProperty: 'values',
  initElement: function() {
    this.callParent();
    this.$chart = echarts.init(this.getEl().dom);
  },
  updateValues: function(value) {
    this.$chart.setOption({
      grid: {
        top: '0',
        right: '0',
        bottom: '0',
        left: '0',
        containLabel: false
      },
      xAxis: [{ type: 'value', show: false, max: 100 }],
      yAxis: [{ type: 'category', data: [''], show: false }],
      series: [
        {
          name: 'Used',
          type: 'bar',
          stack: '1',
          label: {
            normal: {
              show: true,
              position: 'outsideRight',
              textStyle: { color: 'white' }
            }
          },
          data: [value].map(function(_value) {
            return Ext.util.Format.number(_value, '100.00');
          }),
          itemStyle: { normal: { color: 'rgb(250,198,29)' } }
        },
        {
          name: 'Free',
          type: 'bar',
          stack: '1',
          label: {
            normal: {
              show: true,
              position: 'insideRight',
              textStyle: { color: 'white' }
            }
          },
          data: [100 - value].map(function(_value) {
            return Ext.util.Format.number(_value, '100.00');
          }),
          itemStyle: { normal: { color: 'rgb(83,121,175)' } }
        }
      ]
    });
  }
});
