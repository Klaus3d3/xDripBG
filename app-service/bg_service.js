import { parseQuery } from "../libs/utils";

import * as appServiceMgr from "@zos/app-service";
import { showToast } from '@zos/interaction'
const { localStorage } = getApp()._options.globalData
import { Time } from "@zos/sensor";
//import { EventBus } from '@zos/utils'
//const eventBus = new EventBus()








const timeSensor = new Time();

const { messageBuilder } = getApp()._options.globalData
//const defaultValue = localStorage.getItem('none_key', 'Not Data, yet')



AppService({
  
  
  onEvent(e) {
    console.log(`xDrip BG-service: onEvent(${e})`);
    let result = parseQuery(e);
    if (result.action === "exit") {
      this.StopPhoneService();
     // this.globalData.messageBuilder && this.globalData.messageBuilder.disConnect()
      appServiceMgr.exit();
    }else {this.StartPhoneService();}
  },
  onInit(e) {
    
    
    console.log("xDrip BG-service:",`service onInit(${e})`);
    this.StartPhoneService();
    //this.notifyMobile();
    this.MakeMBListen();
    timeSensor.onPerMinute(() => {
      //eventBus.emit('SGV_DATA_UPDATE', 'Hello Zepp OS!')
      if ((timeSensor.getTime()-localStorage.getItem('SGV_DATE'))>1000*60*10){
      console.log(`${'BxDrip BG-service: App-Side WakeUp'} time report: ${timeSensor.getHours()}:${timeSensor.getMinutes()}:${timeSensor.getSeconds()}`);
      messageBuilder.connect();
      this.StartPhoneService();
      localStorage.setItem('SIDE_SERVICE_STATUS',false);
    }
      
    })
  },

  StartPhoneService() {
    console.log("xDrip BG-service: Try to start Side Service: ");
    messageBuilder.request({
      method: "START_PHONE_SERVICE",
    })
      .then((data) => {
        console.log("xDrip BG-service: Starting Service");
        const { result = {} } = data;
        const { text } = result;
        console.log("xDrip BG-service: Starting Service Result: ", text);
            
      })
      .catch((res) => {console.log("xDrip BG-service: Starting Service Result: ", res);});
  },
  StopPhoneService() {
    console.log("Try to stop Side Service: ");
    messageBuilder.request({
      method: "STOP_PHONE_SERVICE",
    })
      .then((data) => {
        const { result = {} } = data;
        const { text } = result;
        console.log("xDrip BG-service: Stopping Service Result: ", text);
      })
      .catch((res) => {});
  },
  MakeMBListen() {
    
    messageBuilder.on('call', ({ payload: buf }) => {
      console.log("xDrip BG-service: MakeMBListen invoked");
      const data = messageBuilder.buf2Json(buf)
        if (data.method === 'SGV_DATA'){
        
        
        let sgvJson = typeof data.params === 'string' ? JSON.parse(data.params) : data.params
        
        try {
         
            localStorage.setItem('SGV', sgvJson)
            localStorage.setItem('SGV_NOW', sgvJson['sgv'])
            localStorage.setItem('SGV_DELTA', sgvJson['delta'])
            localStorage.setItem('SGV_DATE', sgvJson['date'])
            localStorage.setItem('SGV_DIRECTION', sgvJson['direction'])
            localStorage.setItem('SIDE_SERVICE_STATUS', true)
            localStorage.setItem('UNIT_HINT', sgvJson['units_hint'])
            
            console.log('xDrip BG-service: Actual Glucose Value: ', sgvJson['sgv'])
            console.log(" xDrip BG-service:Saved Glucose: " + localStorage.getItem('SGV_NOW'))
           
          
        } catch (error) {
          console.log('BG-Service: Glucose ERROR: ', error)
        }
        
        
        
      
      }
    })

    
  },
 
  notifyMobile() {
    messageBuilder.call({
      method: 'your.method3',
      params: {
        param1: 'param1',
        param2: 'param2',
      },
    })
  },
  onDestroy() {
   //this.StopPhoneService()
    
    console.log("xDrip BG-service destroyed");
    
  },
  onCreate(){
  this.StartPhoneService()
  //addListener(this.reconnect())
  console.log("xDrip BG-Service Oncreate invoked");
 },
  //reconnect(){
  //  messageBuilder.connect();
  //}
});
