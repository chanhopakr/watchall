Ext.define('apps.view.common.QueryEditor', {
  extend: 'Ext.container.Container',
  alias: 'widget.queryeditor',

  requires: [
    'Ext.container.Container',
    'Ext.form.Label',
    'Ext.layout.container.HBox'
  ],

  fontSize: 13,
  mode: 'ace/mode/zenlog',
  theme: 'ace/theme/crimson_editor',
  layout: { type: 'hbox', align: 'stretch' },
  autoFormat: false,
  showGutter: true, // linenumber
  showPrintMargin: true,
  wrapMode: false,
  highlightActiveLine: true,
  highlightSelectedWord: true,
  enableFind: true,
  softWrap: 'off', // 'off', 'free', number
  lineMode: false, // 1줄모드
  autoHelpTo: null, // dom id 를 지정하면 해당 ID에 도움말을 업데이트함
  installTo: null,

  initComponent: function() {
    var me = this;
    me.zenlog_mode = null;
    me.editor = null;
    me.keywords = {}; // {'$where': true, ...}
    me.updateManualTask = new Ext.util.DelayedTask(me.updateManual, me);
    if (!me.listeners) {
      me.listeners = {};
    }
    if (me.autoHelpTo) {
      me.listeners['change'] = function(editor, e) {
        me.updateManualTask.delay(500);
      };
      me.listeners['focus'] = function() {
        me.updateManualTask.delay(500);
      };
      me.listeners['onclick'] = function() {
        me.updateManualTask.delay(500);
      };
    }
    me._listeners = {};
    Ext.apply(me._listeners, me.listeners); // copy listeners. me.listener will be null after call `callParent()`
    me.items = [];
    if (me.fieldLabel) {
      me.items.push(
        new Ext.form.Label({
          html: me.fieldLabel + ':',
          width: 100,
          margin: '0 5 0 0',
          style: 'text-align: right;'
        })
      );
    }
    if (!me.installTo) {
      me.editorCont = new Ext.container.Container({
        flex: 1,
        style: 'border-width: 1px; border-style: solid; border-color: #b5b8c8;'
      });
      me.editorCont.on('boxready', me.installAceEditor, me);
      me.items.push(me.editorCont);
    }
    me.callParent(arguments);
  },

  installAceEditor: function() {
    var me = this;
    me.editor = ace.edit(me.installTo ? me.installTo : me.editorCont.getId()); // render to this div
    me.editor.$blockScrolling = Infinity; // disable warning message
    var session = me.editor.getSession();
    var renderer = me.editor.renderer;

    me.editor.setHighlightActiveLine(me.highlightActiveLine);
    me.editor.setHighlightSelectedWord(me.highlightSelectedWord);
    me.editor.setTheme(me.theme);
    me.editor.setFontSize(me.fontSize);
    session.setMode(me.mode);
    session.setUseWrapMode(me.wrapMode);
    renderer.setShowGutter(me.showGutter);
    renderer.setShowPrintMargin(me.showPrintMargin);

    var autocomplete = ace.require('ace/autocomplete');
    autocomplete.Autocomplete.prototype.gatherCompletions = function(
      editor,
      callback
    ) {
      var util = ace.require('./autocomplete/util');

      var session = editor.getSession();
      var pos = editor.getCursorPosition();

      var line = session.getLine(pos.row);
      var prefix = util.retrievePrecedingIdentifier(line, pos.column);

      this.base = editor.getCursorPosition();
      this.base.column -= prefix.length;

      var query = Ext.getCmp('query') ? Ext.getCmp('query').getValue() : '';
      // var session = editor.getSession();
      // var pos = editor.getCursorPosition();
      //
      // var line = session.getLine(pos.row);
      // var prefix = util.getCompletionPrefix(editor);
      //
      // this.base = session.doc.createAnchor(pos.row, pos.column - prefix.length);
      // this.base.$insertRight = true;

      var matches = [];
      var total = editor.completers.length;
      if (this.isRemote) {
        apps.ajax(
          '/search/usable_fields',
          { query: query, pos: pos.column, prefix: prefix },
          function(r) {
            callback(null, {
              prefix: prefix,
              matches: r.data
            });
          }
        );
      } else {
        editor.completers.forEach(function(completer, i) {
          completer.getCompletions(editor, session, pos, prefix, function(
            err,
            results
          ) {
            if (!err && results) matches = matches.concat(results);
            // Fetch prefix again, because they may have changed by now
            var pos = editor.getCursorPosition();
            var line = session.getLine(pos.row);
            callback(null, {
              prefix: prefix,
              matches: matches,
              finished: --total === 0
            });
          });
        });
      }

      return true;
    };

    autocomplete.Autocomplete.prototype.openPopup = function(
      editor,
      prefix,
      keepPopupPosition
    ) {
      if (!this.popup) this.$init();

      this.popup.setData(this.completions.filtered);
      editor.keyBinding.addKeyboardHandler(this.keyboardHandler);
      var renderer = editor.renderer;
      if (!keepPopupPosition) {
        this.popup.setRow(0);
        this.popup.setFontSize(editor.getFontSize());

        var lineHeight = renderer.layerConfig.lineHeight;

        var pos = renderer.$cursorLayer.getPixelPosition(this.base, true);
        pos.left -= this.popup.getTextLeftOffset();

        var rect = editor.container.getBoundingClientRect();
        pos.top += rect.top - renderer.layerConfig.offset;
        pos.left += rect.left - editor.renderer.scrollLeft;
        pos.left += renderer.$gutterLayer.gutterWidth;

        pos.left -= 32; // XXX patched
        this.popup.show(pos, lineHeight);
      }
    };

    autocomplete.Autocomplete.prototype.detach = function() {
      this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler);
      this.editor.off('changeSelection', this.changeListener);
      this.editor.off('blur', this.blurListener);
      this.editor.off('mousedown', this.mousedownListener);
      this.editor.off('mousewheel', this.mousewheelListener);
      this.changeTimer.cancel();

      if (this.popup) {
        if (this.tooltipNode) {
          this.tooltipNode.remove();
        }
        this.popup.hide();
      }

      this.activated = false;
      this.completions = this.base = null;

      // XXX patched
      this.editor.detachTime = new Date();
    };

    var HashHandler = ace.require('ace/keyboard/hash_handler').HashHandler;
    var h = new HashHandler();
    h.bindKeys({
      Up: function() {
        me.updateManualTask.delay(500);
        return false;
      },
      Down: function() {
        me.updateManualTask.delay(500);
        return false;
      },
      Left: function() {
        me.updateManualTask.delay(500);
        return false;
      },
      Right: function() {
        me.updateManualTask.delay(500);
        return false;
      },
      Home: function() {
        me.updateManualTask.delay(500);
        return false;
      },
      End: function() {
        me.updateManualTask.delay(500);
        return false;
      }
    });
    me.editor.keyBinding.addKeyboardHandler(h);

    ace.config.loadModule('ace/ext/language_tools', function() {
      me.editor.setOptions({
        enableSnippets: true,
        enableBasicAutocompletion: true
      });

      if (me.lineMode) {
        me.editor.commands.removeCommand('golineup');
        me.editor.commands.removeCommand('golinedown');
      }
      me.editor.commands.removeCommand('startAutocomplete');
      me.editor.commands.addCommands([
        {
          name: 'autoComplete_remote',
          exec: function(editor) {
            if (!editor.completer)
              editor.completer = new autocomplete.Autocomplete();
            editor.completer.autoInsert = true;
            editor.completer.autoSelect = true;
            editor.completer.isRemote = true;
            editor.completer.showPopup(editor);
            editor.completer.cancelContextMenu();
          },
          bindKey: 'F1'
        },
        {
          name: 'autoComplete_local',
          exec: function(editor) {
            if (!editor.completer)
              editor.completer = new autocomplete.Autocomplete();
            editor.completer.autoInsert = true;
            editor.completer.autoSelect = true;
            editor.completer.isRemote = false;
            editor.completer.showPopup(editor);
            editor.completer.cancelContextMenu();
          },
          bindKey: 'Tab'
          //bindKey:'Shift-Ctrl-Space|Ctrl-L|Shift-Space'
        },
        // I LOVE VIM :D
        {
          name: 'toggleVim',
          bindKey: { win: 'F7', mac: 'F7' },
          exec: function() {
            ace
              .require('ace/lib/net')
              .loadScript('/static/js/ace/keybinding-vim.js', function() {
                me.editor.setKeyboardHandler('ace/keyboard/vim');
              });
          },
          readOnly: true
        }
      ]);
      //var keywords = session.getMode().getCompletions(),
      //    keyword;
      //for (var i = 0, l = keywords.length; i < l; i++) {
      //    keyword = keywords[i];
      //    //if(keywords[i].name[0] == '$') {
      //        me.keywords[keywords[i].name] = true;
      //    //}
      //}
      // FIXME get commands from module
      var keywords = [
        'fields',
        'where',
        'stats',
        'eval',
        'define',
        'innerjoin',
        'rename',
        'outerjoin',
        'sort',
        'top',
        'bottom',
        'dbinsert',
        'add',
        'save',
        'saveas',
        'saveadd',
        'from',
        'join',
        'set',
        'overlay',
        'columnname',
        'columnhide',
        'chart',
        'for',
        'timestats',
        'rex',
        'dedup',
        'transaction',
        'concurrency',
        'logtype',
        'replace',
        'iplocation',
        'countrylocation'
      ];
      for (var i = 0, l = keywords.length; i < l; i++) {
        me.keywords[keywords[i]] = true;
      }
    });

    switch (me.softWrap) {
      case 'off':
        session.setUseWrapMode(false);
        renderer.setPrintMarginColumn(80);
        break;
      case 'free':
        session.setUseWrapMode(true);
        session.setWrapLimitRange(null, null);
        renderer.setPrintMarginColumn(80);
        break;
      default:
        session.setUseWrapMode(true);
        var col = parseInt(me.softWrap, 10);
        session.setWrapLimitRange(col, col);
        renderer.setPrintMarginColumn(col);
    }
    if (!me.enableFind) {
      me.editor.commands.addCommands([
        {
          name: 'unfind',
          bindKey: {
            win: 'Ctrl-F',
            mac: 'Command-F'
          },
          exec: function() {
            return false;
          },
          readOnly: true
        }
      ]);
    }
    me.on('resize', function() {
      me.editor.resize(true);
    });
    if (me.lineMode) {
      $onPaste = me.editor.onPaste;
      me.editor.onPaste = function(text) {
        text = text
          .replace(/\r/g, '')
          .replace(/\n/g, ' ')
          .replace(/\|\$/g, '| $');
        $onPaste.apply(me.editor, [text]);
      };
    }

    if (me._listeners) {
      var evt;
      for (evt in me._listeners) {
        if (evt == 'change') {
          me.editor.on('change', function(text) {
            me._listeners['change'](me.editor, text);
          });
        } else if (evt == 'focus') {
          me.editor.on('focus', function() {
            me._listeners['focus'](me.editor);
          });
        } else if (evt == 'onclick') {
          // custom event
          var dom = $('#' + me.getId() + ' div.ace_scroller')[0];
          if (dom) {
            dom.onclick = function() {
              me._listeners['onclick'](me.editor);
            };
          }
        }
      }
    }
  },

  updateManual: function() {
    var me = this,
      start = 0,
      keyword,
      cmd;

    cmd = me.getCursorAroundCommand().trim();
    if (cmd) {
      start = cmd.search(/\w+/);
      if (start > -1) {
        keyword = cmd.substr(start).split(/\s/)[0];
        if (
          me.keywords[keyword] ||
          keyword.indexOf('timestats') == 0 ||
          keyword.indexOf('top') == 0 ||
          keyword.indexOf('bottom') == 0
        ) {
          me.updateHtml(keyword);
          return;
        }
      }
    }
    // not found
    me.updateHtml('');
  },

  getCursorAroundCommand: function() {
    var me = this,
      editor = me.editor,
      session = editor.getSession(),
      position = editor.getCursorPosition(),
      pbuf = [], // previous
      nbuf = [], // next
      pos = 0,
      line,
      found,
      i,
      l;
    for (i = position.row; i >= 0; i--) {
      found = false;
      line = session.getLine(i);
      if (i == position.row) {
        line = line.substr(0, position.column);
      }
      pos = line.lastIndexOf('{');
      if (pos > -1) {
        line = line.substr(pos + 1);
        found = true;
      }
      pos = line.lastIndexOf('|');
      if (pos > -1) {
        line = line.substr(pos + 1);
        found = true;
      }
      if (line.trim()) {
        pbuf.push(line);
      }
      if (found) {
        break;
      }
    }
    for (i = position.row, l = editor.getSession().getLength(); i < l; i++) {
      found = false;
      line = session.getLine(i);
      if (i == position.row) {
        line = line.substr(position.column);
      }
      pos = line.indexOf('{');
      if (pos > -1) {
        line = line.substr(0, pos);
        found = true;
      }
      pos = line.indexOf('}');
      if (pos > -1) {
        line = line.substr(0, pos);
        found = true;
      }
      pos = line.indexOf('|');
      if (pos > -1) {
        line = line.substr(0, pos);
        found = true;
      }
      if (line.trim()) {
        nbuf.push(line);
      }
      if (found) {
        break;
      }
    }
    return pbuf.join(' ') + nbuf.join(' ');
  },

  updateHtml: function(keyword) {
    var me = this;
    if (keyword.indexOf('timestats') == 0) {
      keyword = 'timestats';
    } else if (keyword.indexOf('top') == 0) {
      keyword = 'top';
    } else if (keyword.indexOf('bottom') == 0) {
      keyword = 'bottom';
    }

    if (!keyword || me.lastKeyword == keyword) {
      return; // already displayed
    }
    me.lastKeyword = keyword; // cache

    if (keyword) {
      //keyword = keyword.substr(1); // replace '$'
      var state = 'ko';
      var html = '';
      //var helpTo = $('#'+me.autoHelpTo);
      //helpTo.html();
      //helpTo.scrollTop(0);
      $('#' + me.autoHelpTo).load(
        '/static/help/' + state + '/' + state + '.' + keyword + '.html'
      );
    } else {
      if (typeof me.autoHelpTo == 'string') {
        $('#' + me.autoHelpTo).html('');
      } else {
        me.autoHelpTo.update('');
      }
      //Ext.getCmp(me.autoHelpTo).update('');
      //me.manual.update('');
    }
  },

  prettyformat: function(query) {
    var p_list = query.replace(/\s+/g, ' ').split('||'),
      p = [],
      lines = [],
      i,
      l,
      j,
      k,
      t_list,
      t;

    for (i = 0, l = p_list.length; i < l; i++) {
      lines = [];
      t_list = p_list[i].split(/\s*\|\s*/g);
      for (j = 0, k = t_list.length; j < k; j++) {
        t = t_list[j].trim();
        lines.push(t);
      }
      p.push(lines.join(' |\n'));
    }
    return p.join(' ||\n\n');
  },

  onelineformat: function(query) {
    query = query.replace(/\s+/g, ' ');
    var lines = query.split('\n');
    var _lines = [];
    var line = null;
    for (var i = 0, l = lines.length; i < l; i++) {
      line = lines[i].trim();
      if (line) {
        _lines.push(line);
      }
    }
    return _lines.join(' ');
  },

  setValue: function(query) {
    var me = this;
    if (me.autoFormat) {
      query = me.prettyformat(query);
    }

    if (me.rendered) {
      me.editor.setValue(query);
      me.editor.clearSelection();
    } else {
      me.on(
        'boxready',
        function() {
          me.editor.setValue(query);
          me.editor.clearSelection();
        },
        me
      );
    }
  },

  getValue: function() {
    var me = this;
    return me.autoFormat
      ? me.onelineformat(me.editor.getValue())
      : me.editor.getValue();
  }
});
