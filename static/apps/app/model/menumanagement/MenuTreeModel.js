Ext.define('apps.model.menumanagement.MenuTreeModel', {
  extend: 'apps.model.menumanagement.Menu',

  fields: [
    // Exception - TreeStore.root = undefined 인 경우 Error 발생
    { name: 'id' },

    /**
     * name: 'name' => 'text'
     */
    { name: 'text', type: 'string', mapping: 'name' },

    /**
     * menu_authorization: {id: [], name: []}
     */
    { name: 'menu_authorization' },

    /**
     * custom field calculate
     */
    {
      name: 'menu_authorization_id',
      // Exception - store.root.menu_authorization = undefined
      calculate: data =>
        data.menu_authorization ? data.menu_authorization.id : null
    },

    /**
     * custom field calculate
     */
    {
      name: 'menu_authorization_name',
      // Exception - store.root.menu_authorization = undefined
      calculate: data =>
        data.menu_authorization ? data.menu_authorization.name : null
    }
  ]
});
