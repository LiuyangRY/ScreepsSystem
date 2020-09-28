import { DEFAULT_OPERATION_MODE } from "../~Settings";

// 自治模式
export enum Autonomy {
    Manual          = 0,    // 手动
    SemiAutomatic   = 1,    // 半自动
    Automaitic      =2      // 自动
}

// 获取自治等级
export function GetAutonomyLevel(): number {
    switch (Memory.settings.operationMode) {
        case "Manual":
            return Autonomy.Manual;
        case "SemiAutomatic":
            return Autonomy.SemiAutomatic;
        case "Automatic":
            return Autonomy.Automaitic;
        default:
            Log.warning(`错误:${Memory.settings.operationMode} 不是有效的操作方式`) + 
            `默认为${DEFAULT_OPERATION_MODE}，可以使用 SetMode() 方法改变模式。`;
            Memory.settings.operationMode = DEFAULT_OPERATION_MODE;
            return GetAutonomyLevel();
    }
}

let lastMemory: any;
let lastTime: number = 0;

const MAX_BUCKET = 10000;
const HEAP_CLEAN_FREQUENCY = 200;
const BUCKET_CLEAR_CACHE = 7000;
const BUCKET_CPU_HALT = 4000;

// 该模块包含一些低级内存的清理和缓存的方法