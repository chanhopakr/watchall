Ext.define("apps.view.main.MainController", {
  extend: "Ext.app.ViewController",
  alias: "controller.main",

  requires: ["Ext.util.TaskManager", "apps.view.common.Util"],

  uses: ["apps.view.common.AlarmWindow"],

  routes: {
    ":id": "onRouteChange",
    ":main/:sub": "onNestedRouteChangeWrap"
  },

  lastView: null,

  init: function() {
    this.microWidth = 50;
    this.normalWidth = 230;
    this.fullscreen = false;
    this.lastWidth = null;
  },

  onRouteChange: function(id) {
    const navigationStore = this.lookupReference(
      "navigationTreeList"
    ).getStore();
    if (navigationStore.isLoaded()) {
      this.setCurrentView(id);
    } else {
      navigationStore.on({
        load: {
          single: true,
          fn: () => {
            this.setCurrentView(id);
          }
        }
      });
    }
  },

  onNestedRouteChangeWrap(main, sub) {
    const navigationStore = this.lookupReference(
      "navigationTreeList"
    ).getStore();
    if (navigationStore.isLoaded()) {
      this.onNestedRouteChange(main, sub);
    } else {
      navigationStore.on({
        load: {
          single: true,
          fn: () => {
            this.onNestedRouteChange(main, sub);
          }
        }
      });
    }
  },

  onNestedRouteChange: function(main, sub) {
    const container = this.setCurrentView(main);
    const store = this.lookupReference("navigationTreeList").getStore();
    const node = store.findNode("viewType", sub);
    if (!node) {
      this.redirectTo(main);
    } else if (container.setActiveItem) {
      container.suspendEvent("tabchange");
      container.setActiveItem(sub);
      container.resumeEvent("tabchange");
    }
  },

  setCurrentView: function(hashTag, subMenu) {
    hashTag = (hashTag || "").toLowerCase();

    var me = this,
      refs = me.getReferences(),
      mainCard = refs.mainCardPanel,
      mainLayout = mainCard.getLayout(),
      navigationList = refs.navigationTreeList,
      store = navigationList.getStore(),
      node =
        store.findNode("routeId", hashTag) ||
        store.findNode("viewType", hashTag),
      view = (node && node.get("viewType")) || hashTag, //'page404',
      lastView = me.lastView,
      existingItem,
      newView;

    if (hashTag.indexOf("dashboard/") > -1) {
      existingItem = mainCard.child("component[routeId=dashboard]");
      view = "appsdashboard"; // 플레이 설정 할 때는 viewType이 없어서 고정 할당
      hashTag = "dashboard";
      if (existingItem) {
        me.currentDashboard = existingItem;
      }
    } else {
      existingItem = mainCard.child("component[routeId=" + hashTag + "]");
    }

    // Kill any previously routed window
    if (lastView && lastView.isWindow) {
      lastView.destroy();
    }

    lastView = mainLayout.getActiveItem();

    if (!existingItem) {
      newView = Ext.create({
        xtype: view,
        routeId: hashTag, // for existingItem search later
        hideMode: "offsets",
        childNodes: node && node.childNodes
      });
      newView.on("tabchange", function(tab, newCard) {
        var node = store.findNode("viewType", newCard.itemId);
        if (node) {
          me.redirectTo(node.getPath("viewType").slice(2));
        }
      });
      if (view === "appsdashboard") {
        me.currentDashboard = newView;
      }
    }

    if (!newView || !newView.isWindow) {
      // !newView means we have an existing view, but if the newView isWindow
      // we don't add it to the card layout.
      if (existingItem) {
        // We don't have a newView, so activate the existing view.
        if (existingItem !== lastView) {
          mainLayout.setActiveItem(existingItem);
        }
        newView = existingItem;
      } else {
        // newView is set (did not exist already), so add it and make it the
        // activeItem.
        Ext.suspendLayouts();
        mainLayout.setActiveItem(mainCard.add(newView));
        Ext.resumeLayouts(true);
      }
    }

    navigationList.suspendEvent("selectionchange");
    navigationList.setSelection(node);
    navigationList.resumeEvent("selectionchange");

    if (newView.isFocusable(true)) {
      newView.focus();
    }

    me.lastView = newView;

    return newView;
  },

  onNavigationTreeSelectionChange: function(tree, node) {
    const path = node.getPath("viewType").slice(2);

    if (path) {
      this.redirectTo(path);
    }
  },

  onToggleNavigationSize: function(collapsing) {
    var me = this,
      refs = me.getReferences(),
      navigationContainer = refs.navigationContainer,
      navigationList = refs.navigationTreeList,
      wrapContainer = refs.mainContainerWrap,
      logo = refs.senchaLogo;
    new_width = collapsing ? me.microWidth : me.normalWidth;
    if (Ext.isIE9m || !Ext.os.is.Desktop) {
      Ext.suspendLayouts();
      navigationContainer.setWidth(new_width);
      // navigationList.setWidth(new_width);
      navigationList.setMicro(collapsing);
      Ext.resumeLayouts(); // do not flush the layout here...

      // No animation for IE9 or lower...
      wrapContainer.layout.animatePolicy = wrapContainer.layout.animate = null;
      collapsing
        ? navigationContainer.removeCls("expanded")
        : navigationContainer.addCls("expanded");
      // collapsing ? logo.hide() : logo.show()
      wrapContainer.updateLayout(); // ... since this will flush them
    } else {
      if (!collapsing) {
        navigationList.setMicro(false);
        navigationContainer.addCls("expanded");
      } else {
        navigationList.setMicro(true);
        navigationContainer.removeCls("expanded");
      }
      // collapsing ? logo.hide() : logo.show()
      navigationList.canMeasure = false;

      navigationList.width = new_width;
      navigationContainer.width = new_width;
      wrapContainer.updateLayout({ isRoot: true });
    }
  },

  onMainViewRender: function(comp) {
    if (!window.location.hash) {
      this.redirectTo(window.MAIN_HASH || "home");
    }

    this.sessionManagement(comp);
  },

  sessionManagement: function(comp, interval = 1000) {
    const vm = this.getViewModel();

    $(document).ready(() => {
      $(document).mousedown(() => {
        // session idle timeout 확인을 위해 mousedown 이벤트 시간 저장하기
        vm.set("lastEventTime", new Date());
      });
    });

    // 편의성을 위해
    apps.view.common.Util.getSession = () => vm.get("session");

    // 공통으로 사용되는 실패시 함수
    const failureFn = (record, operation) => {
      const resp = JSON.parse(operation.getResponse().responseText);
      Ext.Msg.alert("알림", resp.errors, () => {
        window.location.href = "/logout";
      });
    };

    // session idle timeout task 생성하기
    const task = {
      run: () => {
        const session = vm.get("session");
        const expireDate = session.get("expire_date");
        const now = new Date();
        const delay = 5; // server 와 browser 간 time 간격을 제어하기 위해
        const sec =
          ((expireDate.getTime() - now.getTime()) / 1000).round(0) - delay; // 남은 시간

        if (sec < 0) {
          window.location.href = "/logout";
        }
        // 남은 시간(초)를 기준으로 매 분마다 또는 0 인 경우 갱신시도 하기
        else if (sec % 60 === 0 || sec === 0) {
          // 마지막 이벤트 시간 가져오기
          const lastEventTime = vm.get("lastEventTime");

          if (lastEventTime) {
            // (반드시 session model 값을 참조하기 때문에) session task 일시정지 하기
            Ext.util.TaskManager.stop(apps.view.common.Util.task.session);

            /**
             * expire_date 에 session idle timeout 확인을 위해 저장한 mousedown 이벤트 시간을 대입하기
             * expire_date 는 backend 에서 expiry_age 와 함께 연산되어 만료시간을 갱신한다
             */
            session.set("expire_date", lastEventTime);

            session.save({
              failure: failureFn,
              success: (record, operation) => {
                const resp = JSON.parse(operation.getResponse().responseText);
                // session 정보 갱신하기
                session.set(resp.data);
                session.commit();

                // session idle timeout 확인을 위해 저장한 mousedown 이벤트 시간 초기화 하기
                vm.set("lastEventTime", null);

                // session task 다시 시작하기
                Ext.util.TaskManager.start(apps.view.common.Util.task.session);
              },
              callback: () => {}
            });
          }
        }
      },
      interval
    };

    if (apps.view.common.Util.task) {
      apps.view.common.Util.task.session = task;
    } else {
      apps.view.common.Util.task = { session: task };
    }

    // 최초 session 정보 가져오기
    const session = vm.get("session");
    session.load(null, {
      failure: failureFn,
      success: () => {
        // session idle timeout task 실행하기
        Ext.util.TaskManager.start(apps.view.common.Util.task.session);
      },
      callback: () => {}
    });
  }
});
