Ext.define('apps.store.arbor.filter.Application', {
  extend: 'Ext.data.Store',
  alias: 'store.arbor.filter.application',

  fields: ['value', 'display'],
  data: [
    ['0', 'none'],
    ['1', 'as'],
    ['2', 'as_origin'],
    ['3', 'as_peer'],
    ['4', 'aspath'],
    ['5', 'city'],
    ['6', 'country'],
    ['7', 'customer'],
    ['8', 'interface'],
    ['9', 'peer'],
    ['10', 'profile'],
    ['11', 'region'],
    ['12', 'router'],
    ['13', 'tcp_port'],
    ['14', 'udp_port'],
    ['15', 'vpnsite']
  ]
});
