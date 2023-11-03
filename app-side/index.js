import { BaseSideService } from "@zeppos/zml/base-side";
import { settingsLib } from '@zeppos/zml/base-side'

const logger = Logger.getLogger('xDrip-app-side')

const padStart = (str, maxLength, fillStr = "0") => {
  return str.toString().padStart(maxLength, fillStr);
};

let  sgv_now, ctx, MyTimerID



const formatDate = (date = new Date()) => {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours();
  const mm = date.getMinutes();
  const s = date.getSeconds();

  return `${y}-${padStart(m, 2)}-${padStart(d, 2)} ${padStart(h, 2)}:${padStart(
    mm,
    2
  )}:${padStart(s, 2)}`;
};
// Simulating an asynchronous network request using Promise
async function StartS() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        body: {
          data: {
            text:  "awaiting data",
          },
        },
      });
    }, 100);
  });
};

async function StopS() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        body: {
          data: {
            text: "Phone Service stopped @ " + formatDate(),
          },
        },
      });
    }, 100);
  });
};



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
    ctx.gobalData.sgv = JSON.stringify(fetchedJson[0]);
   
  }
  
  



};
function myCallback(a,ctx){
  logger.log(a);
  //logger.log(b);
  FetchDataFromWebService(ctx);
  
  let sgvJson = typeof ctx.gobalData.sgv === 'string' ? JSON.parse(ctx.gobalData.sgv) : ctx.gobalData.sgv
  logger.log('App-Side got last SGV Value from Webservice @: ' + sgvJson['date'])

  if (sgvJson['date']!=settingsLib.getItem('LastSGV-Data'))
  {
  settingsLib.setItem('LastSGV-Data', sgvJson['date'])
  logger.log('New Values recieved, sending to watch: ' + ctx.gobalData.sgv)
  if (ctx.gobalData.sgv != null) notifyDevice(ctx, ctx.gobalData.sgv);
    }
  else  logger.log('Old Values Recieved: ' + ctx.gobalData.sgv)
};

async function Startservice(res) {
  logger.log('StartService executed')
  try {  
    // A network request is simulated here
    //myCallback('try Starting Service')
    const { body: { data = {} } = {} } = await StartS();

    res(null, {
      result: data,
    });
  } catch (error) {
    res(null, {
      result: "ERROR",
    });
  }
  //notifyDevice(ctx, 'Service started');
  if (MyTimerID) clearInterval(MyTimerID)
  MyTimerID=setInterval(myCallback, 1000*10, "MyTimerID: Callback updating data from webservice",ctx);
};

async function Stopservice(res) {
  try {  
    // A network request is simulated here
    const { body: { data = {} } = {} } = await StopS();

    res(null, {
      result: data,
    });
  } catch (error) {
    res(null, {
      result: "ERROR",
    });
  }
  clearInterval(MyTimerID); 
};

function notifyDevice(ctx, data_to_send) {
  
  logger.log('App-Side sending data: ',data_to_send)
// if (data_to_send != undefined)
 //{
  ctx.call({method: 'SGV_DATA', params: data_to_send})     
 //}
};
/*function getDataFromDevice(ctx, data_to_send) {
  logger.log("App-Side-Service: Sending Data to watch with Request")
  return ctx.request({
    method: 'SGV_DATA',
    params: {
      param1: 'SGV_DATA',
      param2: data_to_send
    }
  })
    .then((result) => {
      // receive your data
      if (result===data_to_send){logger.log("App-Side-Service: Watch successfully received data")}
      logger.log('result=>', result)
    })
    .catch((error) => {
      // receive your error
      console.error('error=>', error)
    })
}*/


AppSideService(
  BaseSideService({
    gobalData:{
      
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
    
    notifyDevice(this, "App-Side-Service Init");
    
    try {
      if (MyTimerID)clearInterval(MyTimerID)
    } catch (error) {
      logger.log(error)
    }
    //MyTimerID=setInterval(myCallback, 1000*10, "MyTimerID: Callback updating data from webservice",ctx);
    
    
    


  },
    onCall(data) {
       //no reply
      if (data.method === 'your.method3') {
        logger.log("WakeUp received");
       
      }
        // do something
       // clearInterval(MyTimerID);
        //MyTimerID=setInterval(myCallback, 1000*10, "MyTimerID: Callback updating data from webservice",ctx);
      //}
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

    

    },

    onRun() {
      logger.log("App-Side Service Run");
      //Startservice('starting timer')
      MyTimerID=setInterval(myCallback, 1000*10, "MyTimerID: Callback updating data from webservice",ctx);

    },
    
    

    onDestroy() {
      logger.log("Service Destroy");
      this.onRun()//clearInterval(this.gobalData.MyTimerID);
      return
    },
  })
);
