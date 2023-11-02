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
    console.log(`xDrip BG-Service onEvent(${e})`);
    let result = parseQuery(e);
    if (result.action === "exit") {
      this.StopPhoneService();
     // this.globalData.messageBuilder && this.globalData.messageBuilder.disConnect()
      appServiceMgr.exit();
    }else {this.StartPhoneService();}
  },
  onInit(e) {
    
    console.log("BG-Service On Innit invoked")
    console.log("xDrip BG-service",`service onInit(${e})`);
    this.StartPhoneService();
    //this.notifyMobile();
    this.onMessage();
    timeSensor.onPerMinute(() => {
      //eventBus.emit('SGV_DATA_UPDATE', 'Hello Zepp OS!')
      if ((timeSensor.getTime()-localStorage.getItem('SGV_DATE'))>1000*60*10){
      console.log(`${'BG-Service: App-Side WakeUp'} time report: ${timeSensor.getHours()}:${timeSensor.getMinutes()}:${timeSensor.getSeconds()}`);
      messageBuilder.connect();
      this.StartPhoneService();
      localStorage.setItem('SIDE_SERVICE_STATUS',false);
    }
      
    })
  },

  StartPhoneService() {
    console.log("Try to start Side Service: ");
    messageBuilder.request({
      method: "START_PHONE_SERVICE",
    })
      .then((data) => {
        console.log("Starting Service");
        const { result = {} } = data;
        const { text } = result;
        console.log("Starting Service Result: ", text);
            
      })
      .catch((res) => {console.log("Starting Service Result: ", res);});
  },
  StopPhoneService() {
    console.log("Try to stop Side Service: ");
    messageBuilder.request({
      method: "STOP_PHONE_SERVICE",
    })
      .then((data) => {
        const { result = {} } = data;
        const { text } = result;
        console.log("Stopping Service Result: ", text);
      })
      .catch((res) => {});
  },
  onMessage() {
    console.log("xDrip BG-service OnMessage invoked");
    messageBuilder.on('call', ({ payload: buf }) => {
      const data = messageBuilder.buf2Json(buf)
        if (data.method === 'SGV_DATA'){
        
        //showToast({
        //  content: 'Actual Glucose Value: ' + data.params,
       // })
        let sgvJson = typeof data.params === 'string' ? JSON.parse(data.params) : data.params
        
        try {
         
            localStorage.setItem('SGV', sgvJson)
            localStorage.setItem('SGV_NOW', sgvJson['sgv'])
            localStorage.setItem('SGV_DELTA', sgvJson['delta'])
            localStorage.setItem('SGV_DATE', sgvJson['date'])
            localStorage.setItem('SGV_DIRECTION', sgvJson['direction'])
            localStorage.setItem('SIDE_SERVICE_STATUS', true)
            console.log('BG-Service: Actual Glucose Value: ', sgvJson['sgv'])
            console.log("Saved Glucose: " + localStorage.getItem('SGV_NOW'))
            //eventBus.emit('SGV_DATA_UPDATE', 'Hello Zepp OS!')
          
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
