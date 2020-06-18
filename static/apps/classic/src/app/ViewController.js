/**
 * 일반적으로 사용되는 method 를 갖고 있는 ViewController
 * 필요한 함수는 추가 및 재정의 하기
 */
Ext.define('apps.app.ViewController', {
  extend: 'Ext.app.ViewController',
  alias: 'controller.appsviewcontroller',

  requires: [],

  uses: ['Ext.menu.Menu', 'apps.view.common.Util'],

  init: function() {},

  finder: function(comp, selector, limit) {
    let panel = comp.ownerCt.up(selector, limit);

    switch (panel.xtype) {
      case 'window':
        const layout = panel.getLayout();

        if (layout.type === 'fit') {
          const items = panel.items.getRange();

          if (items.length) {
            panel = items[0];
          }
        }
        break;
      default:
        break;
    }

    return panel;
  },

  onRefresh: function(comp) {
    const panel = this.finder(comp, 'panel');

    if (panel) {
      const store = panel.getStore();

      if (store) {
        store.load();
      }
    }
  },

  /**
   * 화면 이동하기
   *
   * Requirements:
   * Extjs app route 설정하기
   */
  onMove: function(comp) {
    /**
     * 이동할 URL
     *
     * @namespace comp.moveurl {String}
     */
    this.redirectTo(comp.moveurl);
  },

  onSearch: function(comp, e) {
    const panel = this.finder(comp, 'panel');

    if (panel) {
      const plugin = panel.getPlugin('gridsearch');

      if (plugin) {
        plugin.onSearch(e);
      } else {
        const store = panel.getStore();

        if (store) {
          store.loadPage(1);
        }
      }
    }
  },

  onKeydown: function(comp, e) {
    if (e.keyCode === 13) {
      this.onSearch(comp);
    }
  },

  onItemdblclickGrid: function(comp, record, item, index, e) {
    const updateButton = comp.ownerCt.header.query('[itemId=update]');

    if (updateButton && updateButton.length) {
      updateButton[0].onClick(e);
    }
  },

  excelDownload: function(comp, extraParams) {
    const grid = this.finder(comp, 'panel');
    const title = grid.getTitle() || grid.ownerCt.title;

    if (grid.getStore().getData().length === 0) {
      Ext.Msg.alert('알림', '데이터가 없습니다.');
      return false;
    }

    // grid.reconfigure() 사용시 'columns'을 불러 오지 못함.
    extraParams.excel = true;
    extraParams.title = title;

    /* global apps */
    const columns = apps.view.common.Util.getColumnInfo(grid.getColumns());
    const headers = columns.map(column => column[0]);
    extraParams.columns = Ext.encode(columns);
    extraParams.header = Ext.encode([headers]);

    let float_cell = [];
    for (let i = 1, l = grid.getColumns().length; i < l; i += 1) {
      float_cell.push(i);
    }
    extraParams.number = Ext.encode({
      int_cell: [],
      float_cell
    });
    apps.excel(comp.hrefPOST, extraParams);
  },

  /**
   * 상위 comp 에서 하위 component.itemId = 'main' 의 store load 후 첫 번째 record 선택하기
   *
   * main 의 store.autoLoad = true 인 경우라도 한번만 load (19.01.09)
   */
  onSelectFirstRecordMainGridAfterLoad: function(comp) {
    const grid = comp.getComponent('main');

    if (grid) {
      comp.getViewModel().notify();

      const store = grid.getStore();

      if (store) {
        store.load({
          callback: function(records, operation, success) {
            if (records.length) {
              const record = records[0];
              grid.getSelectionModel().select(record);
              grid.fireEvent('itemclick', grid.getView(), record);
            }
          }
        });
      }
    }
  },

  /**
   * Local excel 파일 선택후 JSON 형식으로 가공하기
   */
  changeLocalExcelFileToJson: function(e) {
    const files = e.target.files;
    let result = [];

    if (files) {
      const file = files[0];

      if (file) {
        const reader = new FileReader();

        reader.onload = function(e) {
          const data = e.target.result;
          const cfb = XLS.CFB.read(data, { type: 'binary' });
          const wb = XLS.parse_xlscfb(cfb);

          wb.SheetNames.forEach(sheetName => {
            const oJS = XLS.utils.sheet_to_row_object_array(
              wb.Sheets[sheetName]
            );

            result.push(oJS);
          });
        };

        reader.readAsBinaryString(file);
      }
    }

    return result;
  },

  onItemcontextmenu: function(comp, record, item, index, e) {
    e.preventDefault();

    const me = this;
    let items = comp.ownerCt.header.query('[xtype=button]');

    if (!items.length) {
      return;
    }

    const menu = Ext.create('Ext.menu.Menu', {
      style: 'border: 1px solid #c9d0d6;',
      plain: true,
      defaults: {
        scope: me
      },
      items: []
    });
    const menuHandler = (item, event) => {
      const itemId = item.getItemId();
      let btn = comp.ownerCt.header.query(`[itemId=${itemId}]`);

      if (btn && btn.length) {
        btn = btn[0];
        btn.onClick(event);
      }
    };

    items.forEach(item => {
      menu.add({
        text: item.getText() || item.tooltip,
        itemId: item.itemId,
        iconCls: item.iconCls,
        cls: item.cls,
        handler: menuHandler
      });
    });

    menu.showAt(e.pageX, e.pageY);
  },

  onCloseToRefresh: function(panel, comp) {
    const refresh = comp.getViewModel().get('refresh');

    if (panel && refresh) {
      const store = panel.getStore();

      if (store) {
        store.load();
      }
    }
  },

  onAfterrenderSearchForm: function(cmp) {
    Ext.defer(
      function() {
        this.onResizeSearchForm(cmp, cmp.getWidth()); // init
        cmp.on('resize', this.onResizeSearchForm);
      },
      300,
      this
    );
  },

  onResizeSearchForm: (cmp, width, height, oldWidth, oldHeight, eOpts) => {
    const layout = cmp.getLayout();
    if (layout.type === 'table') {
      const first = cmp
        .getForm()
        .getFields()
        .first();
      if (first) {
        const firstWidth = first.getWidth();
        const { right, left } = first.getEl().getMargin();
        // FIXME 김태근 차장님 chrome 에서 이슈 발생해서 이력 남기기
        const columns = Math.trunc(width / (firstWidth + right + left)) || 1;
        console.log(
          `${columns} = ${width} / (${firstWidth} + ${right} + ${left})`
        );
        cmp.setLayout({ columns });
        console.log(
          `cmp.getRefOwner().getWidth() = ${cmp.getRefOwner().getWidth()}`
        );
      }
    }
  },

  onRendererSimpleTooltip: (value, metaData) => {
    metaData.tdAttr = `data-qtip='${value}'`;
    return value;
  }
});
