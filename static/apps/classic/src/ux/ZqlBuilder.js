/**
 * Created by zen on 17. 3. 23.
 */
Ext.define('apps.ux.ZqlBuilder', {
  statics: {
    RE_WHERE: (function() {
      var re = Ext.String.format(
        '(?:^|,|where)\\s*(\\w+?)\\s*({0})\\s*(\\(\\S+?\\)|(?:\\S+?))(?=\\s|$|,)',
        _.chain([
          ' in iplist ',
          ' in ',
          ' not in ',
          ' like ',
          ' is not ',
          '>',
          '<',
          '='
        ])
          .map(function(word) {
            return '(?:' + word + ')';
          })
          .join('|')
          .value()
      );
      return new RegExp(re, 'g');
    })(),
    RE_KEYWORD: (function() {
      var re = Ext.String.format(
        '({0})=(?:[\'|"])?(.*?)(?:[\'|"])?(?=\\s*(?:[,|\\s]|$))',
        _.chain(['startdate', 'enddate', '_host', '_tag', '_source'])
          .map(function(word) {
            return '(?:' + word + ')';
          })
          .join('|')
          .value()
      );
      return new RegExp(re, 'g');
    })(),
    parseKeyword: function(query) {
      var regex = apps.ux.ZqlBuilder.RE_KEYWORD;
      var result = [];
      while ((m = regex.exec(query)) !== null) {
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }
        if (m && m.length > 2) {
          result.push({
            keyword: m[1],
            value: m[2]
          });
        }
      }
      return result;
    },
    parseWhere: function(query) {
      var regex = apps.ux.ZqlBuilder.RE_WHERE;
      var result = [];
      while ((m = regex.exec(query)) !== null) {
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }
        if (m && m.length > 3) {
          if (
            _.contains(
              ['startdate', 'enddate', '_host', '_tag', '_source'],
              m[1]
            )
          ) {
            continue;
          }
          var value = m[3];
          var isArray = /\((.*?)\)/.exec(value);
          var extractValueRE = /['|"](.*?)['|"]/;
          if (isArray && isArray.length > 0) {
            var value_list = isArray[1].split(',');
            var value_type = extractValueRE.test(value_list[0])
              ? 'string'
              : 'number';
            value_list = _.map(value_list, function(item) {
              var m = extractValueRE.exec(item);
              return m && m.length > 0 ? m[1] : item;
            });
            result.push({
              column: m[1],
              condition: m[2],
              value: value_list,
              type: value_type
            });
          } else {
            var parseValue = extractValueRE.exec(value);
            result.push({
              column: m[1],
              condition: m[2],
              value:
                parseValue && parseValue.length > 1 ? parseValue[1] : value,
              type: parseValue ? 'string' : 'number'
            });
          }
        }
      }
      return result;
    },
    parse: function(query) {
      if (!query) {
        return apps.ux.ZqlBuilder();
      }
      var where_list = [],
        sources = [],
        hosts = [],
        tags = [],
        columns = [],
        sorts = [],
        lookup_list = [],
        extra_list = [],
        startdate_str,
        enddate_str;
      _.each(query.split(/s*\|\s*/), function(str) {
        var where_result = apps.ux.ZqlBuilder.parseWhere(str);
        if (where_result.length > 0) {
          where_list = where_list.concat(where_result);
        }
        var keyword_result = apps.ux.ZqlBuilder.parseKeyword(str);
        //'startdata','enddate','_host','_tag','_source']
        _.each(keyword_result, function(result) {
          switch (result.keyword) {
            case 'startdate':
              startdate_str = result.value;
              break;
            case 'enddate':
              enddate_str = result.value;
              break;
            case '_host':
              hosts.push(result.value);
              break;
            case '_tag':
              tags.push(result.value);
              break;
            case '_source':
              sources.push(result.value);
              break;
          }
        });
        if (where_result.length == 0 && keyword_result.length == 0) {
          extra_list.push(str);
        }
      });
      return new apps.ux.ZqlBuilder({
        startdate_str: startdate_str,
        enddate_str: enddate_str,
        hosts: hosts,
        tags: tags,
        sources: sources,
        where_list: where_list,
        extra_list: extra_list
      });
    }
  },

  constructor: function(o) {
    if (!o) {
      o = {};
    }
    if (o.startdate_str) {
      this.startdate_str = o.startdate_str;
    } else {
      this.startdate_str = _.isDate(o.startdate)
        ? Ext.Date.format(o.startdate, 'Y-m-d H:i:s')
        : o.startdate;
    }
    if (o.enddate_str) {
      this.enddate_str = o.enddate_str;
    } else {
      this.enddate_str = _.isDate(o.enddate)
        ? Ext.Date.format(o.enddate, 'Y-m-d H:i:s')
        : o.enddate;
    }
    this.sources = o.sources || [];
    this.hosts = o.hosts || [];
    this.tags = o.tags || [];
    this.columns = o.columns || [];
    this.sorts = o.sorts || [];
    this.lookup_list = o.lookup_list || [];
    this.where_list = o.where_list || [];
    this.extra_list = o.extra_list || [];
  },

  clone: function() {
    var o = JSON.parse(JSON.stringify(this));
    return new apps.ux.ZqlBuilder(o);
  },

  reset: function() {
    this.hosts = [];
    this.tags = [];
    this.columns = [];
    this.sorts = [];
    this.lookup_list = [];
    this.where_list = [];
    this.extra_list = [];
    this.stats_str = '';
    this.timestats_str = '';
    this.startdate_str = '';
    this.enddate_str = '';
    return this;
  },

  source: function(o) {
    this.sources.push(o);
    return this;
  },

  tag: function(o) {
    this.tags.push(o);
    return this;
  },

  host: function(o) {
    this.hosts.push(o);
    return this;
  },

  fields: function(o) {
    this.columns = _.union(this.columns, _.isArray(o) ? o : o.split(','));
    return this;
  },

  removeFields: function() {
    this.columns = [];
    return this;
  },

  sort: function(o) {
    var item;
    if (_.isObject(o)) {
      item = { value: o.value, direction: o.direction || 'desc' };
    } else {
      item = { value: o, direction: 'desc' };
    }
    this.sorts = [item];
    return this;
  },

  addSort: function(o) {
    var me = this;
    var fn = function(o) {
      if (_.isObject(o)) {
        me.sorts.push({ value: o.value, direction: o.direction || 'desc' });
      } else {
        me.sorts.push({ value: o, direction: 'desc' });
      }
    };
    if (_.isArray(o)) {
      _.each(o, fn);
    } else {
      fn(o);
    }
    return this;
  },

  where: function(o) {
    var me = this;
    var fn = function(o) {
      me.where_list.push({
        column: o.column,
        value: o.value,
        type: o.type || 'string',
        condition: o.condition || '='
      });
    };
    if (_.isArray(o)) {
      _.each(o, fn);
    } else {
      fn(o);
    }
    return this;
  },

  removeWhere: function(index) {
    this.where_list.splice(index || 0);
    return this;
  },

  lookup: function(o) {
    var me = this;
    me.lookup_list.push({
      out_field: o[0],
      in_field: o[1],
      map_name: o[2],
      key_field: o[3],
      value_field: o[4],
      mode: o[5] || 'normal'
    });
    return this;
  },

  removeLookup: function(o) {
    this.lookup_list = [];
    return this;
  },

  startdate: function(o) {
    this.startdate_str = _.isDate(o) ? Ext.Date.format(o, 'Y-m-d H:i:s') : o;
    return this;
  },

  enddate: function(o) {
    this.enddate_str = _.isDate(o) ? Ext.Date.format(o, 'Y-m-d H:i:s') : o;
    return this;
  },

  extra: function(o) {
    this.extra_list.push(o);
    return this;
  },

  removeExtra: function() {
    this.extra_list = [];
    return this;
  },

  stats: function(o) {
    this.stats_str = o;
    return this;
  },

  timestats: function(o) {
    this.timestats_str = o;
    return this;
  },

  limit: function(limit_count) {
    this.limitCount = limit_count;
    return this;
  },

  getLookup: function() {
    return _.map(this.lookup_list, function(lookup) {
      return [
        lookup.out_field,
        lookup.in_field,
        lookup.map_name,
        lookup.key_field,
        lookup.value_field,
        lookup.mode
      ];
    });
  },

  getFields: function() {
    return _.union(['_date', '_sourcename'], this.columns);
  },

  getQuery: function(options) {
    var options = options || {};
    var me = this;
    var query = '';

    if (this.hosts.length > 0) {
      query = _.map(this.hosts, function(host) {
        return Ext.String.format("_host='{0}'", host);
      }).join(',');
    }

    if (this.sources.length > 0) {
      if (query) {
        query += ', ';
      }
      query += _.map(this.sources, function(source) {
        return Ext.String.format("_source='{0}'", source);
      }).join(',');
    }

    if (this.tags.length > 0) {
      if (query) {
        query += ', ';
      }
      query += _.map(this.tags, function(tag) {
        return Ext.String.format("_tag='{0}'", tag);
      }).join(',');
    }

    if (this.startdate_str) {
      if (query) {
        query += ', ';
      }
      query += Ext.String.format("startdate='{0}'", this.startdate_str);
    }
    if (this.enddate_str) {
      if (query) {
        query += ', ';
      }
      query += Ext.String.format("enddate='{0}'", this.enddate_str);
    }
    var str_where = [];
    _.each(this.where_list, function(c) {
      if (c.column.indexOf(',') > -1) {
        var columns = c.column.split(',');
        var tmp = [];
        _.each(columns, function(column) {
          c.column = column;
          tmp.push(me.serializeWhere(c));
        });
        str_where.push('(' + tmp.join(' or ') + ')');
      } else {
        str_where.push(me.serializeWhere(c));
      }
    });
    if (str_where.length > 0) {
      query += (query ? ' | ' : '') + str_where.join(' | ');
    }
    if (!options.rawlog) {
      if (this.columns.length > 0 && !this.direction) {
        query += Ext.String.format(
          ' | fields all {0} {1}',
          this.limitCount ? 'limit=' + this.limitCount : '',
          this.columns
        );
      } else if (this.direction && this.direction.toUpperCase() == 'DESC') {
        var columns = _.clone(this.columns);
        columns[0] = Ext.String.format('real({0})', columns[0]);
        query += Ext.String.format(
          ' | top {0} {1}',
          this.limitCount ? 'limit=' + this.limitCount : '',
          columns
        );
      } else if (this.direction && this.direction.toUpperCase() == 'ASC') {
        var columns = _.clone(this.columns);
        columns[0] = Ext.String.format('real({0})', columns[0]);
        query += Ext.String.format(
          ' | bottom {0} {1}',
          this.limitCount ? 'limit=' + this.limitCount : '',
          columns
        );
      }
    }
    if (this.extra_list.length > 0) {
      if (query) {
        query += ' | ' + this.extra_list.join(' | ');
      } else {
        query = this.extra_list.join(' | ');
      }
    }
    if (!options.rawlog) {
      _.each(this.lookup_list, function(lookup) {
        query += Ext.String.format(
          ' | eval {0}=lookup({1},{2},{3},{4},{5})',
          lookup.out_field,
          lookup.in_field,
          lookup.map_name,
          lookup.key_field,
          lookup.value_field,
          lookup.mode
        );
      });
    }
    if (this.sorts.length > 0) {
      query +=
        ' | sort ' +
        _.map(this.sorts, function(sort) {
          return Ext.String.format(
            '{0} as real {1}',
            sort.value,
            sort.direction
          );
        }).join(',');
    }
    return query;
  },

  serializeWhere: function(c) {
    if (_.isArray(c.value)) {
      if (c.condition == '=' || c.condition == 'in') {
        return Ext.String.format(
          '{0} in ({1})',
          c.column,
          c.type == 'number'
            ? c.value
            : _.map(c.value, function(v) {
                return '"' + v + '"';
              })
        );
      } else if (c.condition == 'not' || c.condition == 'not in') {
        return Ext.String.format(
          '{0} not in ({1})',
          c.column,
          c.type == 'number'
            ? c.value
            : _.map(c.value, function(v) {
                return '"' + v + '"';
              })
        );
      } else if (c.condition == 'iplist') {
        return Ext.String.format(
          '{0} in iplist({1})',
          c.column,
          c.type == 'number'
            ? c.value
            : _.map(c.value, function(v) {
                return '"' + v + '"';
              })
        );
      } else if (c.condition == 'not iplist') {
        return Ext.String.format(
          '{0} not in iplist({1})',
          c.column,
          c.type == 'number'
            ? c.value
            : _.map(c.value, function(v) {
                return '"' + v + '"';
              })
        );
      }
    } else {
      return Ext.String.format(
        '{0} {1} {2}',
        c.column,
        c.condition,
        c.type == 'number'
          ? c.value
          : c.condition == 'like'
          ? "'%" + c.value + "%'"
          : "'" + c.value + "'"
      );
    }
  }
});
