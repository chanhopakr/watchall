Ext.define('apps.model.menumanagement.MenuAuthorization', {
  extend: 'Ext.data.Model',

  requires: ['Ext.data.validator.Length'],

  fields: [
    /**
     * 다중 선택을 위해 type 속성 사용하지 않기
     */
    { name: 'id' },

    /**
     * 다중 선택을 위해 type 속성 사용하지 않기
     */
    { name: 'name' },

    { name: 'desc', type: 'string' }
  ],

  validators: {
    name: {
      type: 'length',
      min: 2,
      max: 64
    },
    desc: {
      type: 'length',
      max: 256
    }
  }
});
