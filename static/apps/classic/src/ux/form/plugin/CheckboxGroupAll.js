/**
 * CheckboxGroupAll plugin 사용시 권장사항
 * default value: {'checkboxgroup-name': ['inputValue-0', 'inputValue-1', ..]}
 *
 * 해당 value 가 다른 checkboxgroup 과 함께 사용되는 bind value 를 사용할 경우
 * 관련 component 에게 이벤트를 발생시키므로 독립적 성격의 value 를 사용하십시오
 * Example:
 *
 * category: {
 * a: [], => a: {a: []}  // 독립 시키기
 * b: [] => a: {b: []}  // 독립 시키기
 * }
 *
 * items: [{
 *   xtype: 'checkboxgroup', plugins: [{ptype: 'checkboxgroup-all'}],
 *   name: 'a',
 *   bind: {
 *   value: '{category}' => '{category.a}'  // 독립 시키기
 *   },
 *   // ...
 * }, {
 *   xtype: 'checkboxgroup', plugins: [{ptype: 'checkboxgroup-all'}],
 *   name: 'b',
 *   bind: {
 *   value: '{category}' => '{category.b}'  // 독립 시키기
 *   },
 *   // ...
 * }]
 */
Ext.define('apps.ux.form.plugin.CheckboxGroupAll', {
    extend: 'Ext.plugin.Abstract',
    alias: 'plugin.checkboxgroup-all',

    config: {
        itemId: 'all',
        boxLabel: '전체',
        inputValue: 'all',
        listeners: null
    },

    index: 0,

    init: function(comp) {
        this.setCmp(comp);

        if (!comp.rendered) {
            comp.on('afterrender', this.createCheckboxAll, this);
        } else {
            this.createCheckboxAll();
        }
    },

    createCheckboxAll: function() {
        var index = this.index;
        var cmp = this.cmp;

        if (!this.getConfig('listeners')) {
            this.setConfig('listeners', {
                scope: this,
                change: this.changeCheckboxAll
            });
        }

        var config = this.getConfig();
        config.xtype = 'checkbox';

        cmp.insert(index, config);

        cmp.on({
            change: {
                scope: cmp,
                fn: function(comp, newValue, oldValue, eOpts) {
                    if (newValue) {
                        // 값이 있는 경우
                        if (Object.values(newValue).length) {
                            var items = comp.query('checkbox');

                            // plugin 으로 추가된 checkboxAll 가져오기
                            var checkboxAll = items.splice(index, 1);

                            if (checkboxAll && checkboxAll.length) {
                                checkboxAll = checkboxAll[0];

                                // checkboxAll 를 제외한 나머지 checkbox 의 값 가져오기
                                var extraChecked = [];

                                Ext.each(items, function(item) {
                                    extraChecked.push(item.getValue());
                                });

                                checkboxAll.suspendEvent('change');

                                if (extraChecked.indexOf(true) > -1 && extraChecked.indexOf(false) === -1) {
                                    // 모두 check 인 경우
                                    checkboxAll.setValue(true);

                                    if (newValue[comp.name].indexOf(checkboxAll.inputValue) === -1) {
                                        // newValue 에 checkboxAll 값 추가하기
                                        newValue[comp.name].splice(index, 0, checkboxAll.inputValue);

                                        comp.suspendEvent('change');
                                        comp.setValue(newValue);
                                        comp.resumeEvent('change');
                                    }
                                }
                                else {
                                    if (newValue[comp.name].indexOf(checkboxAll.inputValue) > -1) {
                                        checkboxAll.setValue(false);
                                        // newValue 에 checkboxAll 값 제거하기
                                        newValue[comp.name].splice(index, 1);

                                        comp.suspendEvent('change');
                                        comp.setValue(newValue);
                                        comp.resumeEvent('change');
                                    }
                                }

                                checkboxAll.resumeEvent('change');
                            }
                        }
                    }
                }
            }
        });
    },

    changeCheckboxAll: function(comp, newValue, oldValue, eOpts) {
        comp.ownerCt.query('checkbox').forEach((item) => {
            item.suspendEvent('change');
            item.setValue(newValue);
            item.resumeEvent('change');
        });
    }

});
