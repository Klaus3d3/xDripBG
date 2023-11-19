import hmUI from "@zos/ui";
import { BasePage } from "@zeppos/zml/base-page";
import * as appService from "@zos/app-service";
import { queryPermission, requestPermission } from "@zos/app";
import { readFileSync } from "@zos/fs";
const { messageBuilder } = getApp()._options.globalData
import { showToast } from '@zos/interaction'
import {niceTime} from "../shared/date"
import { Time } from "@zos/sensor";



let vm



import {
  SERVICE_TEXT,
  BG_SERVICE_LABEL,
  APP_SERVICE_LABEL,SGV_TREND_IMAGE,BG_STALE_RECT,UNITS_TEXT,ALARM_SWITCH,
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





const permissions = ["device:os.bg_service"];

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
      console.log(`BG-Service Start result: ` + JSON.stringify(info));
      //hmUI.showToast({ text: `start result: ${info.result}` });
      // refresh for button status

      if (info.result) {
        vm.state.running = true;
        
      }
    },
  });

  if (result) {
    console.log("startService result: ", result);
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
               
        };
      
    },
  });
}

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}


Page({
  
    state: {
      running: false,
      BG_Label: null,
      APP_Label: null,
      sgvLabel: null,
      sgv_now: null,
      dateLabel: null,
      alarm_switch:null,
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
      try {
        const contentBuffer = readFileSync({
          path: 'xdripsgv.txt'
        })
        
        str_result = ab2str(contentBuffer);
        if (str_result.length>0){
        
        const searchTerm = '}';
        const indexOflast = str_result.lastIndexOf(searchTerm);

        vm.globalData.sgv= JSON.parse(str_result.substring(0,indexOflast+1));
        console.log('Read Data from FS: =>', vm.globalData.sgv['sgv'].toString())
       }
               
      } catch (error) {
        console.log("xDripPage error while reading FS ", error )
      }

      try {
        vm.globalData.svg_value = vm.globalData.sgv['sgv'].toString()
        } catch (error) {
          vm.globalData.svg_value = 'No Data'
          console.log("Achtung dies ist ein Fehler: SGV " + error)
        }
        
        try {
          vm.globalData.svg_delta = `Delta: ${vm.globalData.sgv['delta'].toString()}`
        } catch (error) {
          vm.globalData.svg_delta = 'Delta: No Data'
          console.log("Achtung dies ist ein Fehler: DELTA" + error)
        }
        try {
          vm.globalData.svg_direction = this.getArrowResource(vm.globalData.sgv['direction']);
        } catch (error) {
          vm.globalData.svg_direction = this.getArrowResource('None');
          console.log("Achtung dies ist ein Fehler: DIRECTION" + error)
        }
        try {
          vm.globalData.svg_units = vm.globalData.sgv['units_hint'].toString();
        } catch (error) {
          vm.globalData.svg_units = 'No Data'
          console.log("Achtung dies ist ein Fehler: UNITS" + error)
        }
        try {
          
          vm.globalData.svg_date = `Time: ${this.getTimeAgo(vm.globalData.sgv['date'])}`
        } catch (error) {
          vm.globalData.svg_date = 'Time: No Data'
          console.log("Achtung dies ist ein Fehler: DATE" + error)
        }
        try {
          if ((vm.state.timeSensor.getTime()-vm.globalData.sgv['date'])<=1000*60*10) {
            vm.globalData.svg_stale = false}
          else {vm.globalData.svg_stale =true}
          
        } catch (error) {
          console.log("Achtung dies ist ein Fehler: " + error)
          vm.globalData.svg_stale=true
        }


    },

    initView(){

      let services = appService.getAllAppServices();
      this.state.running = services.includes(serviceFile);
      
      
     // if (!this.state.running)permissionRequest(vm);

      this.getDatafromBG();
     
      
      vm.state.SVG_TREND_IMG = hmUI.createWidget(hmUI.widget.IMG, {
        ...SGV_TREND_IMAGE, src: vm.globalData.svg_direction,       
      });
      
           
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
      
          vm.state.alarm_switch = hmUI.createWidget(hmUI.widget.SLIDE_SWITCH, {
            ...ALARM_SWITCH, checked: this.state.running,
           
            checked_change_func: (slideSwitch, checked) => {
             if (vm.state.alarm_switch.getProperty(hmUI.prop.CHECKED)===true){
              

              permissionRequest(vm)

            }else{
              
              stopBGService(vm)
             

            }
            
          }}
          
      
          
    )
      


      setProperty(vm.state.staleLabel, hmUI.prop.VISIBLE,  vm.globalData.svg_stale)

       console.log("stale visible = " + vm.globalData.svg_stale)

    },

    build() {
      
      vm = this;
      
      this.initView() 
      
      
      
      

      
    },
    onInit() {
      console.log('page onInit invoked')
      //this.notifyMobile();
      this.state.timeSensor= new Time();
      
      
    },
    onPause() {
      console.log("page on pause invoke");
      
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
      console.log("widgets updated")

  },
    onReady() {
      
      /*
      const option = {
        url: 'app-service/fetch_service',
        delay: 200,
        repeat_type: REPEAT_MINUTE,
        store:false
      }
      const id = set(option)
     console.log("Set AlarmID: => ",id)*/
      
    },
    onResume() {
      
    },
    onDestroy() {
      console.log("xDrip-Page :page onDestroy invoked");
    },
    
    
  })

