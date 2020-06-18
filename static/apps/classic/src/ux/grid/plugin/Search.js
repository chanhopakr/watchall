Ext.define('apps.ux.grid.plugin.Search', {
  extend: 'Ext.plugin.Abstract',
  alias: 'plugin.gridsearch',

  requires: [
    'Ext.button.Split',
    'Ext.form.field.ComboBox',
    'Ext.form.field.Date',
    'Ext.form.field.Text',
    'Ext.layout.container.boxOverflow.Scroller',
    'Ext.toolbar.Toolbar',
    'Ext.util.TextMetrics',
    'apps.ux.plugin.ClearButton'
  ],

  config: {
    /**
     * @cfg {String} id
     * grid 에서 찾을 때 사용하기 (default: 'gridsearch')
     * (=pluginId, Deprecated since version 6.2.0 Use id instead)
     * Examples:
     * const plugin = grid.getPlugin('gridsearch');
     */
    id: 'gridsearch',

    /**
     * @cfg {String} fieldLabelAttr ('fieldLabel' or 'emptyText')
     * 검색 field 의 label 속성 명을 지정하기, column text 를 시각적 표현하기
     * default 는 'fieldLabel' 이다
     * 변경시 'fieldLabel' or 'emptyText' 이다
     */
    fieldLabelAttr: 'fieldLabel',

    /**
     * @cfg {Number} fieldMaxWidth
     * 검색 field 의 maxWidth
     */
    fieldMaxWidth: 350,

    /**
     * @cfg {Object} fieldInitConfig
     * 검색 field 의 기초 설정 값 지정하기, menu checked True 시 적용하기
     * fieldInitConfig: {
     *     category: {
     *         xtype: 'combobox',
     *         bind: {
     *             store: '{categories}'
     *         }
     *     }
     * }
     */
    fieldInitConfig: {},

    /**
     * @cfg {Object} fieldItems
     * 검색 field 에 기본적으로 등록되는 item 지정하기
     */
    fieldItems: [],

    /**
     * @cfg {Array} menuItemsConfig
     * splitbutton 의 menu 의 item 기초 설정 값 지정하기
     */
    menuItemsConfig: {},

    /**
     * @cfg {Array} menuExcept
     * splitbutton 의 menu 생성시 제외 설정하기, column dataIndex 입력하기
     */
    menuExcept: [],

    /**
     * @cfg {Number} menuHeight
     * splitbutton 의 menu 높이 설정하기, 초과시 자동 scroll 생성된다
     */
    menuHeight: null,

    /**
     * @cfg {Object} initChecked
     * 초기 plugin 생성시 initChecked(column.dataIndex) 기준으로 splitbutton 의 menu 선택하기
     */
    initChecked: []
  },

  /**
   * 검색 field 의 기본 설정 값
   */
  defaults: {
    xtype: 'textfield',
    enableKeyEvents: true,
    listeners: {
      keydown: function(comp, e) {
        if (e.keyCode === 13) {
          const ctrl = this.lookupController();
          if (ctrl.onSearch) {
            ctrl.onSearch(comp, e);
          } else {
            this.up('[itemId=search]')
              .getComponent('button')
              .fireHandler(e);
          }
        }
      }
    }
  },

  init: function(comp) {
    var me = this;
    comp.on('render', me.renderTbar, me, { single: me });
  },

  destroy: function() {
    this.cmp = null;
    this.tbar = null;
    this.callParent();
  },

  renderTbar: function() {
    var me = this;
    var cmp = me.cmp;
    var columns = cmp.getColumnManager().getColumns();
    var menuExcept =
      me.menuExcept === 'all'
        ? Ext.Array.map(columns, function(column) {
            return column.dataIndex;
          })
        : me.menuExcept.slice();

    var menuItems = [
      {
        text: '전체 (모두 선택)',
        itemId: 'all'
      }
    ];
    Ext.Array.each(columns, function(column) {
      if (!column.hidden) {
        var dataIndex = column.dataIndex;

        if (dataIndex) {
          if (menuExcept.includes(dataIndex)) {
            menuExcept = Ext.Array.filter(menuExcept, function(value) {
              return value !== dataIndex;
            });
          } else {
            var menuItemConfig = {
              text: column.text,
              itemId: dataIndex,
              column: column,
              bind: {}
            };

            Ext.apply(menuItemConfig, me.menuItemsConfig[dataIndex]);

            var fieldInitConfig = me.fieldInitConfig[dataIndex];

            if (fieldInitConfig) {
              Ext.Array.each(['disabled', 'hidden'], function(attr) {
                menuItemConfig[attr] = fieldInitConfig[attr];
                if (fieldInitConfig.bind) {
                  menuItemConfig.bind[attr] = fieldInitConfig.bind[attr];
                }
              });
            }

            menuItems.push(menuItemConfig);
          }
        }
      }
    });

    me.tbar = Ext.create('Ext.toolbar.Toolbar', {
      itemId: 'search',
      dock: 'top',
      items: [
        {
          itemId: 'fields',
          xtype: 'toolbar',
          flex: 1,
          margin: false,
          padding: 0,
          overflowHandler: {
            type: 'scroller',
            scrollIncrement: 100,
            wheelIncrement: 50
          },
          defaults: me.defaults,
          items: me.fieldItems
        },
        {
          text: '검색',
          tooltip: '검색',
          itemId: 'button',
          xtype: 'splitbutton',
          iconCls: 'x-fa fa-search',
          cls: 'bg_search',
          width: 125,
          scope: me,
          handler: me.onHandler,
          menu: {
            height: me.menuHeight,
            style: 'border: 1px solid #c9d0d6;',
            defaults: {
              checked: false,
              checkHandler: me.onCheckHandler,
              scope: me
            },
            items: menuItems
          }
        }
      ]
    });

    cmp.addDocked(me.tbar);

    if (me.initChecked) {
      me.tbar.on('render', me.renderInitChecked, me, { single: me });
    }

    // 최초 cmp 의 store load 전 fieldItems 존재시 각각 value 를 store 에 proxy.setExtraParam() 하기
    if (me.fieldItems && me.fieldItems.length) {
      /**
       * cmp 의 store bind 여부 에 따른 proxy 제어하기
       */
      var cmpBindStore = cmp.bind.store;
      if (
        cmpBindStore.isLoading() ||
        cmp.getStore().getProxy().type !== 'ajax'
      ) {
        var items = me.tbar.getComponent('fields').items.getRange();
        var proxy = cmpBindStore.stub.boundValue.getProxy();

        Ext.Array.each(items, function(item) {
          if (item.submitValue === false || !item.name) {
            return;
          }

          var value = item.getValue();

          if (value instanceof Date) {
            value = me.convertDateValue(item, value);
          }
          proxy.setExtraParam(item.name, value);
        });
      }
    }
  },

  renderInitChecked: function() {
    var menus = this.tbar.getComponent('button').getMenu();
    var initChecked = this.initChecked;

    Ext.suspendLayouts();

    if (initChecked === 'all') {
      Ext.Array.each(menus.query('[xtype=menucheckitem]'), function(menu) {
        menu.setChecked(true);
      });
    } else {
      Ext.Array.each(initChecked, function(itemId) {
        var menu = menus.getComponent(itemId);
        if (menu) {
          menu.setChecked(true);
        }
      });
    }
    Ext.resumeLayouts(true);
  },

  /**
   * 검색하기
   * me.onButtonHandler 전 후 기능 추가시
   * 해당 store.listeners 의 beforeload 또는 load 를 권장합니다
   */
  onHandler: function(comp) {
    var panel = comp.ownerCt.up('panel');

    if (panel) {
      var store = panel.getStore();

      if (store) {
        /**
         * 검색하기 (store proxy extraParam 검색 조건 추가하기)
         *
         * 번외: store proxy extraParam 검색 조건 추가하지 않고 검색하기
         * Ext.Array.each(comp.ownerCt.getComponent('fields').query('field'), function(item) {
         *     params[item.name] = item.getValue();
         * });
         * store.loadPage(1, {params: params});
         */
        var me = this;
        var items = comp.ownerCt.getComponent('fields').query('field');
        var proxy = store.getProxy();

        Ext.Array.each(items, function(item) {
          if (item.submitValue === false) {
            return;
          }
          var value = item.getValue();
          if (value instanceof Date) {
            value = me.convertDateValue(item, value);
          }
          // 주의: 오류 발생시 비동기적 호출로 인한 store 가 setExtraParam 가 없는지 확인하기
          proxy.setExtraParam(item.name, value);
        });

        store.loadPage(1);
      }
    }
  },

  /**
   * @method convertDateValue
   * Ext.form.field.Date 사용시 값은 rawValue 기준으로 하기
   */
  convertDateValue: function(field, value) {
    var rawValue = field.getRawValue();
    var parseValue = null;
    Ext.Array.findBy(
      ['Y-m-d H:i:s', 'Y-m-d H:i', 'Y-m-d', field.format],
      function(format) {
        // rawValue 를 format 기준으로 parsing 후 {Date} 유형으로 변경하기
        parseValue = Ext.Date.parse(rawValue, format);
        return parseValue;
      }
    );

    return parseValue ? Ext.Date.format(parseValue, 'Y-m-d\\TH:i:s') : value;
  },

  /**
   * 선택된 메뉴를 기준으로 검색할 field 추가 또는 삭제하기
   */
  onCheckHandler: function(comp, checked) {
    var itemId = comp.getItemId();
    var menus = comp.ownerCt.getRefItems();

    if (itemId === 'all') {
      Ext.suspendLayouts();
      Ext.Array.each(menus, function(menu) {
        if (!menu.disabled) {
          menu.setChecked(checked);
        }
      });
      Ext.resumeLayouts(true);
    } else {
      var menuAll = menus.shift();
      var me = this;
      var cmp = me.cmp;
      var cmpStore = cmp.getStore();
      var cmpStoreProxy = cmp.getStore().getProxy();
      var cmpBindStore = cmp.bind ? cmp.bind.store : null;
      var cmpBindStoreLoading = cmpBindStore ? cmpBindStore.isLoading() : null;
      var fields = me.tbar.getComponent('fields');
      var field = null;

      if (checked) {
        /**
         * cmp 의 store bind 여부 에 따른 proxy 제어하기
         */
        if (cmpBindStoreLoading || cmpStoreProxy.type !== 'ajax') {
          cmpStoreProxy = cmpBindStore.stub.boundValue.getProxy();
        }

        var column = comp.column;
        var columnInitialConfig = column.getInitialConfig();
        var fieldLabelAttr = me.fieldLabelAttr;
        var fieldConfig = {
          name: itemId,
          itemId: itemId,
          maxWidth: me.fieldMaxWidth,
          width: column.flex
            ? columnInitialConfig.minWidth
              ? columnInitialConfig.minWidth
              : columnInitialConfig.maxWidth
              ? columnInitialConfig.maxWidth
              : 100
            : column.getWidth()
        };
        fieldConfig[fieldLabelAttr] = comp.text;
        var seperator = fieldConfig.emptyText ? ' - ' : '';

        /**
         * grid column xtype 에 의해 field initConfig 정의하기
         */
        switch (column.xtype) {
          case 'datecolumn':
            fieldConfig.width += 55; // add width of clear button

            Object.assign(fieldConfig, {
              xtype: 'datefield',
              format: column.format,
              editable: false,
              plugins: ['clearbutton']
            });
            break;
          case 'numbercolumn':
            Object.assign(fieldConfig, {
              maskRe: /\d+/
            });
            break;
          case 'checkcolumn':
            // Add width of display text length
            fieldConfig.width = fieldConfig.fieldLabel
              ? 110
              : fieldConfig.width + 80;

            Object.assign(fieldConfig, {
              xtype: 'combobox',
              displayField: 'display',
              valueField: 'value',
              store: {
                fields: ['value', 'display'],
                data: [
                  {
                    value: '',
                    display: Ext.String.format(
                      '{0}{1}{2}',
                      fieldConfig.emptyText,
                      seperator,
                      '전체'
                    )
                  },
                  {
                    value: false,
                    display: Ext.String.format(
                      '{0}{1}{2}',
                      fieldConfig.emptyText,
                      seperator,
                      '사용안함'
                    )
                  },
                  {
                    value: true,
                    display: Ext.String.format(
                      '{0}{1}{2}',
                      fieldConfig.emptyText,
                      seperator,
                      '사용'
                    )
                  }
                ]
              },
              editable: false,
              value: '' // default value
            });
            break;
          case 'booleancolumn':
            fieldConfig.width = fieldConfig.fieldLabel
              ? 110
              : fieldConfig.width + 80; // add width of display text length

            Object.assign(fieldConfig, {
              xtype: 'combobox',
              displayField: 'display',
              valueField: 'value',
              store: {
                fields: ['value', 'display'],
                data: [
                  {
                    value: '',
                    display: Ext.String.format(
                      '{0}{1}{2}',
                      fieldConfig.emptyText,
                      seperator,
                      '전체'
                    )
                  },
                  {
                    value: false,
                    display: Ext.String.format(
                      '{0}{1}{2}',
                      fieldConfig.emptyText,
                      seperator,
                      '사용안함'
                    )
                  },
                  {
                    value: true,
                    display: Ext.String.format(
                      '{0}{1}{2}',
                      fieldConfig.emptyText,
                      seperator,
                      '사용'
                    )
                  }
                ]
              },
              editable: false,
              value: ''
            });
            break;
          default:
            break;
        }

        /**
         * labelWidth 동적 계산하기, field label 을 fieldLabel 사용시
         */
        if (fieldLabelAttr === 'fieldLabel') {
          fieldConfig.labelWidth = Ext.util.TextMetrics.measure(
            Ext.getBody().createChild(),
            fieldConfig.fieldLabel + fieldConfig.labelSeparator
          ).width;
          fieldConfig.labelWidth = Math.round(fieldConfig.labelWidth * 0.8);
          fieldConfig.width += fieldConfig.labelWidth;
        }

        /**
         * 동적 field 추가시 index 구하기
         */
        var index = 0;
        for (var i = 0, len = menus.length, menu; i < len; i += 1) {
          menu = menus[i];
          if (menu.checked) {
            if (menu.itemId === fieldConfig.name) {
              break;
            }
            index += 1;
          }
        }

        /**
         * field 기초 설정 값 추가하기, 외부로 부터 지정한
         */
        var fieldInitConfigItemId = me.fieldInitConfig[itemId];

        if (fieldInitConfigItemId) {
          if (
            fieldInitConfigItemId.xtype &&
            fieldConfig.plugins &&
            fieldInitConfigItemId.xtype !== fieldConfig.xtype
          ) {
            // Exception:
            // fieldConfig.plugins 존재시 fieldInitConfigItemId.xtype 을 assign 하는 경우 오류 발생 피하기
            fieldConfig.plugins = null;
          }
          Object.assign(fieldConfig, fieldInitConfigItemId);
        }

        field = fields.insert(index, fieldConfig); // return field component

        var items = field.items ? field.items.getRange() : [field];

        Ext.Array.each(items, function(item) {
          if (item.submitValue === false) {
            return;
          }
          var value = item.getValue();
          if (value instanceof Date) {
            value = me.convertDateValue(item, value);
          }
          // 주의: 오류 발생시 비동기적 호출로 인한 store 가 setExtraParam 가 없는지 확인하기
          cmpStoreProxy.setExtraParam(item.name, value);
        });
      } else {
        field = fields.getComponent(itemId);
        var cmpStoreProxyExtraParams = cmpStoreProxy.getExtraParams();

        if (field && !field.disabled) {
          if (field.items) {
            Ext.Array.each(field.query('field'), function(item) {
              delete cmpStoreProxyExtraParams[item.name];
            });
          } else {
            delete cmpStoreProxyExtraParams[field.name];
          }
          fields.remove(field);
        }
        /**
         * 검색 조건 초기화하기 (store proxy extraParam 검색 조건 초기화하기)
         */
        cmpStore.load();
      }

      var unmatchedMenus = Ext.Array.findBy(menus, function(menu) {
        return menu.checked !== checked;
      });

      if (!unmatchedMenus) {
        menuAll.setChecked(checked, true);
      }

      if (!checked && menuAll.checked) {
        menuAll.setChecked(false, true);
      }
    }
  },

  onSearch: function(e) {
    this.tbar.getComponent('button').fireHandler(e);
  }
});
