Ext.define('apps.store.arbor.Period', {
  extend: 'Ext.data.Store',
  alias: 'store.arbor.period',

  autoLoad: true,
  pageSize: 0,

  fields: ['value', 'display', 'start_ascii', 'end_ascii', 'query'],

  proxy: {
    type: 'memory',

    data: [
      {
        value: 'today',
        display: '오늘',
        start_ascii: '24 hours ago',
        end_ascii: 'now',
        query: '<time start_ascii="{0}" end_ascii="{1}"></time>'
      },
      {
        value: 'yesterday',
        display: '어제',
        start_ascii: '00:00 1 day ago',
        end_ascii: '23:59 1 day ago',
        query: '<time start_ascii="{0}" end_ascii="{1}"></time>'
      },
      {
        value: '2 days ago',
        display: '이틀 전',
        start_ascii: '00:00 2 days ago',
        end_ascii: '23:59 2 days ago',
        query: '<time start_ascii="{0}" end_ascii="{1}"></time>'
      },
      {
        value: 'this week',
        display: '이번 주',
        start_ascii: '00:00 7 days ago',
        end_ascii: 'now',
        query: '<time start_ascii="{0}" end_ascii="{1}"></time>'
      },
      {
        value: 'this month',
        display: '이번 달',
        start_ascii: '28 days ago',
        end_ascii: 'now',
        query: '<time start_ascii="{0}" end_ascii="{1}"></time>'
      },
      {
        value: 'this year',
        display: '올해',
        start_ascii: '52 weeks ago',
        end_ascii: 'now',
        query: '<time start_ascii="{0}" end_ascii="{1}"></time>'
      },
      {
        value: 'other',
        display: '기간설정',
        start_ascii: '',
        end_ascii: '',
        query: '<time start_ascii="{0}" end_ascii="{1}"></time>'
      }
    ]
  }
});
