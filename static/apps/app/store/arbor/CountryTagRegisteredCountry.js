Ext.define('apps.store.arbor.CountryTagRegisteredCountry', {
  extend: 'Ext.data.Store',
  alias: 'store.arbor.countrytagregisteredcountry',

  pageSize: 0,

  proxy: {
    type: 'ajax',
    url: '/arbor/country_tag/registered_country',
    reader: {
      type: 'json',
      rootProperty: 'data'
    }
  }
});
