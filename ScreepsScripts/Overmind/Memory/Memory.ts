import { DEFAULT_OPERATION_MODE,PROFILER_COLONY_LIMIT, USE_PROFILER } from "../~Settings";
import { IsIVM } from "../Utilities/Utils";
import { log } from "../Console/Log";
import { Profile } from "../Profiler/Decorator";
import { Stats } from "../Stats/Stats";

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
            log.Warning(`错误:${Memory.settings.operationMode} 不是有效的操作方式` + 
                        `默认为${DEFAULT_OPERATION_MODE}，可以使用 SetMode() 方法改变模式。`);
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
@Profile
export class Mem {
    static ShouldRun(): boolean {
        let shouldRun: boolean = true;
        if(!IsIVM()) {
            log.Warning(`Overmind 运行需要 isolated-VM。在 screeps.com/a/#!/account/runtime 中改变配置`);
            shouldRun = false;
        }
        if(USE_PROFILER && Game.time % 10 == 0) {
            log.Warning(`配置当前已被启用。只有 ${PROFILER_COLONY_LIMIT} 殖民地可以运行。`);
        }
        if(Game.cpu.bucket < 500) {
            if(_.keys(Game.spawns).length > 1 && !Memory.resetBucket && !Memory.haltTick) {
                // 不要在开始或者 CPU 重置程序已被启用时运行 CPU 重置程序
                log.Warning(`CPU 内存非常低(${Game.cpu.bucket})。启动 CPU 重置程序。`);
                Memory.resetBucket = true;
                Memory.haltTick = Game.time + 1; // 在下一个时钟事件重置全局
            } else {
                log.Info(`CPU 内存非常低（${Game.cpu.bucket}）。延迟操作，直到 CPU 内存到达 500`);
            }
            shouldRun = false;
        }
        if(Memory.resetBucket) {
            if(Game.cpu.bucket < (MAX_BUCKET - Game.cpu.limit)) {
                log.Info(`在内存被重置前延迟操作。内存：${Game.cpu.bucket}/${MAX_BUCKET}`);
                shouldRun = false;
            } else {
                delete Memory.resetBucket;
            }
        }
        if(Memory.haltTick) {
            if(Memory.haltTick == Game.time) {
                (<any>Game.cpu).halt(); // 当 Typed-screeps 更新包括此方法时，删除所有输入
                shouldRun = false;
            } else if(Memory.haltTick < Game.time) {
                delete Memory.haltTick;
            }
        }
        return shouldRun;
    }

    /*
    * 尝试从上个时钟时间加载转化后的内存，以避免转化消耗
    */
    static Load() {
        if(lastTime && lastMemory && Game.time == lastTime + 1) {
            delete global.Memory;
            global.Memory = lastMemory;
            RawMemory._parsed = lastMemory;
        } else {
            Memory.rooms;
            lastMemory = RawMemory._parsed;
            Memory.stats.persistent.lastMemoryReset = Game.time;
        }
        lastTime = Game.time;
        if(!global.age) {
            global.age = 0;
        }
        global.age++;
        Memory.stats.persistent.globalAge = global.age;
    }

    // 垃圾收集
    static GarbageCollect(quick?: boolean) {
        if(global.gc) {
            const start = Game.cpu.getUsed();
            global.gc(quick);
            log.Debug(`运行${quick ? "quick" : "FULL"} 垃圾收集。` +
                      `运行时间：${Game.cpu.getUsed() - start}。`);
        } else {
            log.Debug(`手动垃圾收集在此服务器不可用。`);
        }
    }

    // 包装
    static Wrap(memory: any, memName: string, defaults = {}, deep = false) {
        if(!memory[memName]) {
            memory[memName] = _.clone(defaults);
        }
        if(deep) {
            _.defaultsDeep(memory[memName], defaults);
        } else {
            _.defaultsDeep(memory[memName], defaults);
        }
        return memory[memName];
    }

    // 设置深度
    private static _setDeep(object: any, keys: string[], value: any): void {
        const key = _.first(keys);
        keys = _.drop(keys);
        if(keys.length == 0) {
            object[key] = value;
            return;
        } else {
            if(!object[key]) {
                object[key] = {};
            }
            return Mem._setDeep(object[key], keys, value);
        }
    }

    /*
    * 从给定的以点分隔的对象递归设置键，将必要的属性添加到中间
    * 举例： Mem.SetDeep(Memory.colonies, 'E1S1.miningSites.siteID.stats.uptime', 0.5)
    */
    static SetDeep(object: any, keyString: string, value: any): void {
        const keys = keyString.split(".");
        return Mem._setDeep(object, keys, value);
    }

    // 格式化 Overmind 内存
    private static FormatOvermindMemory() {
        if(!Memory.Overmind) {
            Memory.Overmind = {};
        }
        if(!Memory.colonies) {
            Memory.colonies = {};
        }
    }

    // 格式化路径内存
    private static FormatPathingMemory() {
        if(!Memory.pathing) {
            Memory.pathing = {} as PathingMemory;
        }
        _.defaults(Memory.pathing, {
            paths:              {},
            distances:          {},
            weightedDistances:  {}
        });
    }

