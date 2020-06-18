var cookies = {
  set: function(name, value) {
    var argv = arguments,
      argc = argv.length,
      expires = argc > 2 ? argv[2] : null,
      path = argc > 3 ? argv[3] : '/',
      domain = argc > 4 ? argv[4] : null,
      secure = argc > 5 ? argv[5] : false;

    document.cookie =
      name +
      '=' +
      escape(value) +
      (expires === null ? '' : '; expires=' + expires.toUTCString()) +
      (path === null ? '' : '; path=' + path) +
      (domain === null ? '' : '; domain=' + domain) +
      (secure === true ? '; secure' : '');
  },
  get: function(name) {
    var parts = document.cookie.split('; '),
      len = parts.length,
      item,
      i,
      ret;

    // In modern browsers, a cookie with an empty string will be stored:
    // MyName=
    // In older versions of IE, it will be stored as:
    // MyName
    // So here we iterate over all the parts in an attempt to match the key.
    for (i = 0; i < len; ++i) {
      item = parts[i].split('=');

      if (item[0] === name) {
        ret = item[1];

        return ret ? unescape(ret) : '';
      }
    }

    return null;
  },
  clear: function(name, path) {
    if (this.get(name)) {
      path = path || '/';
      document.cookie =
        name + '=' + '; expires=Thu, 01-Jan-1970 00:00:01 GMT; path=' + path;
    }
  }
};

function makePOSTRequest(url, params, callback) {
  var request = new XMLHttpRequest();

  if (!request) {
    alert('호환성 문제가 발생되었습니다.');
    return false;
  }

  request.onreadystatechange = function() {
    try {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          var response = JSON.parse(request.responseText);

          if (callback) {
            callback(response);
          }
        } else {
          throw 'Server Errors';
        }
      }
    } catch (e) {
      alert(e);
    }
  };

  request.open('POST', url);
  request.setRequestHeader('X-CSRFToken', cookies.get('csrftoken'));
  request.setRequestHeader(
    'Content-Type',
    'application/x-www-form-urlencoded; charset=UTF-8'
  );
  var data = Object.keys(params).map(function(field) {
    var value = params[field];
    if (value instanceof Date) {
      value = new Date(value.getTime() - value.getTimezoneOffset() * 60000)
        .toJSON()
        .slice(0, -5);
    }
    return field + '=' + encodeURIComponent(value);
  });
  request.send(data.join('&'));
}
