import * as hmUI from "@zos/ui";
import { px } from "@zos/utils";

import {
  DEFAULT_COLOR,
  DEFAULT_COLOR_TRANSPARENT,
} from "../utils/config/constants";
import { DEVICE_WIDTH } from "../utils/config/device";

export const FETCH_BUTTON = {
  x: (DEVICE_WIDTH - px(340)) / 2,
  y: px(280),
  w: px(340),
  h: px(100),
  text_size: px(36),
  radius: px(12),
  normal_color: DEFAULT_COLOR,
  press_color: DEFAULT_COLOR_TRANSPARENT,
  text: "Start Phone Service",
};
export const SERVICE_SWITCH = {
  x: 200,
  y: 300,
  w: 160,
  h: 94,
  select_bg: 'swON.png',
  un_select_bg: 'swOFF.png',
  slide_src: 'swsl.png',
  slide_select_x: 70,
  slide_un_select_x: 8,
  checked: false,
  
  text: "Phone Service",
};
export const FETCH_RESULT_TEXT = {
  x: px(50),
  y: px(100),
  w: DEVICE_WIDTH - 2 * px(50),
  h: px(160),
  color: 0xffffff,
  text_size: px(36),
  align_h: hmUI.align.CENTER_H,
  align_v: hmUI.align.CENTER_V,
  text_style: hmUI.text_style.WRAP,
};
