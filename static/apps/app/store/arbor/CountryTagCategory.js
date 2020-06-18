Ext.define('apps.store.arbor.CountryTagCategory', {
  extend: 'Ext.data.Store',
  alias: 'store.arbor.countrytagcategory',

  pageSize: 0,

  proxy: {
    type: 'ajax',
    url: '/arbor/country_tag/categories',
    reader: {
      type: 'json',
      rootProperty: 'data'
    }
  }
});
