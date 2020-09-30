import { EnergySource, FindBrokenOwnedStructure, FindClosestEnergyStorageForObtaining, RefillCreep } from "./CreepCommonMethod";
import { ICreepConfig } from "./ICreepConfig"

export class Repairer implements ICreepConfig{

    /**
     * Repairer 类的构造函数
     * @property color creep 路径的颜色
     */
    constructor(color: string = "#66cc66") {
        this.pathColor = color;
    }

    // 路径颜色
    pathColor: string;

    // 获取能量
    Source(creep: Creep): any {
        if(!!!creep.memory.source){
            const energySource: EnergySource | undefined = FindClosestEnergyStorageForObtaining(creep);
            if(!!energySource){
                creep.memory.source = energySource.id;
                creep.memory.energyTakeMethod = energySource.take;
            }else{
                console.log(`Creep: ${creep.name} 的采集目标不存在。`)
                return;
            }
        }else {
            RefillCreep(creep, this.pathColor);
        }
    }

    // 维修建筑
    Target(creep: Creep): any {
        const target = FindBrokenOwnedStructure(creep)?.id;
        if(!!target){
            const structure = Game.getObjectById(target as Id<Structure>);
            if(!!structure) {
                // 维修建筑
                if(creep.repair(structure) == ERR_NOT_IN_RANGE){
                    creep.moveTo(structure, { visualizePathStyle: { stroke: this.pathColor }});
                }
            }
        }
    }

    Switch(creep: Creep): boolean  {
        // 切换工作状态
        // creep 身上没有能量且 creep 之前的工作状态为“工作”
        if(creep.store[RESOURCE_ENERGY] <= 0 && !!creep.memory.working){
            creep.memory.working = false;
            creep.say("🔄 执行采集工作");
        }
        // creep 身上能量已满且 creep 之前的工作状态为“不工作”
        if(creep.store[RESOURCE_ENERGY] >= creep.store.getCapacity() && !!!creep.memory.working){
            creep.memory.working = true;
            creep.say("🚧 执行维修工作。");
        }
        return creep.memory.working;
    }
}