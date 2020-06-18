Ext.define('apps.store.arbor.filter.Router', {
  extend: 'Ext.data.Store',
  alias: 'store.arbor.filter.router',

  fields: ['value', 'display'],
  data: [
    ['0', 'none'],
    ['1', 'application'],
    ['2', 'as'],
    ['3', 'as_origin'],
    ['4', 'as_peer'],
    ['5', 'aspath'],
    ['6', 'bgp_prefixlen'],
    ['7', 'bgp_stats'],
    ['8', 'bgp_summary'],
    ['9', 'community'],
    ['10', 'customer'],
    ['11', 'dscp'],
    ['12', 'fingerprint'],
    ['13', 'icmp'],
    ['14', 'interface'],
    ['15', 'interface_status'],
    ['16', 'ip_precedence'],
    ['17', 'ipv6_tcp'],
    ['18', 'ipv6_udp'],
    ['19', 'mpls'],
    ['20', 'mpls_pe'],
    ['21', 'mpls_qos'],
    ['22', 'nexthop'],
    ['23', 'packet_length'],
    ['24', 'peer'],
    ['25', 'prefix'],
    ['26', 'profile'],
    ['27', 'protocol'],
    ['28', 'protocol_offnet'],
    ['29', 'recent_flows'],
    ['30', 'router_stats'],
    ['31', 'service'],
    ['32', 'tcp_port'],
    ['33', 'tcp_port_offnet'],
    ['34', 'tos'],
    ['35', 'tos_dtrm'],
    ['36', 'udp_port'],
    ['37', 'udp_port_offnet'],
    ['38', 'vpn_rd_num_routes'],
    ['39', 'vpn_rd_num_updates']
  ]
});
