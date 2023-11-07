import hmUI from "@zos/ui";
import { BasePage } from "@zeppos/zml/base-page";
import * as appService from "@zos/app-service";
import { queryPermission, requestPermission } from "@zos/app";
import { replace } from "@zos/router";
const { messageBuilder } = getApp()._options.globalData
import { showToast } from '@zos/interaction'
//const { localStorage } = getApp()._options.globalData
//import { EventBus } from '@zos/utils'
import { LocalStorage } from '@zos/storage'
import {niceTime} from "../shared/date"
import { Time } from "@zos/sensor";
//const timeSensor=new Time;
import { exit } from '@zos/router'
//import {isAppSideRunning} from "../app-service/bg_service"
import { emitCustomSystemEvent } from '@zos/app'
import ui from '@zos/ui'



const localStorage = new LocalStorage();
let vm

//const defaultValue = localStorage.getItem('none_key', 'Not Data, yet')

import {
  SERVICE_TEXT,
  BG_SERVICE_LABEL,
  APP_SERVICE_LABEL,SGV_TREND_IMAGE,BG_STALE_RECT,UNITS_TEXT,
  SGV_TEXT,DATE_TEXT,DELTA_TEXT
} from "zosLoader:./style.[pf].layout.js";
import { notify } from "@zos/notification";

let thisFile = "pages/index";
const serviceFile = "app-service/bg_service";



const txtResource = {
  BG_STATUS: {
    true: "BG-Service: OK",
    false: "BG-Service: OFF",
  },
  APP_STATUS: {
    true: "APP-Service: OK",
    false: "APP-Service: OFF",
  },
};


const permissions = ["device:os.bg_service","device:os.local_storage"];

function setProperty(w, p, v) {
  w.setProperty(p, v);
}

function permissionRequest(vm) {
  const [result2] = queryPermission({
    permissions,
  });
  console.log(`=== start service: ${result2} ===`);
  if (result2 === 0) {
    requestPermission({
      permissions,
      callback([result2]) {
        if (result2 === 2) {
          startBGService(vm,'start');
        }
      },
    });
  } else if (result2 === 2) {
    startBGService(vm,'start');
  }
}
function startBGService(vm,action) {
  console.log(`=== start service: ${serviceFile} ===`);
  const result = appService.start({
    url: serviceFile,
    param: `service=${serviceFile}&action=${action}`,
    complete_func: (info) => {
      console.log(`BG-Service STart result1: ` + JSON.stringify(info));
      //hmUI.showToast({ text: `start result: ${info.result}` });
      // refresh for button status

      if (info.result) {
        vm.state.running = true;
        
        setProperty(
          vm.state.BG_Label,
          hmUI.prop.TEXT,
          txtResource.BG_STATUS[vm.state.running]
        );
        
      }
    },
  });

  if (result) {
    console.log("startService result2: ", result);
  }
}

function stopBGService(vm) {
  console.log(`=== stop service: ${serviceFile} ===`);
  appService.stop({
    url: serviceFile,
    param: `service=${serviceFile}&action=stop`,
    complete_func: (info) => {
      console.log(`stopService result: ` + JSON.stringify(info));
     // hmUI.showToast({ text: `stop result: ${info.result}` });
      // refresh for button status

      if (info.result) {
        vm.state.running = false;
        setProperty(
          vm.state.BG_Label,
          hmUI.prop.TEXT,
          txtResource.BG_STATUS[vm.state.running]
        );
        
        };
      
    },
  });
}



