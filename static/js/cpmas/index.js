$(document).ready(function() {
  $('#forgot').hide();
  $('html')
    .hide()
    .fadeIn(700);
  $('#login-frame')
    .hide()
    .fadeIn(1500);
});

function closeSignUpForm() {
  $('#signUpForm')[0].reset();
  $('#signUpModal').modal('hide');
}

function validateLoginForm() {
  var form = document.forms['login-form'];
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

function validateSignUpForm() {
  var form = document.forms['signUpForm'];
  var fields = [
    'username',
    'password',
    'password_confirm',
    'first_name',
    'phone',
    'email',
    'department',
    'request_description'
  ];

  for (var i = 0, len = fields.length; i < len; i += 1) {
    var name = fields[i];
    var field = form[name];

    if (!field.value) {
      alert(field.placeholder + '를 확인하십시오');
      field.focus();
      return false;
    }
  }
  var passwordField = form['password'];
  var pw_ret = check_passwd(
    passwordField.value,
    PASSWD_LENGTH,
    PASSWD_ALPHA,
    PASSWD_NUMBER,
    PASSWD_SPECIAL
  );

  if (pw_ret.error && passwordField.value.length != 0) {
    if (pw_ret.error == 'LENGTH') {
      alert('비밀번호를 ' + PASSWD_LENGTH + '자리 이상 입력해주세요.');
    } else if (
      pw_ret.error === 'ALPHA' ||
      pw_ret.error === 'NUMBER' ||
      pw_ret.error === 'SPECIAL'
    ) {
      var buf = '비밀번호를';
      if (PASSWD_ALPHA === 'True') {
        buf += ' 알파벳';
      }
      if (PASSWD_NUMBER === 'True') {
        if (buf != '비밀번호를') {
          buf += ', 숫자';
        } else {
          buf += ' 숫자';
        }
      }
      if (PASSWD_SPECIAL === 'True') {
        if (buf != '비밀번호를') {
          buf += ', 특수문자';
        } else {
          buf += ' 특수문자';
        }
      }
      alert(buf + ' (을)를 포함한 문자열로 입력해주세요');
    }
    return false;
  }

  if (passwordField.value !== form['password_confirm'].value) {
    alert(passwordField.placeholder + '가 일치하기 않습니다.');
    passwordField.focus();
    return false;
  }
}

function check_passwd(
  passwd,
  PASSWD_LENGTH,
  PASSWD_ALPHA,
  PASSWD_NUMBER,
  PASSWD_SPECIAL
) {
  var ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var NUMBER = '1234567890';
  var SPECIAL = '!@#$%^&*()-_+=[]{}';

  if (PASSWD_LENGTH > passwd.length) {
    return { error: 'LENGTH' };
  }

  var types = [];
  if (PASSWD_ALPHA == 'True') {
    types.push(ALPHA);
  }
  if (PASSWD_NUMBER == 'True') {
    types.push(NUMBER);
  }
  if (PASSWD_SPECIAL == 'True') {
    types.push(SPECIAL);
  }

  for (var i = 0; i < types.length; i++) {
    var found = false;
    for (var j = 0; j < passwd.length; j++) {
      if (types[i].indexOf(passwd.charAt(j)) > -1) {
        found = true;
        break;
      }
    }

    if (!found) {
      if (types[i] == ALPHA) {
        return { error: 'ALPHA' };
      } else if (types[i] == NUMBER) {
        return { error: 'NUMBER' };
      } else if (types[i] == SPECIAL) {
        return { error: 'SPECIAL' };
      }
    }
  }

  return { error: '' };
}

// var PASSWD_LENGTH = '{{ passwd_length }}';
// var PASSWD_ALPHA = '{{ passwd_alpha }}';
// var PASSWD_NUMBER = '{{ passwd_number }}';
// var PASSWD_SPECIAL = '{{ passwd_special }}';
// var passwd = CryptoJS.SHA512($('#passwd_raw').val()).toString();
//
// function ajax(url, params, callback, opts) {
//   var base = {
//     url: url,
//     timeout: 600000, // 10min
//     method: 'POST',
//     params: params,
//     success: function(response) {
//       var obj = Ext.decode(response.responseText);
//       callback(obj);
//     },
//     failure: function(response) {}
//   };
//   if (opts) {
//     for (var o in opts) {
//       base[o] = opts[o];
//     }
//   }
//   return Ext.Ajax.request(base);
// }
//
// function check_passwd(passwd) {
//   var ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
//   var NUMBER = '1234567890';
//   var SPECIAL = '!@#$%^&*()-_+=[]{}';
//   var i, l, found;
//
//   if (stringByteSize(passwd) > 16) {
//     return { error: 'TOOLENGTH' };
//   }
//
//   if (PASSWD_LENGTH > passwd.length) {
//     return { error: 'LENGTH' };
//   }
//
//   var types = [];
//   if (PASSWD_ALPHA == 'on') {
//     types.push(ALPHA);
//   }
//   if (PASSWD_NUMBER == 'on') {
//     types.push(NUMBER);
//   }
//   if (PASSWD_SPECIAL == 'on') {
//     types.push(SPECIAL);
//   }
//
//   for (i = 0, l = types.length; i < l; i++) {
//     found = false;
//     for (var j = 0; j < passwd.length; j++) {
//       if (types[i].indexOf(passwd.charAt(j)) > -1) {
//         found = true;
//         break;
//       }
//     }
//
//     if (!found) {
//       if (types[i] == ALPHA) {
//         return { error: 'ALPHA' };
//       } else if (types[i] == NUMBER) {
//         return { error: 'NUMBER' };
//       } else if (types[i] == SPECIAL) {
//         return { error: 'SPECIAL' };
//       }
//     }
//   }
//
//   return { error: '' };
// }
//
//
// function charByteSize(ch) {
//   if (ch == null || ch.length == 0) {
//     return 0;
//   }
//
//   var charCode = ch.charCodeAt(0);
//
//   if (charCode <= 0x00007f) {
//     return 1;
//   } else if (charCode <= 0x0007ff) {
//     return 2;
//   } else if (charCode <= 0x00ffff) {
//     return 3;
//   } else {
//     return 4;
//   }
// }
//
// function stringByteSize(str) {
//   if (str == null || str.length == 0) {
//     return 0;
//   }
//
//   var size = 0;
//   for (var i = 0; i < str.length; i++) {
//     size += charByteSize(str.charAt(i));
//   }
//   return size;
// }
//
// function apply() {
//   var csrf = $('#csrfmiddlewaretoken').val(),
//     userID = $('#userID').val(),
//     passwd1 = $('#passwd').val(),
//     passwd2 = $('#passwd2').val(),
//     first_name = $('#first_name').val(),
//     email = $('#email').val(),
//     tel = $('#phone').val(),
//     depart = $('#depart').val(),
//     desc = $('#desc').val(),
//     admin = $('#admin').val(),
//     ip = $('#ip').val();
//
//   if (!userID) {
//     modalShow('사용자 ID를 입력하세요.');
//     return false;
//   }
//   if (!passwd1) {
//     modalShow('암호를 입력하세요.');
//     return false;
//   }
//   if (passwd1 !== passwd2) {
//     modalShow('암호 확인이 다릅니다.');
//     return false;
//   }
//   if (!first_name) {
//     modalShow('이름을 입력하세요.');
//     return false;
//   }
//   if (!tel) {
//     modalShow('휴대전화를 입력하세요.');
//     return false;
//   }
//   if (!email) {
//     modalShow('이메일을 입력하세요.');
//     return false;
//   }
//   if (!depart) {
//     modalShow('부서를 입력하세요.');
//     return false;
//   }
//   if (!desc) {
//     modalShow('신청사유를 입력하세요.');
//     return false;
//   }
//   if (!admin) {
//     modalShow('관리자여부를 선택하세요.');
//     return false;
//   }
//
//   var fields = [
//     ['userID', 'ID를'],
//     ['passwd', '비밀번호를'],
//     ['passwd2', '비밀번호 확인을'],
//     ['first_name', '이름을'],
//     ['phone', '휴대폰번호를'],
//     ['email', '이메일을'],
//     ['depart', '부서를'],
//     ['desc', '신청사유를']
//   ];
//   for (var i = 0; i < fields.length; i++) {
//     var o = fields[i][0];
//     if (!$('#' + o).val()) {
//       modalShow('필수항목을 모두 입력해주세요.');
//       $('#' + o).focus();
//       return;
//     }
//   }
//
//   if (userID == 'packet' || userID == 'session' || userID == 'process') {
//     modalShow('시스템 예약어(session, process, packet)는 사용할 수 없습니다.');
//     $('#userID').val('');
//     $('#userID').focus();
//     return;
//   }
//   if (/[^(a-zA-Z0-9_@\.\-)]/.test(userID)) {
//     modalShow('ID를 영문자/숫자/_으로 입력해주세요.');
//     $('#userID').val('');
//     $('#userID').focus();
//     return;
//   }
//   if (userID.length < 6) {
//     modalShow('ID를 6자리 이상 입력해주세요.');
//     $('#userID').focus();
//     return;
//   }
//   if (passwd1 != passwd2) {
//     modalShow('비밀번호가 일치하지 않습니다.');
//     $('#passwd1').val('');
//     $('#passwd2').val('');
//     $('#passwd1').focus();
//     return;
//   }
//
//   var result = check_passwd(passwd1);
//   if (result.error) {
//     if (result.error == 'LENGTH') {
//       modalShow('비밀번호를 ' + PASSWD_LENGTH + '자리 이상 입력해주세요');
//     } else if (
//       result.error == 'ALPHA' ||
//       result.error == 'NUMBER' ||
//       result.error == 'SPECIAL'
//     ) {
//       var buf = '';
//       if (PASSWD_ALPHA == 'on') {
//         buf += '알파벳';
//       }
//       if (PASSWD_NUMBER == 'on') {
//         if (buf != '') {
//           buf += ' + ' + '숫자';
//         } else {
//           buf += '숫자';
//         }
//       }
//       if (PASSWD_SPECIAL == 'on') {
//         if (buf != '') {
//           buf += ' + ' + '특수문자';
//         } else {
//           buf += '특수문자';
//         }
//       }
//       modalShow('비밀번호를 ' + buf + ' (을)를 포함한 문자열로 입력해주세요');
//     }
//     return;
//   }
//
//   tel = isValidPhoneNumber(tel);
//   if (!/^\(?([0-9]{3})\)?[-. ]?([0-9]{3,4})[-. ]?([0-9]{4})$/.test(tel)) {
//     modalShow('올바른 휴대폰번호가 아닙니다.');
//     $('#phone').focus();
//     return;
//   }
//
//   if (!isValidEmail(email)) {
//     modalShow('올바른 이메일주소가 아닙니다.');
//     $('#email').val('');
//     $('#email').focus();
//     return;
//   }
//
//   if (ip && !isValidIP(ip)) {
//     modalShow('올바른 IP주소가 아닙니다.');
//     $('#ip').val('');
//     $('#ip').focus();
//     return;
//   }
//
//   $.ajax({
//     url: '/signup',
//     type: 'POST',
//     data: {
//       userID: userID,
//       passwd: CryptoJS.SHA512(passwd1 + userID).toString(),
//       first_name: first_name,
//       email: email,
//       phone: tel,
//       depart: depart,
//       desc: desc,
//       admin: admin,
//       ip: ip,
//       status: 0,
//       csrfmiddlewaretoken: csrf
//     },
//     success: function(data, textStatus, jqXHR) {
//       if (data.success) {
//         $('#finishModal').modal();
//         // closeWindow();
//       } else if (data.success === false) {
//         modalShow('생성 실패 :' + data.msg);
//         return false;
//       } else {
//         modalShow('서버와 네트워크 상태 이상');
//         return false;
//       }
//     },
//     error: function(jqXHR, textStatus, errorThrown) {
//       modalShow('서버와 네트워크 상태 이상');
//     }
//   });
// }
//
// function isValidPhoneNumber(originTel) {
//   var telnumber = '';
//   var localNum = [
//     '02',
//     '031',
//     '032',
//     '033',
//     '041',
//     '042',
//     '043',
//     '051',
//     '052',
//     '053',
//     '054',
//     '055',
//     '061',
//     '062',
//     '063',
//     '064',
//     '012',
//     '015',
//     '070',
//     '010',
//     '011',
//     '016',
//     '017',
//     '018',
//     '019',
//     '0502'
//   ];
//   var tel1 = '';
//   var tel2 = '';
//   var tel3;
//   var i;
//
//   for (i = 0; i < originTel.length; i++) {
//     if (originTel.charCodeAt(i) > 47 && originTel.charCodeAt(i) < 58) {
//       telnumber = telnumber + originTel.charAt(i);
//     }
//   }
//
//   for (i = 0; i < localNum.length; i++) {
//     if (telnumber.substr(0, 3) == localNum[i]) {
//       tel1 = telnumber.substr(0, 3);
//       tel2 = telnumber.substr(3, telnumber.length);
//       break;
//     }
//   }
//   if (tel1 == '') {
//     for (i = 0; i < localNum.length; i++) {
//       if (telnumber.substr(0, 2) == localNum[i]) {
//         tel1 = telnumber.substr(0, 2);
//         tel2 = telnumber.substr(2, telnumber.length);
//         break;
//       }
//     }
//   }
//   if (tel1 == '') {
//     for (i = 0; i < localNum.length; i++) {
//       if (telnumber.substr(0, 4) == localNum[i]) {
//         tel1 = telnumber.substr(0, 4);
//         tel2 = telnumber.substr(4, telnumber.length);
//         break;
//       }
//     }
//   }
//   if (tel1 == '' || tel2.length > 8) {
//     return false;
//   }
//   tel3 = tel2.substr(tel2.length - 4, 4);
//   tel2 = tel2.substr(0, tel2.length - 4);
//   return tel1 + '-' + tel2 + '-' + tel3;
// }
//
// function isValidEmail(email) {
//   var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
//   return re.test(email);
// }
//
// function isValidIP(ip) {
//   var expUrl = /^(1|2)?\d?\d([.](1|2)?\d?\d){3}$/;
//   return expUrl.test(ip);
// }
