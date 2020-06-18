Ext.define('apps.form.field.IDMSUserComboBox', {
  extend: 'Ext.form.field.ComboBox',
  alias: ['widget.idmsusercombobox', 'widget.idmsusercombo'],

  /**
   * true: 선택한 값을 목록의 값 중 하나로 제한, 선택한 값(rawValue)로 제어하기
   * false(default): 사용자가 임의의 텍스트를 필드에 설정할 수 있도록
   */
  forceSelection: true,

  /**
   * 'query': run the query using the raw value. (trigger 선택시 rawValue 로 query 요청)
   */
  triggerAction: 'query',
  editable: true,

  /**
   * list 활성화시 자동 선택 유무
   * 단, true 시 displayTpl: null 경우만 할 것, edit 자동 완성 이슈 있음
   */
  typeAhead: false,

  typeAheadDelay: 300,
  // queryDelay: 500,
  queryMode: 'remote',

  /**
   * 값 입력시 저장전 까지의 지연 시간, 이 때, 이벤트 제어하기 위해 사용
   */
  saveDelay: 300,

  /**
   * @cfg minChars
   * 검색시 필요한 최소 문자열 수
   */
  minChars: 2,

  valueField: 'emp_no',
  displayField: 'emp_nm',
  queryParam: 'emp_nm',

  tpl: Ext.create(
    'Ext.XTemplate',
    '<ul class="x-list-plain"><tpl for=".">',
    '<li role="option" class="x-boundlist-item">{emp_nm} ({org_nm})</li>',
    '</tpl></ul>'
  ),

  displayTpl: Ext.create(
    'Ext.XTemplate',
    '<tpl for=".">',
    '{emp_nm} ({org_nm})',
    '</tpl>'
  )
});
