import hmUI from "@zos/ui";
import { readFileSync } from "@zos/fs";
import {niceTime} from "../shared/date"
import { Time } from "@zos/sensor";
import * as alrmMgr from '@zos/alarm'
let vm

import {
  SERVICE_TEXT,
  BG_SERVICE_LABEL,
  APP_SERVICE_LABEL,SGV_TREND_IMAGE,BG_STALE_RECT,UNITS_TEXT,ALARM_SWITCH,
  SGV_TEXT,DATE_TEXT,DELTA_TEXT
} from "zosLoader:./style.[pf].layout.js";




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




function setProperty(w, p, v) {
  w.setProperty(p, v);
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

     
      const alarmID = alrmMgr.getAllAlarms()
      if (alarmID.length>0) {this.state.running=true} else {this.state.running=false}

    

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
              
              const option = {
                url: 'app-service/bg_service',
                delay: 100,
                store: false,
                repeat_type: alrmMgr.REPEAT_MINUTE,
              }
              const id = alrmMgr.set(option)
              console.log('Alarm set until next restart')
              //permissionRequest(vm)

            }else{
              
              //stopBGService(vm)
             const alarmID = alrmMgr.getAllAlarms()
             alarmID.forEach((id) => alrmMgr.cancel(id));
             console.log('Alarm removed')
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
      setProperty(vm.state.dateLabel,hmUI.prop.TEXT, vm.globalData.svg_date);
      setProperty(vm.state.deltaLabel,hmUI.prop.TEXT,vm.globalData.svg_delta);
      setProperty(vm.state.unitsLabel,hmUI.prop.TEXT, vm.globalData.svg_units);
      setProperty(vm.state.staleLabel,hmUI.prop.VISIBLE, vm.globalData.svg_stale);
      console.log("widgets updated")

  },
    onReady() {
      
    
      this.updateWidgets();
      
    },
    onResume() {
      
    },
    onDestroy() {
      console.log("xDrip-Page :page onDestroy invoked");
    },
    
    
  })

