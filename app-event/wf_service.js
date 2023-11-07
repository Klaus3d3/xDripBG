import { log } from "@zos/utils";

import * as appServiceMgr from "@zos/app-service";
import { parseQuery } from "../libs/utils";

const moduleName = "app-event-1";

function handleEvent(e) {
  if (e.event === undefined) {
    return;
  }

 

  appServiceMgr.exit();
}

AppService({
  onEvent(e) {
    log.log(`${moduleName} onEvent(${e})`);
    const result = parseQuery(e);
    handleEvent(result);
  },
  onInit(e) {
    const result = parseQuery(e);
    handleEvent(result);
     log.log("xDripApp_Event: Got an event")
  },
  onDestroy() {
    log.log("app-event on destroy invoke");
  },
});
