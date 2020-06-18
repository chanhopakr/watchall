Ext.define('apps.form.field.CKEditor', {
  extend: 'Ext.form.field.TextArea',
  alias: ['widget.ckeditorfield', 'widget.ckeditor'],

  requires: ['Ext.util.Cookies'],

  config: {
    /**
     * @cfg CKEditor config
     */
    editorConfig: {
      /**
       * Extjs 는 z-index 10000 단위
       */
      baseFloatZIndex: 100000,

      filebrowserBrowseUrl: '/',
      filebrowserImageBrowseUrl: '', // 이미지/이미지 정보/서버 탐색
      filebrowserUploadUrl: '/',
      // fileTools_requestHeaders: {
      //     'X-Requested-With': 'XMLHttpRequest',
      //     'Custom-Header': 'X-CSRFToken': Ext.util.Cookies.get('csrftoken')
      // },
      language: 'ko',

      toolbar: [
        // {name: 'document', groups: ['mode', 'document', 'doctools'], items: ['Source', '-', 'Save', 'NewPage', 'Preview', 'Print', '-', 'Templates']},
        // {name: 'clipboard', groups: ['clipboard', 'undo' ], items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo']},
        // {name: 'editing', groups: ['find', 'selection', 'spellchecker'], items: ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt']},
        // {name: 'forms', items: ['Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField']},
        // '/',
        {
          name: 'basicstyles',
          groups: ['basicstyles', 'cleanup'],
          items: [
            'Bold',
            'Italic',
            'Underline',
            'Strike'
            // 'Subscript',
            // 'Superscript',
            // '-',
            // 'CopyFormatting',
            // 'RemoveFormat'
          ]
        },
        {
          name: 'paragraph',
          groups: ['list', 'indent', 'blocks', 'align', 'bidi'],
          items: [
            'NumberedList',
            'BulletedList',
            '-',
            'Outdent',
            'Indent',
            '-',
            'Blockquote',
            // 'CreateDiv',
            '-',
            'JustifyLeft',
            'JustifyCenter',
            'JustifyRight',
            'JustifyBlock',
            '-',
            'BidiLtr',
            'BidiRtl'
            // 'Language'
          ]
        },
        {
          name: 'links',
          items: [
            'Link',
            'Unlink'
            // 'Anchor'
          ]
        },
        {
          name: 'insert',
          items: [
            'Image',
            // 'Flash',
            'Table'
            // 'HorizontalRule',
            // 'Smiley',
            // 'SpecialChar',
            // 'PageBreak',
            // 'Iframe'
          ]
        },
        '/',
        {
          name: 'styles',
          items: ['Styles', 'Format', 'Font', 'FontSize']
        },
        {
          name: 'colors',
          items: ['TextColor', 'BGColor']
        }
        // {name: 'tools', items: ['Maximize', 'ShowBlocks']},
        // {name: 'others', items: ['-']},
        // {name: 'about', items: ['About']}
      ],

      removePlugins: ['resize']
    }
  },

  /**
   * @override afterRender Ext.form.field.TextArea
   * 여기서 부터 시작
   */
  afterRender: function() {
    const me = this;

    let config = {
      /**
       * @cfg {Boolean} writing
       * writing is custom config and to control editor.change & me.setValue & me.bind.value.setValue.
       */
      writing: false,

      on: {
        instanceReady: me.onInstanceReady,
        change: me.onChangeValue,
        fileUploadRequest: me.onFileUploadRequest,
        fileUploadResponse: me.onFileUploadResponse
      }
    };

    Ext.apply(config, me.config.editorConfig);

    CKEDITOR.on('dialogDefinition', me.initDialogDefinition);
    const editor = CKEDITOR.replace(me.inputEl.dom, config);
    editor.ownerCt = me;

    me.callParent(arguments);
    me.editor = editor;
  },

  initDialogDefinition: function(evt) {
    const dialogName = evt.data.name;

    switch (dialogName) {
      case 'image':
        const dialogDefinition = evt.data.definition;

        ['Link', 'advanced'].forEach(contentId =>
          dialogDefinition.removeContents(contentId)
        );
        break;
      default:
        break;
    }
  },

  onChangeValue: function(evt) {
    const editor = evt.editor;
    const bind = editor.ownerCt.getBind();

    if (bind.hasOwnProperty('value')) {
      editor.writing = true;

      bind.value.setValue(editor.getData());
    }
  },

  /**
   * @method onInstanceReady
   * editor 가 render 후 이벤트
   * @param evt
   */
  onInstanceReady: function(evt) {
    const editor = evt.editor;
    const ownerCt = evt.editor.ownerCt;
    const readOnly = ownerCt.readOnly;
    let height = ownerCt.bodyEl.dom.offsetHeight;

    ['top', 'bottom'].forEach(name => {
      const item = editor.ui.space(name);

      if (readOnly) {
        item.$.style.display = 'none';
      } else {
        item.$.style.display = '';
      }

      if (item) {
        height -= item.$.offsetHeight;
      }
    });

    editor.resize('100%', height, true);
  },

  onFileUploadRequest: function(evt) {
    const fileLoader = evt.data.fileLoader;
    const xhr = fileLoader.xhr;

    xhr.open('POST', fileLoader.uploadUrl, true);
    xhr.setRequestHeader('X-CSRFToken', Ext.util.Cookies.get('csrftoken'));

    const formData = new FormData();

    formData.append('files', fileLoader.file, fileLoader.fileName);
    xhr.send(formData);
    evt.stop();
  },

  onFileUploadResponse: function(evt) {
    evt.stop();

    let data = evt.data;
    const response = JSON.parse(data.fileLoader.xhr.responseText);

    if (response.success) {
      const urls = response.urls;

      if (urls.length) {
        data.url = urls[0]; // file path
      }
    } else {
      data.message = response.errors;

      evt.cancel();
    }
  },

  /**
   * @override setReadOnly Ext.form.field.Text
   */
  setReadOnly: function(readOnly) {
    const me = this;
    const triggers = me.getTriggers();

    readOnly = !!readOnly;

    me.callParent([readOnly]);
    if (me.rendered) {
      me.setReadOnlyAttr(readOnly || !me.editable);
    }

    if (triggers) {
      const hideTriggers = me.getHideTrigger();

      for (let id in triggers) {
        let trigger = triggers[id];
        /*
         * Controlled trigger visibility state is only managed fully when 'hideOnReadOnly' is falsy.
         * Truth table:
         *   - If the trigger is configured/defaulted as 'hideOnReadOnly : true', it's readOnly-visibility
         *     is determined solely by readOnly state of the Field.
         *   - If 'hideOnReadOnly : false/undefined', the Fields.{link #hideTrigger hideTrigger} is honored.
         */
        if (
          trigger.hideOnReadOnly === true ||
          (trigger.hideOnReadOnly !== false && !hideTriggers)
        ) {
          trigger.setVisible(!readOnly);
        }
      }
    }

    const editor = me.editor;

    if (editor && editor.status === 'loaded') {
      editor.setReadOnly(readOnly);
    }
  },

  /**
   * @override getValue Ext.form.field.Text
   */
  getValue: function() {
    if (this.editor) {
      return this.editor.getData();
    } else {
      return this.value;
    }
  },

  /**
   * @override setValue Ext.form.field.Text
   * @param value
   * @returns {*} Ext.form.field.Text
   */
  setValue: function(value) {
    const me = this.callParent([value]);
    this.refreshEmptyText();

    const editor = me.editor;

    if (editor) {
      if (editor.writing) {
        editor.writing = false;
      } else {
        editor.setData(value, {
          callback: function() {
            this.checkDirty();
          }
        });
      }
    }

    return me;
  },

  updateValue: function(value) {
    this.editor.setData(value, {
      callback: function() {
        this.checkDirty();
      }
    });
  },

  destroy: function() {
    const editor = this.editor;

    if (editor) {
      editor.destroy();
    }

    this.callParent();
  }
});
