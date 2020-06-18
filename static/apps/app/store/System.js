Ext.define("apps.store.System", {
  extend: "Ext.data.Store",
  alias: "store.systems",

  pageSize: 0,

  fields: [
    { name: "hostname" },
    { name: "create_time", type: "date", convert: value => new Date(value) },
    { name: "cpu", convert: value => (value.kernel + value.user) / 100 },
    { name: "disk" },
    { name: "memory" },
    { name: "swap", convert: value => value.used / 100 },
    { name: "uwsgi", allowBlank: true, defaultValue: null },
    { name: "nginx", allowBlank: true, defaultValue: null },
    { name: "postgres", allowBlank: true, defaultValue: null },
    {
      name: "display",
      calculate: data => {
        /**
         * hostname 별칭 지정하기
         *
         * 상용 서버의 hostname 확인 후 각각 별칭 지정한다.
         * 기본 값은 hostname 으로 지정하기.
         */
        const hosts = {
          "p-apita-pd1-w01": "고객 WEB#1",
          "p-apita-pd1-w03": "고객 WEB#2",
          "p-apita-pk1-a03": "고객 WAS#1",
          "p-apita-pk1-a05": "고객 WAS#2",
          "p-apita-pk1-a06": "관리자 WAS",
          "p-apita-pk1-d03": "DB#1",
          "p-apita-pk1-d04": "DB#2",
          "p-apita-pk1-w04": "관리자 WEB",
          master: "DB#1",
          slave: "DB#2"
        };
        const name = data.hostname;
        return hosts[name] || name;
      }
    }
  ],

  proxy: {
    type: "ajax",
    url: "/monitoring/system_status/get",
    reader: {
      type: "json",
      rootProperty: "data"
    }
  }
});
