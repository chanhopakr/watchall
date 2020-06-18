Ext.define('apps.overrides.tree.Panel', {
  override: 'Ext.tree.Panel',

  getChildNodes: (node, attribute, value, field_name = '') => {
    let result = [];
    const core = n => {
      if (n.isLeaf() === false) {
        n.childNodes.forEach(childNode => {
          if (childNode.get(attribute) === value) {
            if (!field_name) {
              result.push(childNode);
            } else {
              result.push(childNode.get(field_name));
            }
          }
          core(childNode);
        });
      }
    };
    core(node);
    return result;
  },

  /**
   * node 의 childNodes 제어하기
   * node 의 하위 node 들중 attribute 가 value 와 일치하는 childNode 에게
   * field_name 의 값을 field_value 변경하고 node 의 event 호출하기
   *
   * Examples:
   * this.setChildNodes(node, 'checked', true, 'checked', false, 'expand');
   * this.setChildNodes(node, 'menu_authorization_id', [5, 6], 'checked', true, 'collapse');
   * this.setChildNodes(node, 'id', [5, 6, 88, 95, 25, 41], 'checked', true, 'expand');
   * this.setChildNodes(node, null, null, 'checked', true, 'expand');
   *
   * @param node {Ext.data.NodeInterface}
   * @param attribute {String} 찾을 NodeInterface.data 의 key
   * @param value {Object} 찾을 NodeInterface.data.key 값 과 일치하는지 비교할 값
   * @param field_name {String} 변경할 NodeInterface.data 의 key
   * @param field_value {Object} 변경할 NodeInterface.data.key 의 값
   * @param event {String} NodeInterface 에서 호출할 이벤트 명
   * @param args {Object} NodeInterface 에서 호출할 이벤트의 인자 값
   */
  setChildNodes: (
    node,
    attribute,
    value,
    field_name = undefined,
    field_value = undefined,
    event = undefined,
    args = undefined
  ) => {
    const core = n => {
      if (n.isLeaf() === false) {
        n.childNodes.forEach(childNode => {
          if (attribute) {
            const old_value = childNode.get(attribute);
            if (
              false ===
              ((old_value instanceof Array && old_value.indexOf(value) > -1) ||
                (value instanceof Array && value.indexOf(old_value) > -1) ||
                value === old_value)
            ) {
              core(childNode);
              return;
            }
          }

          if (field_name) {
            childNode.set(field_name, field_value);
          }

          if (event && n[event]) {
            n[event](args);
          }

          core(childNode);
        });
      }
    };
    Ext.suspendLayouts();
    core(node);
    Ext.resumeLayouts(true);
  },

  /**
   * node 의 parentNode 제어하기
   * node 의 상위 node 들중 attribute 가 value 와 일치하는 상위 node 에게
   * field_name 의 값을 field_value 변경하고 node 의 event 호출하기
   *
   * Examples:
   * this.setChildNodes(node, 'checked', true, 'checked', false, 'expand');
   * this.setChildNodes(node, 'menu_authorization_id', [5, 6], 'checked', true, 'collapse');
   * this.setChildNodes(node, 'id', [5, 6, 88, 95, 25, 41], 'checked', true, 'expand');
   * this.setChildNodes(node, null, null, 'checked', true, 'expand');
   *
   * @param node {Ext.data.NodeInterface}
   * @param attribute {String} 찾을 NodeInterface.data 의 key
   * @param value {Object} 찾을 NodeInterface.data.key 값 과 일치하는지 비교할 값
   * @param field_name {String} 변경할 NodeInterface.data 의 key
   * @param field_value {Object} 변경할 NodeInterface.data.key 의 값
   * @param event {String} NodeInterface 에서 호출할 이벤트 명
   * @param args {Object} NodeInterface 에서 호출할 이벤트의 인자 값
   */
  setParentNodes: (
    node,
    attribute,
    value,
    field_name = undefined,
    field_value = undefined,
    event = undefined,
    args = undefined
  ) => {
    const core = n => {
      if (n.isRoot() === false) {
        if (attribute) {
          const old_value = n.parentNode.get(attribute);
          if (
            false ===
            ((old_value instanceof Array && old_value.indexOf(value) > -1) ||
              (value instanceof Array && value.indexOf(old_value) > -1) ||
              value === old_value)
          ) {
            core(n.parentNode);
            return;
          }
        }

        if (field_name) {
          if (
            field_name === 'checked' &&
            field_value === false &&
            n.parentNode.childNodes.find(
              child => child.get(field_name) === true
            )
          ) {
            /**
             * Exception
             * check 해제시 상위(parentNode)의 하위(childNodes)가 하나라도 checked true 인 경우 제외하기
             */
          } else {
            n.parentNode.set(field_name, field_value);
          }
        }

        if (event && n[event]) {
          n.parentNode[event](args);
        }

        core(n.parentNode);
      }
    };
    Ext.suspendLayouts();
    core(node);
    Ext.resumeLayouts(true);
  },

  checkedAll: function(checked) {
    Ext.suspendLayouts();
    this.getStore().each(node => node.set('checked', checked));
    Ext.resumeLayouts(true);
  },

  getLastChecked: function() {
    const checked = this.getChecked();
    return checked ? checked[checked.length - 1] : checked;
  }
});
