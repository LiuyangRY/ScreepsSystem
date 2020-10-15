import { Mem } from "../Memory/Memory";
import { Profile } from "../Profiler/Decorator";
import { ExponentialMovingAverage } from "../Utilities/Utils";

// 操作的统计数据，存储在 Memory.stats ，将在每个时钟时间更新
export const LOG_STATS_INTERVAL = 8;

@Profile
export class Stats {
    // 清理操作的统计数据
    static Clean() {
        if(Game.time % LOG_STATS_INTERVAL == 0) {
            const protectedKeys = [
                "persistent"
            ];
            for(const key in Memory.stats) {
                if(!protectedKeys.includes(key)) {
                    delete Memory.stats[key];
                }
            }
        }
    }

    // 记录操作
    static Log(key: string, value: number | { [key: string]: number } | undefined, truncateNumbers: boolean = true): void {
        if(Game.time % LOG_STATS_INTERVAL == 0) {
            if(truncateNumbers && value != undefined) {
                const decimals = 5;
                if(typeof value == "number") {
                    value = value.truncate(decimals);
                } else {
                    for(const i in value) {
                        value[i] = value[i].truncate(decimals);
                    }
                }
            }
            Mem.SetDeep(Memory.stats, key, value);
        }
    }

    // 执行记录操作
    static Run() {
        if(Game.time % LOG_STATS_INTERVAL == 0) {
            // 记录 IVM 堆统计信息
            Memory.stats["cpu.heapStatistics"] = (<any>Game.cpu).getHeapStatistics();
            // 记录 GCL
            this.Log("gcl.progress", Game.gcl.progress);
            this.Log("gcl.progressTotal", Game.gcl.progressTotal);
            this.Log("gcl.level", Game.gcl.level);
            // 记录内存使用
            this.Log("memory.used", RawMemory.get().length);
            // 记录 CPU
            this.Log("cpu.limit", Game.cpu.limit);
            this.Log("cpu.bucket", Game.cpu.bucket);
        }
        const used = Game.cpu.getUsed();
            this.Log("cpu.getUsed", used);
            Memory.stats.persistent.avgCPU = ExponentialMovingAverage(used, Memory.stats.persistent.avgCPU, 100);
    }
}