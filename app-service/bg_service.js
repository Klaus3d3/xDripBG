import { parseQuery } from "../libs/utils";

import * as appServiceMgr from "@zos/app-service";
import { showToast } from '@zos/interaction'
const { localStorage } = getApp()._options.globalData
import { Time } from "@zos/sensor";
import { readFileSync, writeFileSync } from '@zos/fs'
import {json2str, str2json} from "../shared/data";
import { MessageBuilder } from '../shared/message'
import { getPackageInfo } from "@zos/app";
import * as ble from "@zos/ble";
import { EventBus } from '@zos/utils'


const eventBus = new EventBus()
const { appId } = getPackageInfo();
const messageBuilder = new MessageBuilder({ appId, appDevicePort: 20, appSidePort: 0, ble })






const timeSensor = new Time();






AppService({
  

  
  onEvent(e) {
    console.log(`xDrip BG-service: onEvent(${e})`);
    let result = parseQuery(e);
    if (result.action === "exit") {
      this.StopPhoneService();
     // this.globalData.messageBuilder && this.globalData.messageBuilder.disConnect()
      appServiceMgr.exit();
    }else
     {
      console.log('BG-Service onEvent inVoked')
      this.StartPhoneService();}
  },
  onInit(e) {
    
   
    messageBuilder.connect();
    this.getSGVDataFromSide()
    console.log("xDrip BG-service:",`service onInit(${e})`);
    //this.StartPhoneService();
    //this.notifyMobile();
    //this.MakeMBListen();
    timeSensor.onPerMinute(() => {
      //eventBus.emit('SGV_DATA_UPDATE', 'Hello Zepp OS!')
     
      this.getSGVDataFromSide()
      if ((timeSensor.getTime()-localStorage.getItem('SGV_DATE'))>1000*60*10 ){
      console.log(`${'BxDrip BG-service: App-Side WakeUp'} time report: ${timeSensor.getHours()}:${timeSensor.getMinutes()}:${timeSensor.getSeconds()}`);
      localStorage.setItem('SGV_isStale',true)
      //messageBuilder.connect();
      //this.StartPhoneService();
      
      //localStorage.setItem('SIDE_SERVICE_STATUS',false);
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




  getSGVDataFromSide() {
   
    console.log("Trying to get Data from Side Service ");
    messageBuilder.request({
      method: "SEND_SGV_DATA",
    },{timeout: 5000})
    .then(({ result }) => {
                    
        
      
      
      let sgvJson = JSON.parse(result.SGV_DATA)
      console.log("here is the result of the fetch " + sgvJson['sgv'])
        try {

          eventBus.emit('SGV_DATA', sgvJson['sgv'])
            localStorage.setItem('SGV', sgvJson)
            localStorage.setItem('SGV_NOW', sgvJson['sgv'])
            localStorage.setItem('SGV_DELTA', sgvJson['delta'])
            localStorage.setItem('SGV_DATE', sgvJson['date'])
            localStorage.setItem('SGV_DIRECTION', sgvJson['direction'])
            localStorage.setItem('SIDE_SERVICE_STATUS', true)
            localStorage.setItem('UNIT_HINT', sgvJson['units_hint'])
            if ((timeSensor.getTime()-sgvJson['date'])<=1000*60*10) {localStorage.setItem('SGV_isStale',false)}
            else {localStorage.setItem('SGV_isStale',true)}
            
            console.log('xDrip BG-service: Received Glucose Value: ', sgvJson['sgv'])
            console.log(" xDrip BG-service:Saved Glucose: " + localStorage.getItem('SGV_NOW'))
            
            writeFileSync({
              path: 'xDrip_SGV.txt',
              data: sgvJson,
              options: {
                encoding: 'utf8',
              },
            })
            //messageBuilder.disConnect()
          
        } catch (error) {
          console.log('BG-Service: Glucose ERROR: ', error)
          
        } 


      })
      .catch((res) => {}
      );
      
      
  },





  MakeMBListen() {
    
    messageBuilder.on('call', ({ payload: buf }) => {
      console.log("xDrip BG-service: got a call with data from phone");
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
            if ((timeSensor.getTime()-sgvJson['date'])<=1000*60*10) {localStorage.setItem('SGV_isStale',false)}
            else {localStorage.setItem('SGV_isStale',true)}
            
            console.log('xDrip BG-service: Received Glucose Value: ', sgvJson['sgv'])
            console.log(" xDrip BG-service:Saved Glucose: " + localStorage.getItem('SGV_NOW'))
            writeFileSync({
              path: 'xDrip_SGV.txt',
              data: sgvJson,
              options: {
                encoding: 'utf8',
              },
            })
          
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
   messageBuilder.disConnect();
    console.log("xDrip BG-service destroyed");
    
  },
  onCreate(){
    
  console.log("xDrip BG-Service Oncreate invoked");
 },
 
});