    // 格式化默认内存
    private static FormatDefaultMemory() {
        if(!Memory.rooms) {
            Memory.rooms = {};
        }
        if(!Memory.creeps) {
            Memory.creeps = {};
        }
        if(!Memory.flags) {
            Memory.flags = {};
        }
    }

    // 格式化
    static Format() {
        // 在必要时格式化内存，在每次 global 重置时执行一次
        this.FormatDefaultMemory();
        this.FormatOvermindMemory();
        this.FormatPathingMemory();
        // 闲置内存格式化
        if(!Memory.settings) {
            delete Memory.profiler;
        }
        if(!USE_PROFILER) {
            delete Memory.profiler;
        }
        _.defaults(Memory.settings, {
            operationMode   : DEFAULT_OPERATION_MODE,
            log             : {},
            enableVisuals   : true
        });
        if(!Memory.stats) {
            Memory.stats = {};
        }
        if(!Memory.stats.persistent) {
            Memory.stats.persistent = {};
        }
        if(!Memory.constructionSites) {
            Memory.constructionSites = {};
        }
        this.InitGlobalMemory();
    }

    // 初始化全局内存
    private static InitGlobalMemory() {
        global._cache = <IGlobalCache>{
            accessed        : {},
            expiration      : {},
            structures      : {},
            numbers         : {},
            lists           : {},
            constMatrices   : {},
            roomPositions   : {},
            things          : {}
        };
    }

    // 清理
    static Clean() {
        // 每个时钟时间清理不存在的对象的内存空间
        this.CleanHeap();
        this.CleanCreeps();
        this.CleanFlags();
        this.CleanColonies();
        this.CleanPathingMemory();
        this.CleanConstructionSites();
        Stats.Clean();
    }

    /*
    * 尝试清理全局堆中的一些内容，以避免 CPU 使用量提升
    */
   private static CleanHeap(): void {
       if(Game.time % HEAP_CLEAN_FREQUENCY == HEAP_CLEAN_FREQUENCY - 3) {
           if(Game.cpu.bucket < BUCKET_CPU_HALT) {
               (<any>Game.cpu).halt();
           } else if (Game.cpu.bucket < BUCKET_CLEAR_CACHE) {
               delete global._cache;
               this.InitGlobalMemory();
           }
       }
   }

   // 清理 Creeps
   private static CleanCreeps() {
       for(const name in Memory.creeps) {
           if(!Game.creeps[name]) {
               delete Memory.creeps[name];
               delete global[name];
           }
       }
   }

   // 清理目标
   private static CleanFlags() {
       // 清理不存在的目标内存
       for(const name in Memory.flags) {
           if(!Game.flags[name]) {
               delete Memory.flags[name];
               delete global[name];
           }
       }
   }

   // 清理殖民地
   private static CleanColonies() {
       for(const name in Memory.colonies) {
           const room = Game.rooms[name];
           if(!(room && room.my)) {
               if(!Memory.colonies[name].persistent) {
                   delete Memory.colonies[name];
                   delete global[name];
               }
           }
       }
   }

   // 清理建筑点
   private static CleanConstructionSites() {
       // 清理过时的建筑点
       if(Game.time % 10 == 0) {
           const CONSTRUCTION_SITE_TIMEOUT = 50000;
           // 将建筑点存入内存，并清理过期的建筑点
           for(const id in Game.constructionSites) {
               const site = Game.constructionSites[id];
               if(!Memory.constructionSites[id]) {
                   Memory.constructionSites[id] = Game.time;
               } else if(Game.time - Memory.constructionSites[id] > CONSTRUCTION_SITE_TIMEOUT) {
                   site.remove();
               }
               // 清理放置在已存在的建筑上的建筑点
               if(site && site.pos.isVisible && site.pos.lookForStructure(site.structureType)) {
                   site.remove();
               }
           }
           // 清理内存中过时的建筑点
           for(const id in Memory.constructionSites) {
               if(!Game.constructionSites[id]) {
                   delete Memory.constructionSites[id];
               }
           }
       }
   }

   // 清理路径内存
   private static CleanPathingMemory() {
       const CLEAN_FREQUENCY = 5;
       if(Game.time % CLEAN_FREQUENCY == 0) {
           const distanceCleanProbability = 0.001 * CLEAN_FREQUENCY;
           const weightedDistanceCleanProbability = 0.01 * CLEAN_FREQUENCY;

           // 随机清理一些缓存的路径长度
           for(const pos1Name in Memory.pathing.distances) {
               if(_.isEmpty(Memory.pathing.distances[pos1Name])) {
                   delete Memory.pathing.distances[pos1Name];
               } else {
                   for(const pos2Name in Memory.pathing.distances[pos1Name]) {
                       if(Math.random() < distanceCleanProbability) {
                           delete Memory.pathing.distances[pos1Name][pos2Name];
                       }
                   }
               }
           }
           // 随机清理一些权重距离
           for(const pos1Name in Memory.pathing.weightedDistances) {
               if(_.isEmpty(Memory.pathing.weightedDistances[pos1Name])) {
                   delete Memory.pathing.weightedDistances[pos1Name];
               } else {
                   for(const pos2Name in Memory.pathing.weightedDistances[pos1Name]) {
                       if(Math.random() < weightedDistanceCleanProbability) {
                           delete Memory.pathing.weightedDistances[pos1Name][pos2Name];
                       }
                   }
               }
           }
       }
   }
}