Ext.define('apps.view.main.MainModel', {
  extend: 'Ext.app.ViewModel',
  alias: 'viewmodel.main',

  requires: ['apps.model.Session'],

  data: {
    currentView: null,
    time: '',
    time_int: '',
    logout_time: '',
    spinMode: '',
    alarmCountBackgroundColor: 'transparent', // transparent, 'rgba(187, 75, 57, 0.9)'
    alarmCountFontColor: 'transparent', // transparent, 'white'
    alarmCount: 0,

    /**
     * Session 관리
     *
     * MainController 호출 -> django session 응답 -> MainModel 저장
     * 저장된 세션은 MainController 에서 호출된 task 의해 관리하기
     */
    session: Ext.create('apps.model.Session', {})
  },

  formulas: {}
});
