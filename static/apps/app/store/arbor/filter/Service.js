Ext.define('apps.store.arbor.filter.Service', {
  extend: 'Ext.data.Store',
  alias: 'store.arbor.filter.service',

  fields: ['value', 'display'],
  data: [
    ['0', 'none'],
    ['1', 'application'],
    ['2', 'city'],
    ['3', 'country'],
    ['4', 'customer'],
    ['5', 'delay_var_stats'],
    ['6', 'http_sts_cidr_stats'],
    ['7', 'http_sts_svc_stats'],
    ['8', 'missing_pct'],
    ['9', 'out_of_order_pct'],
    ['10', 'profile'],
    ['11', 'region'],
    ['12', 'retransmit_pct'],
    ['13', 'router'],
    ['14', 'rtt_stats'],
    ['15', 'service_cidr'],
    ['16', 'service_tms'],
    ['17', 'sip_invite_stats'],
    ['18', 'tcp_flag_stats'],
    ['19', 'throughput_stats'],
    ['20', 'top_sources'],
    ['21', 'window_size_stats']
  ]
});
