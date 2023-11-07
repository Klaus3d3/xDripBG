import hmUI from "@zos/ui";
import { px } from "@zos/utils";
import { DEVICE_WIDTH } from "../libs/utils";
import { createWidget, widget, align, prop, text_style, event, font, src , visible} from '@zos/ui'



export const SERVICE_TEXT = {
  x: px(40),
  y: px(30),
  w: DEVICE_WIDTH - px(40) * 2,
 // h: px(80),
  text_size: px(28),
  align_h: hmUI.align.CENTER_H,
  color: 0xffffff,
};

export const DATE_TEXT = {
  x: px(200),
  y: px(150),
  w: px(460),
 // h: px(50),
  text_style: text_style.NONE,
  text_size: px(32),
  align_h: hmUI.align.LEFT,
  color: 0xffffff,
  //font: 'fonts/DS-DIGI.ttf'
};
export const DELTA_TEXT = {
  x: px(200),
  y: px(300),
  w: px(460),
 // h: px(50),
  text_style: text_style.NONE,
  text_size: px(32),
  align_h: hmUI.align.LEFT,
  color: 0xffffff,
  //font: 'fonts/DS-DIGI.ttf'
};

export const SGV_TEXT = {
  x: px(80),
  y: px(190),
  w: px(200),
  //h: px(250),
  text_style: text_style.NONE,
  text_size: px(60),
  align_h: hmUI.align.RIGHT,
  color: 0xffffff,
  //font: 'fonts/DS-DIGI.ttf'
};
export const UNITS_TEXT = {
  x: px(285),
  y: px(210),
  w: px(195),
  //h: px(250),
  text_style: text_style.NONE,
  text_size: px(40),
  align_h: hmUI.align.LEFT,
  color: 0xffffff,
  //font: 'fonts/DS-DIGI.ttf'
};
export const BG_STALE_RECT = {
  x: px(80),
  y: px(235),
  w: 200,
  h: px(5),
  color: 0xffffff,
};

export const BG_SERVICE_LABEL = {
  x: px(40),
  y: px(20),
  w: DEVICE_WIDTH - px(40) * 2,
 // h: px(120),
  text_size: px(28),
  align_h: hmUI.align.CENTER_H,
  color: 0xffffff,
};
export const APP_SERVICE_LABEL = {
  x: px(40),
  y: px(50),
  w: DEVICE_WIDTH - px(40) * 2,
 // h: px(120),
  text_size: px(28),
  align_h: hmUI.align.CENTER_H,
  color: 0xffffff,
};
export const SERVICE_BTN = {
  x: px(100),
  y: px(280),
  w: DEVICE_WIDTH - px(100) * 2,
  h: px(80),
  radius: 8,
  press_color: 0x1976d2,
  normal_color: 0xef5350,
};

export const SGV_TREND_IMAGE = {
  src: 'None.png',
  x: px(30),
  y: px(210),
  w: px(70),
  h: px(70),
};


