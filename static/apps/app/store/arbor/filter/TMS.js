Ext.define('apps.store.arbor.filter.TMS', {
  extend: 'Ext.data.Store',
  alias: 'store.arbor.filter.tms',

  fields: ['value', 'display'],
  data: [
    ['0', 'none'],
    ['1', 'application'],
    ['2', 'blob_mit'],
    ['3', 'blob_mit_count'],
    ['4', 'collector_stats'],
    ['5', 'dns_fqdn'],
    ['6', 'dns_nxfqdn'],
    ['7', 'dns_nxrdn'],
    ['8', 'dns_rdn'],
    ['9', 'dscp'],
    ['10', 'icmp'],
    ['11', 'interface'],
    ['12', 'ip_precedence'],
    ['13', 'packet_length'],
    ['14', 'protocol'],
    ['15', 'service'],
    ['16', 'tcp_port'],
    ['17', 'tms_prt_aflow'],
    ['18', 'tms_prt_cntrs'],
    ['19', 'tms_prt_mit'],
    ['20', 'tos'],
    ['21', 'tos_dtrm'],
    ['22', 'udp_port']
  ]
});
