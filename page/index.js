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



const localStorage = new LocalStorage();
let vm

//const defaultValue = localStorage.getItem('none_key', 'Not Data, yet')

import {
  SERVICE_TEXT,
  BG_SERVICE_LABEL,
  APP_SERVICE_LABEL,SGV_TREND_IMAGE,BG_STALE_RECT,UNITS_TEXT,
  SGV_TEXT,DATE_TEXT,DELTA_TEXT,DIRECTION_TEXT
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
          startBGService(vm);
        }
      },
    });
  } else if (result2 === 2) {
    startBGService(vm);
  }
}
function startBGService(vm) {
  console.log(`=== start service: ${serviceFile} ===`);
  const result = appService.start({
    url: serviceFile,
    param: `service=${serviceFile}&action=start`,
    complete_func: (info) => {
      console.log(`startService result1: ` + JSON.stringify(info));
      hmUI.showToast({ text: `start result: ${info.result}` });
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
      hmUI.showToast({ text: `stop result: ${info.result}` });
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
      //directionLabel: null,
      deltaLabel: null,
      timeSensor:null,
      SVG_TREND_IMG:null,
      staleLabel:null,
      unitsLabel
    },
    build() {
      //localStorage = new LocalStorage();
      vm = this;
     

      let services = appService.getAllAppServices();
      this.state.running = services.includes(serviceFile);
  
      console.log("service status %s", this.state.running);
      if (!this.state.running)permissionRequest(vm);


      // Show tips
     
      vm.state.BG_Label = hmUI.createWidget(hmUI.widget.TEXT, {
        ...BG_SERVICE_LABEL,
        text: txtResource.BG_STATUS[this.state.running],
      });
  
      vm.state.APP_Label = hmUI.createWidget(hmUI.widget.TEXT, {
        ...APP_SERVICE_LABEL,
        text: txtResource.APP_STATUS[false],
      });
      vm.state.SVG_TREND_IMG = hmUI.createWidget(hmUI.widget.IMG, {
        ...SGV_TREND_IMAGE        
      });
      
     
        vm.state.sgvLabel = hmUI.createWidget(hmUI.widget.TEXT, {
          ...SGV_TEXT,
          text: "Waiting for Data"
        });
        vm.state.unitsLabel = hmUI.createWidget(hmUI.widget.TEXT, {
          ...UNITS_TEXT,
          text: "Waiting for Data"
        });
        vm.state.dateLabel = hmUI.createWidget(hmUI.widget.TEXT, {
          ...DATE_TEXT,
          text: "Waiting for Data"
        });
        vm.state.deltaLabel = hmUI.createWidget(hmUI.widget.TEXT, {
          ...DELTA_TEXT,
          text: "Waiting for Data"
        });
       vm.state.staleLabel = hmUI.createWidget(hmUI.widget.FILL_RECT, BG_STALE_RECT);
        /*vm.state.directionLabel = hmUI.createWidget(hmUI.widget.TEXT, {
          ...DIRECTION_TEXT,
          text: "Waiting for Data"
        });*/
      //setProperty(vm.state.sgvLabel,hmUI.prop.TEXT,localStorage.getItem('SGV_NOW'));
      //console.log("OnBuild Invoked, Saved last Value: " + Object.prototype.toString.call(localStorage.getItem('SGV_NOW')))
     
      /*eventBus.on('SGV_DATA_UPDATE', (data) => {
        this.onReady()
      })*/
      
      
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
      console.log(niceTime(vm.state.timeSensor.getTime() - timeInt - timeDiff))
      
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
    console.log("Page: Updating Widgets, Saved last Value: " +localStorage.getItem('SIDE_SERVICE_STATUS'))
    console.log(this.getArrowResource(localStorage.getItem('SGV_DIRECTION').toString()))
    vm.state.SVG_TREND_IMG.setProperty(hmUI.prop.MORE,{src: this.getArrowResource(localStorage.getItem('SGV_DIRECTION').toString())});

    setProperty(vm.state.sgvLabel,hmUI.prop.TEXT,` ${localStorage.getItem('SGV_NOW').toString()}`);
    setProperty(vm.state.APP_Label,hmUI.prop.TEXT,txtResource.APP_STATUS[localStorage.getItem('SIDE_SERVICE_STATUS')]);
    setProperty(vm.state.dateLabel,hmUI.prop.TEXT,`Time: ${this.getTimeAgo(localStorage.getItem('SGV_DATE'))}`);
    setProperty(vm.state.deltaLabel,hmUI.prop.TEXT,`Delta: ${localStorage.getItem('SGV_DELTA').toString()}`);
    setProperty(vm.state.unitsLabel,hmUI.prop.TEXT,` ${localStorage.getItem('UNIT_HINT').toString()}`);
    //setProperty(vm.state.directionLabel,hmUI.prop.TEXT,`Direction: ${localStorage.getItem('SGV_DIRECTION').toString()}`);
    setProperty(vm.state.staleLabel,hmUI.prop.VISIBLE,!localStorage.getItem('SIDE_SERVICE_STATUS'));
    console.log("Page got SGV_Data: @" + localStorage.getItem('SGV_DATE'))




  },
    onReady() {
      this.updateWidgets()
      vm.state.timeSensor.onPerMinute(() => {
        this.updateWidgets()     
      })
      
      //replace({ url: `${thisFile}` });
      //setProperty(vm.state.sgvLabel,hmUI.prop.TEXT,localStorage.getItem('SGV_NOW'));
    },
    onResume() {
      
    },/*
    RestartPhoneService() {
      this.request({
        method: "START_PHONE_SERVICE",
      })
        .then((data) => {
          console.log("Starting Service");
          const { result = {} } = data;
          const { text } = result;
          isstarted=true;
       })
        .catch((res) => {});
    },*/
    
    /*onMessage() {
      messageBuilder.on('call', ({ payload: buf }) => {
        const data = messageBuilder.buf2Json(buf)
        if (data.method === 'SGV_DATA') {
          console.log("Page got SGV_Data, to: ")
  
          showToast({
            content: 'Actual Glucose Value: ' + data.params,
          })
          
        setProperty(sgvLabel,hmUI.prop.TEXT,'NewValue');
        hmUI.redraw();
      }
      })
    },*/
    
    
    notifyMobile() {
      this.call({
        method: 'your.method3',
        params: {
          param1: 'param1',
          param2: 'param2',
        },
      })
    },

    StopPhoneService() {
      this.request({
        method: "STOP_PHONE_SERVICE",
      })
        .then((data) => {
          console.log("stopping service");
          const { result = {} } = data;
          const { text } = 'No Values Yet'; //result;
          
          isstarted=false;
        })
        .catch((res) => {});
    },
  })

