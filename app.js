//import { parseQuery } from "../libs/utils";
import * as appServiceMgr from "@zos/app-service";
import * as alrmMgr from '@zos/alarm'

import { Time } from "@zos/sensor";
import { writeFileSync } from '@zos/fs'

import { MessageBuilder } from './shared/message'
import { getPackageInfo } from "@zos/app";
import * as ble from "@zos/ble";

const { appId } = getPackageInfo();
const messageBuilder = new MessageBuilder({ appId, appDevicePort: 20, appSidePort: 0, ble })

App(
  {
    
    getSGVDataFromSide() {

 

      messageBuilder.connect()
      console.log("Trying to get Data from Side Service ");
      
      messageBuilder.request({method: "SEND_SGV_DATA", },{timeout: 5000})
      .then(({ result }) => {
        
        let sgvJson = JSON.parse(result.SGV_DATA)
        console.log("here is the result of the fetch " + sgvJson['sgv'])
          try {  
              console.log('xDrip BG-service: Received Glucose Value: ', sgvJson['sgv'])
             
              const buffer = this.str2ab(JSON.stringify(sgvJson));
             
              result = writeFileSync({
              path: 'xdripsgv.txt',
              data: buffer,
              })
              console.log('xDrip BG-service: saved: ', result.toString())
          } catch (error) {
            console.log('BG-Service: Glucose ERROR: ', error)
            
          } 
    
          messageBuilder.disConnect() 
        })
        .catch((res) => {}
        );
         
        
    },
    str2ab(str) {
      var buf = new ArrayBuffer(str.length); 
      var buf_view = new Uint8Array(buf);
      for (var i=0, strLen=str.length; i < strLen; i++) {
        buf_view[i] = str.charCodeAt(i);
      }
      return buf;
    },
      
    onCreate(options) {
      console.log('App: App onCreate invoked')
    this.getSGVDataFromSide()
     
    },
    onDestroy() {
      console.log('App.js: App onDestroy invoked')
   
    },
  })



