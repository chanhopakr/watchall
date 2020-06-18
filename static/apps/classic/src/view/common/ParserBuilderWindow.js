/**
 * Created by go on 16. 2. 18.
 */
Ext.define('apps.view.common.ParserBuilderWindow', {
  extend: 'Ext.window.Window',

  requires: [
    'Ext.button.Button',
    'Ext.layout.container.Fit',
    'apps.view.common.QueryEditor'
  ],

  width: 1000,
  height: 600,
  bodyPadding: 10,

  referenceHolder: true,
  defaultListenerScope: true,

  layout: 'fit',
  items: [
    {
      xtype: 'queryeditor',
      reference: 'editor',
      mode: 'python',
      highlightActiveLine: false,
      highlightSelectedWord: false
    }
  ],
  buttons: [
    { xtype: 'button', text: '저장', handler: 'onSave' },
    { xtype: 'button', text: '취소', handler: 'onCancel' }
  ],

  listeners: {
    boxready: 'onReady'
  },

  onReady: function() {
    var me = this,
      editor = me.lookupReference('editor').editor,
      session = editor.getSession(),
      colorIndex = 0;

    window.aceRange = ace.require('ace/range').Range;
    ace
      .require('ace/lib/dom')
      .importCssString(
        '\
        .test1 { background-color: #00FFFF; position: absolute; }\
        .test2 { background-color: #7FFFD4; position: absolute; }\
        .test3 { background-color: #7FFF00; position: absolute; }\
        .test4 { background-color: #FF7F50; position: absolute; }\
        .test5 { background-color: #6495ED; position: absolute; }\
        .test6 { background-color: #008000; position: absolute; }\
        .test7 { background-color: #ADFF2F; position: absolute; }\
        '
      );

    editor.setDragDelay(5000);
    session.getSelection().on('changeSelection', function(a, b) {
      // var selection = editor.getSession().getSelection();
      // selection.getRange();

      var start = b.getRange().start, //b.getSelectionAnchor(),
        end = b.getRange().end; //b.getSelectionLead();

      if (start.row == end.row && start.column == end.column) return;

      //session.addMarker(new aceRange(start.row, start.column, end.row, end.column), 'test'+(colorIndex++%8), 'text');
      session.addMarker(
        new aceRange(start.row, start.column, end.row, end.column),
        'test1',
        'text'
      );
      session.getSelection().clearSelection();
    });
    //editor.onSelectionChange = function(a, b, c, d) {
    //};
    //x.session.addMarker(new aceRange(1,1,1,10), "test1", "text"); // text/line

    // highlight the word
    //var range = new Range(rowStart, columnStart, rowEnd, columnEnd);
    //var marker = editor.getSession().addMarker(range, "bar", true);

    // remove the highlighted word
    //editor.getSession().removeMarker(marker);

    // highlight the line
    //editor.getSession().addMarker(range,"ace_active_line","background");
  },

  onSave: function() {
    alert('implement me.');
  },

  onCancel: function() {
    this.close();
  }
});
