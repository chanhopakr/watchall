$(document).ready(function() {
  checkNoticeBoardAlert();
});

function validate() {
  var form = document.forms['login'];
  var fields = ['username', 'password'];

  for (var i = 0, len = fields.length; i < len; i += 1) {
    var name = fields[i];
    var field = form[name];

    if (!field.value) {
      alert(field.placeholder + '를 확인하십시오');
      field.focus();
      return false;
    }
  }
}

function closeNoticeBoardAlert(e) {
  var comp = e.target.getElementById('close_during_day');

  if (!comp) {
    return;
  }

  if (comp.checked) {
    var pk = e.target.location.search.replace('?id=', '');
    if (pk) {
      var cookie = cookies.get('noticeBoard');
      cookie = cookie ? JSON.parse(cookie) : {};
      pk = parseInt(pk, 10);
      cookie[pk] = new Date();
      cookies.set('noticeBoard', JSON.stringify(cookie));
    }
  }
}

function showNoticeBoardAlert(data) {
  var url = '/boards/notice_board_alert/get?id=' + data.id;
  var features =
    'toolbar=yes,scrollbars=yes,resizable=yes,width=800,height=600';
  var win = window.open(url, '_blank', features);

  if (win) {
    win.onbeforeunload = closeNoticeBoardAlert;
  } else {
    alert('이 페이지에서 팝업이 차단되었는지 확인해주십시오.');
  }
}

function checkNoticeBoardAlert() {
  var beginTime = new Date().setHours(0, 0, 0, 0);
  var startTime = new Date(beginTime);
  var endTime = new Date(beginTime + 86400000);

  makePOSTRequest('/boards/notice_board_alert/check', {}, function(response) {
    var cookie = cookies.get('noticeBoard');
    cookie = cookie ? JSON.parse(cookie) : {};
    response.data.forEach(function(data) {
      var closeTime = cookie[data.id];
      closeTime = closeTime ? new Date(closeTime) : null;

      if (closeTime && startTime < closeTime && closeTime < endTime) {
        return;
      }
      showNoticeBoardAlert(data);
    });
  });
}
