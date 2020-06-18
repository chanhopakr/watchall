/**
 * Created by jjol on 16. 4. 25.
 */

Ext.define('apps.view.common.Renderer', {
  requires: ['Ext.util.Format'],

  singleton: true,

  renderNumberInt: function(value) {
    return Ext.util.Format.number(value, '1,000,000,000,000,000,000');
  },
  renderNumberFloat: function(value) {
    return Ext.util.Format.number(value, '1,000,000,000,000,000,000.00');
  },
  renderConverterFloat: function(size) {
    var unitSeq = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z'],
      last = Math.abs(size),
      unit = unitSeq.shift(),
      rest;

    while (true) {
      // rest = last / 1024.0;
      rest = last / 1000.0;
      if (rest < 1) {
        break;
      }
      last = rest;
      unit = unitSeq.shift();
    }
    return Ext.String.format(
      '{0} {1}',
      Ext.util.Format.number(last, '1,000,000,000,000.00'),
      unit
    );
  },
  renderConverterInt: function(size) {
    var unitSeq = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z'],
      last = Math.abs(size),
      unit = unitSeq.shift(),
      rest;

    while (true) {
      // rest = last / 1024.0;
      rest = last / 1000.0;
      if (rest < 1) {
        break;
      }
      last = rest;
      unit = unitSeq.shift();
    }
    return Ext.String.format(
      '{0} {1}',
      Ext.util.Format.number(last, '1,000,000,000,000'),
      unit
    );
  },
  renderDate: function(value) {
    if (value == null || value == '') {
      return;
    }
    return Ext.Date.format(new Date(value * 1000), 'Y-m-d H:i:s');
  },
  renderDuration: function(value, meta, record) {
    if (value == 0) {
      value = parseInt(new Date().getTime() / 1000 - record.get('ctime'));
    }
    var h = parseInt(value / 3600),
      m = parseInt((value % 3600) / 60),
      s = value % 60,
      str = '';

    if (h > 0) {
      str +=
        h >= 24
          ? Ext.String.format('{0}일 {1}시간', parseInt(h / 24), h % 24)
          : Ext.String.format('{0}시간', h);
    }
    if (m > 0) {
      str += Ext.String.format(' {0}분', m);
    }
    str += Ext.String.format(' {0}초', s < 10 ? '0' + s : s);
    return str;
  },
  renderPowerStatus: function(value) {
    return {
      0: '<span style="color: #bb4b39"><i class="fa fa-circle"></i></span> 실행중지',
      1: '<span style="color: #79C447"><i class="fa fa-circle"></i></span> 정상 실행',
      2: '<span style="color: #79C447"><i class="fa fa-circle-o-notch fa-spin"></i></span> 비정상 실행'
    }[value];
  },
  renderIsIntegrity: function(value) {
    return { 0: '변경됨', 1: '성공' }[value];
  }
});

apps.renderNumberInt = apps.view.common.Renderer.renderNumberInt;
apps.renderNumberFloat = apps.view.common.Renderer.renderNumberFloat;
apps.renderConverterFloat = apps.view.common.Renderer.renderConverterFloat;
apps.renderConverterInt = apps.view.common.Renderer.renderConverterInt;
apps.renderDate = apps.view.common.Renderer.renderDate;
apps.renderDuration = apps.view.common.Renderer.renderDuration;
apps.renderPowerStatus = apps.view.common.Renderer.renderPowerStatus;
apps.renderIsIntegrity = apps.view.common.Renderer.renderIsIntegrity;
