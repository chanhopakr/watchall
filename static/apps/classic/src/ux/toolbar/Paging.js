/**
 * Created by zen on 18. 5. 8.
 */
Ext.define('apps.ux.toolbar.Paging', {
  extend: 'Ext.toolbar.Toolbar',
  xtype: 'uxpagingtoolbar',

  padding: '1px 5px',
  cls: 'pagination_container',
  alternateClassName: 'Ext.UXPagingToolbar',
  requires: [
    'Ext.toolbar.Spacer',
    'Ext.toolbar.TextItem',
    'Ext.form.field.Number'
  ],

  mixins: ['Ext.util.StoreHolder'],

  displayInfo: true,

  prependButtons: false,

  // displayMsg: 'Displaying {0} - {1} of {2}',
  displayMsg: '({0} - {1}) 전체: {2} 건',

  emptyMsg: 'No data to display',

  beforePageText: 'Page',

  afterPageText: 'of {0}',

  firstText: 'First Page',

  prevText: 'Previous Page',

  nextText: 'Next Page',

  lastText: 'Last Page',

  refreshText: 'Refresh',

  inputItemWidth: 30,

  emptyPageData: {
    total: 0,
    currentPage: 0,
    pageCount: 0,
    toRecord: 0,
    fromRecord: 0
  },

  defaultBindProperty: 'store',

  movePage: function(e, element) {
    var me = this;
    if ($(element).is('.page-link')) {
      var page = $(element).data('page');
      me.store.loadPage(page);
    }
  },

  getPagingItems: function() {
    var me = this,
      inputListeners = {
        scope: me,
        blur: me.onPagingBlur
      };

    inputListeners[Ext.supports.SpecialKeyDownRepeat ? 'keydown' : 'keypress'] =
      me.onPagingKeyDown;

    me.pageContent = Ext.create('Ext.Component', {
      tpl: [
        '<nav aria-label="Page navigation example">',
        '<ul class="pagination" style="margin:2px 0 0 0;">',
        '<tpl for="this.getPages(values.start, values.end)">',
        "<li class=\"page-item {[values == parent.current ? 'active':'']}\">",
        '<a class="page-link" href="javascript:void(0)" data-page="{.}">{.}</a>',
        '</li>',
        '</tpl>',
        '</ul>',
        '</nav>',
        {
          getPages: function(start, end) {
            return start && end ? _.range(start, end + 1) : [];
          }
        }
      ],
      listeners: {
        el: {
          scope: me,
          click: me.movePage
        }
      }
    });

    return [
      '->',
      { xtype: 'tbspacer' },
      {
        itemId: 'first',
        tooltip: me.firstText,
        overflowText: me.firstText,
        iconCls: Ext.baseCSSPrefix + 'tbar-page-first',
        disabled: true,
        handler: me.moveFirst,
        scope: me
      },
      {
        itemId: 'prev',
        tooltip: me.prevText,
        overflowText: me.prevText,
        iconCls: Ext.baseCSSPrefix + 'tbar-page-prev',
        disabled: true,
        handler: me.movePrevious,
        scope: me
      },
      '-',
      me.pageContent,
      // me.beforePageText,
      // {
      //     xtype: 'numberfield',
      //     itemId: 'inputItem',
      //     name: 'inputItem',
      //     cls: Ext.baseCSSPrefix + 'tbar-page-number',
      //     allowDecimals: false,
      //     minValue: 1,
      //     hideTrigger: true,
      //     enableKeyEvents: true,
      //     keyNavEnabled: false,
      //     selectOnFocus: true,
      //     submitValue: false,
      //     // mark it as not a field so the form will not catch it when getting fields
      //     isFormField: false,
      //     width: me.inputItemWidth,
      //     margin: '-1 2 3 2',
      //     listeners: inputListeners
      // }, {
      //     xtype: 'tbtext',
      //     itemId: 'afterTextItem',
      //     html: Ext.String.format(me.afterPageText, 1)
      // },
      '-',
      {
        itemId: 'next',
        tooltip: me.nextText,
        overflowText: me.nextText,
        iconCls: Ext.baseCSSPrefix + 'tbar-page-next',
        disabled: true,
        handler: me.moveNext,
        scope: me
      },
      {
        itemId: 'last',
        tooltip: me.lastText,
        overflowText: me.lastText,
        iconCls: Ext.baseCSSPrefix + 'tbar-page-last',
        disabled: true,
        handler: me.moveLast,
        scope: me
      },
      '-',
      {
        itemId: 'refresh',
        tooltip: me.refreshText,
        overflowText: me.refreshText,
        iconCls: Ext.baseCSSPrefix + 'tbar-loading',
        disabled: me.store.isLoading(),
        handler: me.doRefresh,
        scope: me
      },
      '->'
    ];
  },

  initComponent: function() {
    var me = this,
      userItems = me.items || me.buttons || [],
      pagingItems;

    me.bindStore(me.store || 'ext-empty-store', true);

    //<debug>
    if (me.store && !me.store.nextPage) {
      Ext.raise(
        'Store is not compatible with this component (does not support paging)'
      );
    }
    //</debug>

    pagingItems = me.getPagingItems();

    if (me.prependButtons) {
      me.items = userItems.concat(pagingItems);
    } else {
      me.items = pagingItems.concat(userItems);
    }

    delete me.buttons;

    if (me.displayInfo) {
      me.items.push({
        margin: '7 0',
        xtype: 'tbtext',
        itemId: 'displayItem'
      });
    }

    me.callParent();
  },

  beforeRender: function() {
    this.callParent(arguments);

    this.updateBarInfo();
  },

  onAdded: function(owner) {
    var me = this,
      oldStore = me.store,
      autoStore = me._autoStore,
      listener,
      store;

    // When we are added to our first container, if we have no meaningful store,
    // switch into "autoStore" mode:
    if (autoStore === undefined) {
      me._autoStore = autoStore = !(oldStore && !oldStore.isEmptyStore);
    }

    if (autoStore) {
      listener = me._storeChangeListener;

      if (listener) {
        listener.destroy();
        listener = null;
      }

      store = owner && owner.store;
      if (store) {
        listener = owner.on({
          destroyable: true,
          scope: me,

          storechange: 'onOwnerStoreChange'
        });
      }

      me._storeChangeListener = listener;
      me.onOwnerStoreChange(owner, store);
    }

    me.callParent(arguments);
  },

  onOwnerStoreChange: function(owner, store) {
    this.setStore(store || Ext.getStore('ext-empty-store'));
  },

  updateBarInfo: function() {
    var me = this;
    if (!me.store.isLoading()) {
      me.calledInternal = true;
      me.onLoad();
      me.calledInternal = false;
    }
  },

  updateInfo: function() {
    var me = this,
      displayItem = me.child('#displayItem'),
      store = me.store,
      pageData = me.getPageData(),
      count,
      msg;

    if (displayItem) {
      count = store.getCount();
      if (count === 0) {
        msg = me.emptyMsg;
      } else {
        msg = Ext.String.format(
          me.displayMsg,
          pageData.fromRecord,
          pageData.toRecord,
          pageData.total
        );
      }
      displayItem.setText(msg);
    }
  },

  getPageCount: function(current, total) {
    var width = this.el ? this.getWidth() : 0;
    var limit = 10;
    if (width < 400) {
      limit = 3;
    } else if (width < 600) {
      limit = 5;
    }
    var pageLimit = this.pageLimit || limit;
    var upperLimit, lowerLimit;
    lowerLimit = upperLimit = Math.min(current, total);

    for (var b = 1; b < pageLimit && b < total; ) {
      if (lowerLimit > 1) {
        lowerLimit--;
        b++;
      }
      if (b < pageLimit && upperLimit < total) {
        upperLimit++;
        b++;
      }
    }
    return {
      start: lowerLimit,
      end: upperLimit
    };
  },

  onLoad: function() {
    var me = this,
      pageData,
      currPage,
      pageCount,
      afterText,
      count,
      isEmpty,
      item;

    count = me.store.getCount();
    isEmpty = count === 0;
    if (!isEmpty) {
      pageData = me.getPageData();
      currPage = pageData.currentPage;
      pageCount = pageData.pageCount;

      // Check for invalid current page.
      if (currPage > pageCount) {
        // If the surrent page is beyond the loaded end,
        // jump back to the loaded end if there is a valid page count.
        if (pageCount > 0) {
          me.store.loadPage(pageCount);
        }
        // If no pages, reset the page field.
        else {
          me.getInputItem().reset();
        }
        return;
      }

      afterText = Ext.String.format(
        me.afterPageText,
        isNaN(pageCount) ? 1 : pageCount
      );
      me.items.each(function(item) {
        item.show();
      });
    } else {
      currPage = 0;
      pageCount = 0;
      afterText = Ext.String.format(me.afterPageText, 0);
      me.items.each(function(item) {
        if (item.itemId != 'displayItem' && item.xtype != 'tbfill') {
          item.hide();
        }
      });
    }

    Ext.suspendLayouts();
    var data = me.getPageCount(currPage, pageCount);
    me.pageContent.update({
      start: data.start,
      end: data.end,
      current: currPage
    });
    item = me.child('#afterTextItem');
    if (item) {
      item.update(afterText);
    }
    item = me.getInputItem();
    if (item) {
      item.setDisabled(isEmpty).setValue(currPage);
    }
    me.setChildDisabled('#first', currPage === 1 || isEmpty);
    me.setChildDisabled('#prev', currPage === 1 || isEmpty);
    me.setChildDisabled('#next', currPage === pageCount || isEmpty);
    me.setChildDisabled('#last', currPage === pageCount || isEmpty);
    me.setChildDisabled('#refresh', false);
    me.updateInfo();
    Ext.resumeLayouts(true);

    if (!me.calledInternal) {
      me.fireEvent('change', me, pageData || me.emptyPageData);
    }
  },

  setChildDisabled: function(selector, disabled) {
    var item = this.child(selector);
    if (item) {
      item.setDisabled(disabled);
    }
  },

  getPageData: function() {
    var store = this.store,
      totalCount = store.getTotalCount(),
      pageCount = Math.ceil(totalCount / store.pageSize),
      toRecord = Math.min(store.currentPage * store.pageSize, totalCount);

    return {
      total: totalCount,
      currentPage: store.currentPage,
      pageCount: Ext.Number.isFinite(pageCount) ? pageCount : 1,
      fromRecord: (store.currentPage - 1) * store.pageSize + 1,
      toRecord: toRecord || totalCount
    };
  },

  onLoadError: function() {
    this.setChildDisabled('#refresh', false);
  },

  getInputItem: function() {
    return this.child('#inputItem');
  },

  /**
   * @private
   */
  readPageFromInput: function(pageData) {
    var inputItem = this.getInputItem(),
      pageNum = false,
      v;

    if (inputItem) {
      v = inputItem.getValue();
      pageNum = parseInt(v, 10);
      if (!v || isNaN(pageNum)) {
        inputItem.setValue(pageData.currentPage);
        return false;
      }
    }
    return pageNum;
  },

  /**
   * @private
   */
  onPagingBlur: function(e) {
    var inputItem = this.getInputItem(),
      curPage;

    if (inputItem) {
      curPage = this.getPageData().currentPage;
      inputItem.setValue(curPage);
    }
  },

  /**
   * @private
   */
  onPagingKeyDown: function(field, e) {
    this.processKeyEvent(field, e);
  },

  processKeyEvent: function(field, e) {
    var me = this,
      key = e.getKey(),
      pageData = me.getPageData(),
      increment = e.shiftKey ? 10 : 1,
      pageNum;

    if (key === e.RETURN) {
      e.stopEvent();
      pageNum = me.readPageFromInput(pageData);
      if (pageNum !== false) {
        pageNum = Math.min(Math.max(1, pageNum), pageData.pageCount);
        if (
          pageNum !== pageData.currentPage &&
          me.fireEvent('beforechange', me, pageNum) !== false
        ) {
          me.store.loadPage(pageNum);
        }
      }
    } else if (key === e.HOME || key === e.END) {
      e.stopEvent();
      pageNum = key === e.HOME ? 1 : pageData.pageCount;
      field.setValue(pageNum);
    } else if (
      key === e.UP ||
      key === e.PAGE_UP ||
      key === e.DOWN ||
      key === e.PAGE_DOWN
    ) {
      e.stopEvent();
      pageNum = me.readPageFromInput(pageData);
      if (pageNum) {
        if (key === e.DOWN || key === e.PAGE_DOWN) {
          increment *= -1;
        }
        pageNum += increment;
        if (pageNum >= 1 && pageNum <= pageData.pageCount) {
          field.setValue(pageNum);
        }
      }
    }
  },

  /**
   * @private
   */
  beforeLoad: function() {
    this.setChildDisabled('#refresh', true);
  },

  /**
   * Move to the first page, has the same effect as clicking the 'first' button.
   * Fires the {@link #beforechange} event. If the event returns `false`, then
   * the load will not be attempted.
   * @return {Boolean} `true` if the load was passed to the store.
   */
  moveFirst: function() {
    if (this.fireEvent('beforechange', this, 1) !== false) {
      this.store.loadPage(1);
      return true;
    }
    return false;
  },

  /**
   * Move to the previous page, has the same effect as clicking the 'previous' button.
   * Fires the {@link #beforechange} event. If the event returns `false`, then
   * the load will not be attempted.
   * @return {Boolean} `true` if the load was passed to the store.
   */
  movePrevious: function() {
    var me = this,
      store = me.store,
      prev = store.currentPage - 1;

    if (prev > 0) {
      if (me.fireEvent('beforechange', me, prev) !== false) {
        store.previousPage();
        return true;
      }
    }
    return false;
  },

  /**
   * Move to the next page, has the same effect as clicking the 'next' button.
   * Fires the {@link #beforechange} event. If the event returns `false`, then
   * the load will not be attempted.
   * @return {Boolean} `true` if the load was passed to the store.
   */
  moveNext: function() {
    var me = this,
      store = me.store,
      total = me.getPageData().pageCount,
      next = store.currentPage + 1;

    if (next <= total) {
      if (me.fireEvent('beforechange', me, next) !== false) {
        store.nextPage();
        return true;
      }
    }
    return false;
  },

  /**
   * Move to the last page, has the same effect as clicking the 'last' button.
   * Fires the {@link #beforechange} event. If the event returns `false`, then
   * the load will not be attempted.
   * @return {Boolean} `true` if the load was passed to the store.
   */
  moveLast: function() {
    var me = this,
      last = me.getPageData().pageCount;

    if (me.fireEvent('beforechange', me, last) !== false) {
      me.store.loadPage(last);
      return true;
    }
    return false;
  },

  /**
   * Refresh the current page, has the same effect as clicking the 'refresh' button.
   * Fires the {@link #beforechange} event. If the event returns `false`, then
   * the load will not be attempted.
   * @return {Boolean} `true` if the load was passed to the store.
   */
  doRefresh: function() {
    var me = this,
      store = me.store,
      current = store.currentPage;

    if (me.fireEvent('beforechange', me, current) !== false) {
      store.loadPage(current);
      return true;
    }
    return false;
  },

  getStoreListeners: function() {
    return {
      beforeload: this.beforeLoad,
      load: this.onLoad,
      exception: this.onLoadError
    };
  },

  onBindStore: function() {
    if (this.rendered) {
      this.updateBarInfo();
    }
  },

  doDestroy: function() {
    var me = this,
      listener = me._storeChangeListener;

    if (listener) {
      listener.destroy();
      me._storeChangeListener = null;
    }

    me.bindStore(null);

    me.callParent();
  }
});
