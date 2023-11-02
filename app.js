import { BaseApp } from '@zeppos/zml/base-app'
import { log as Logger } from '@zos/utils'
import { MessageBuilder } from './shared/message'
import * as ble from '@zos/ble'
import { LocalStorage } from '@zos/storage'
import './shared/device-polyfill'
const logger = Logger.getLogger('xDrip')
//const defaultValue = localStorage.getItem('none_key', 'Not Data, yet')
const appId = 0x000F4E0B

App(
  BaseApp({
    globalData: {
      messageBuilder: null,
      localStorage:null
    },

      
    onCreate(options) {
      console.log('App: App onCreate invoked')
      
      const messageBuilder = new MessageBuilder({ appId, appDevicePort: 20, appSidePort: 0, ble })
      const localStorage = new LocalStorage();
      this.globalData.localStorage=localStorage;
      this.globalData.messageBuilder = messageBuilder;
      messageBuilder.connect();
    },
    onDestroy() {
      console.log('App.js: App onDestroy invoked')
      
   this.globalData.messageBuilder && this.globalData.messageBuilder.disConnect()
    },
  }),
)
