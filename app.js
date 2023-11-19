
import { log as Logger } from '@zos/utils'
//import { MessageBuilder } from './shared/message'
import * as ble from '@zos/ble'
import { LocalStorage } from '@zos/storage'
import './shared/device-polyfill'
const logger = Logger.getLogger('xDrip')

//const appId = 0x000F4E0B

App(
  {
    globalData: {
      messageBuilder: null,
     
    },

      
    onCreate(options) {
      console.log('App: App onCreate invoked')
      
     
    },
    onDestroy() {
      console.log('App.js: App onDestroy invoked')
   
    },
  })