Page({
  
    state: {
      running: false,
      BG_Label: null,
      APP_Label: null,
      sgvLabel: null,
      sgv_now: null,
      dateLabel: null,
      
      deltaLabel: null,
      timeSensor:null,
      SVG_TREND_IMG:null,
      staleLabel:null,
      unitsLabel
    },
    globalData: {
    svg_value: "No Data",
    svg_date: 0,
    svg_direction: null,
    svg_delta: "No Data",
    svg_units: "No Data",
    svg_stale: true,
    svg_appStatus: false


    },

    getDatafromBG(){
      // isAppSideRunning()
      try {
        vm.globalData.svg_value = localStorage.getItem('SGV_NOW').toString()
        } catch (error) {
          vm.globalData.svg_value = 'No Data'
        }
        try {
          vm.globalData.svg_appStatus = localStorage.getItem('SIDE_SERVICE_STATUS')
          } catch (error) {
            console.log(error)
            vm.globalData.svg_appStatus = false
        }
        try {
          vm.globalData.svg_delta = `Delta: ${localStorage.getItem('SGV_DELTA').toString()}`
        } catch (error) {
          vm.globalData.svg_delta = 'Delta: No Data'
        }
        try {
          vm.globalData.svg_direction = this.getArrowResource(localStorage.getItem('SGV_DIRECTION').toString());
        } catch (error) {
          vm.globalData.svg_direction = this.getArrowResource('None');
        }
        try {
          vm.globalData.svg_units = localStorage.getItem('UNIT_HINT').toString();
        } catch (error) {
          vm.globalData.svg_units = 'No Data'
        }
        try {
          vm.globalData.svg_date = `Time: ${this.getTimeAgo(localStorage.getItem('SGV_DATE'))}`
        } catch (error) {
          vm.globalData.svg_date = 'Time: No Data'
        }
        try {
          vm.globalData.svg_stale=localStorage.getItem('SGV_isStale')
         
        } catch (error) {
          console.log("Achtung dies ist ein Fehler: " + error)
          vm.globalData.svg_stale=true
        }


    },

    build() {
      //localStorage = new LocalStorage();
      vm = this;
     

      let services = appService.getAllAppServices();
      this.state.running = services.includes(serviceFile);
  
      console.log("service status %s", this.state.running);
      if (!this.state.running)permissionRequest(vm);

      this.getDatafromBG();
     
      vm.state.BG_Label = hmUI.createWidget(hmUI.widget.TEXT, {
        ...BG_SERVICE_LABEL,
        text: txtResource.BG_STATUS[this.state.running],
      });
  
      vm.state.APP_Label = hmUI.createWidget(hmUI.widget.TEXT, {
        ...APP_SERVICE_LABEL,
        text: txtResource.APP_STATUS[vm.globalData.svg_appStatus],

      });
      vm.state.SVG_TREND_IMG = hmUI.createWidget(hmUI.widget.IMG, {
        ...SGV_TREND_IMAGE, src: vm.globalData.svg_direction,       
      });
      vm.state.SVG_TREND_IMG.addEventListener(ui.event.CLICK_UP, function (info) {
        emitCustomSystemEvent('event.customize.fetchsgvdata');
        console.log("Test")
      })
      
           
        vm.state.sgvLabel = hmUI.createWidget(hmUI.widget.TEXT, {
          ...SGV_TEXT,
          text: vm.globalData.svg_value
        });
        vm.state.unitsLabel = hmUI.createWidget(hmUI.widget.TEXT, {
          ...UNITS_TEXT,
          text: vm.globalData.svg_units
        });
        vm.state.dateLabel = hmUI.createWidget(hmUI.widget.TEXT, {
          ...DATE_TEXT,
          text: vm.globalData.svg_date
        });
        vm.state.deltaLabel = hmUI.createWidget(hmUI.widget.TEXT, {
          ...DELTA_TEXT,
          text: vm.globalData.svg_delta
        });
       vm.state.staleLabel = hmUI.createWidget(hmUI.widget.FILL_RECT, {
         ...BG_STALE_RECT
         
       });
      setProperty(vm.state.staleLabel, hmUI.prop.VISIBLE,  vm.globalData.svg_stale)

       console.log("stale visible = " + vm.globalData.svg_stale)
      
    },
    onInit() {
      console.log('page onInit invoked')
      //this.notifyMobile();
      this.state.timeSensor= new Time();
      
    },
    onPause() {
      console.log("page on pause invoke");
      //sgvLabel.setProperty(hmUI.prop.TEXT,localStorage.getItem('SGV_NOW')); 
    },
    getTimeAgo(time) {
      let timeDiff
      if (time == null) {
        timeDiff = 0;
    } else {
        timeDiff = vm.state.timeSensor.getTime() - time;
    }

      if (time == null || 0) return "";
      let timeInt = parseInt(time);
      console.log('last valid value recieved: '+niceTime(vm.state.timeSensor.getTime() - timeInt))
      
      return niceTime(vm.state.timeSensor.getTime() - timeInt)// - timeDiff);
    },
    getArrowResource(trend) {
    let fileName = trend;
    if (fileName === undefined || fileName === "") {
        fileName = "None";
    }
    return `${fileName}.png`;
    },
    
  onHide(){
    
  },

  updateWidgets(){
      this.getDatafromBG() 
      vm.state.SVG_TREND_IMG.setProperty(hmUI.prop.MORE,{src: vm.globalData.svg_direction});
      setProperty(vm.state.sgvLabel,hmUI.prop.TEXT, vm.globalData.svg_value);
      setProperty(vm.state.APP_Label,hmUI.prop.TEXT,txtResource.APP_STATUS[vm.globalData.svg_appStatus]);
      setProperty(vm.state.BG_Label,hmUI.prop.TEXT,txtResource.BG_STATUS[vm.state.running]);
      setProperty(vm.state.dateLabel,hmUI.prop.TEXT, vm.globalData.svg_date);
      setProperty(vm.state.deltaLabel,hmUI.prop.TEXT,vm.globalData.svg_delta);
      setProperty(vm.state.unitsLabel,hmUI.prop.TEXT, vm.globalData.svg_units);
      setProperty(vm.state.staleLabel,hmUI.prop.VISIBLE, vm.globalData.svg_stale);
      console.log("Stale is: "+vm.globalData.svg_stale)

  },
    onReady() {
      //this.updateWidgets()
      vm.state.timeSensor.onPerMinute(() => {
       
       this.updateWidgets()     
      })
      
      //replace({ url: `${thisFile}` });
      //setProperty(vm.state.sgvLabel,hmUI.prop.TEXT,localStorage.getItem('SGV_NOW'));
    },
    onResume() {
      
    },
    onDestroy() {
      console.log("xDrip-Page :page onDestroy invoked");
    },
    
    
  })

