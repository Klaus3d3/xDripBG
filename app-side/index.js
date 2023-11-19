import { BaseSideService } from "@zeppos/zml/base-side";
import { settingsLib } from '@zeppos/zml/base-side'
import { MessageBuilder } from '../shared/message-side'

const messageBuilder = new MessageBuilder()

const logger = Logger.getLogger('xDrip-app-side')



let  sgv_now, ctx, MyTimerID






async function FetchDataFromWebService(ctx) {
  const result = await this.fetch({
    method: "get",
    //url: "http://localhost:29863/info.json",
    url: "http://localhost:17580/sgv.json",
  }).catch((e) => {
    logger.log("fetch=>", e);
    return "Webservice not running. Please Check!"
    
  });
 

  if (result.ok) {
    
    const fetchedJson = typeof result.body === 'string' ? JSON.parse(result.body) : result.body
    ctx.globalData.sgv = JSON.stringify(fetchedJson[0]);
   
  }
  
  



};
function getSGVDataFromWeb(a,ctx){
  logger.log(a);
  //logger.log(b);
  FetchDataFromWebService(ctx);
  
  let sgvJson = typeof ctx.globalData.sgv === 'string' ? JSON.parse(ctx.globalData.sgv) : ctx.globalData.sgv
  logger.log('App-Side got last SGV Value from Webservice @: ' + sgvJson['date'])

 
  settingsLib.setItem('LastSGV-Data', sgvJson['date'])
  logger.log('New Values recieved, sending to watch: ' + ctx.globalData.sgv)
  if (ctx.globalData.sgv != null) return ctx.globalData.sgv;
   
};





function myCallback(a,ctx){
  FetchDataFromWebService(ctx);

}


AppSideService(
  BaseSideService({
    globalData:{
      sgv_value:null,
      sgv_delta:null,
      sgv_direction:null,
      sgv_units:null,
      sgv_date:null,
      sgv_iob:null,

      sgv:null,
      test:"StartService",
      
  },
    
    onInit() {
     



      logger.log("App-Side-Service Init");
      ctx=this;
      //Startservice(this.gobalData.test);
      try {
      if (!settingsLib.getItem('LastSGV-Data'))settingsLib.setItem('LastSGV-Data','no data')
    } catch (error) {
      logger.log(error);
    }
    
    //notifyDevice(this, "App-Side-Service Init");
    
    try {
      if (MyTimerID)clearInterval(MyTimerID)
    } catch (error) {
      logger.log(error)
    }
    //MyTimerID=setInterval(myCallback, 1000*10, "MyTimerID: Callback updating data from webservice",ctx);
    
    
    


 
    
    },
    onRequest(req, res) {
      logger.log("Service Request");
      logger.log("=====>,", req.method);
      if (req.method === "START_PHONE_SERVICE") {
        if(MyTimerID) clearInterval(this.gobalData.MyTimerID);//Startservice(res);
        MyTimerID=setInterval(myCallback, 1000*10, "MyTimerID: Callback updating data from webservice",ctx);
      }
      if (req.method === "STOP_PHONE_SERVICE") {
        Stopservice(res);
        
      }
      if (req.method === "ARE_YOU_THERE?") {
        logger.log("Got AreYouThere Question from Watch")
        res(null, {
          result: true,
        });
        
      }
      if (req.method === "SEND_SGV_DATA") {
        logger.log("Got SEND_SGV_DATA Question from Watch")
        res(null, {
          SGV_DATA: ctx.globalData.sgv, //getSGVDataFromWeb("FetchDataFromWeb",ctx),
          
        });
      
      }

    

    },

    onRun() {
      logger.log("App-Side Service Run");
      //Startservice('starting timer')
      //MyTimerID=setInterval(myCallback, 1000*10, "MyTimerID: Callback updating data from webservice",ctx);
      //notifyDevice(ctx,"Test")//getSGVDataFromWeb("FetchDataFromWeb",ctx))
      
      if (MyTimerID) clearInterval(MyTimerID)
      MyTimerID=setInterval(myCallback, 1000*10, "MyTimerID: Callback updating data from webservice",ctx);

      
    },
    
    

    onDestroy() {
      logger.log("Service Destroy");
      //this.onRun()//clearInterval(this.gobalData.MyTimerID);
      return
    },
  })
);
