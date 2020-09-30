import { EnergySource, FindClosestEnergyStorageForObtaining, FindFinishingConstructionSite, RefillCreep } from "./CreepCommonMethod";
import { ICreepConfig } from "./ICreepConfig"

export class Builder implements ICreepConfig{

    /**
     * Builder 类的构造函数
     * @property color creep 路径的颜色
     */
    constructor(color: string = "#cbcb41") {
        this.pathColor = color;
    }

    // 路径颜色
    pathColor: string;

    // 采集能量
    Source(creep: Creep): any {
        if(!!creep.ticksToLive && creep.ticksToLive > 1450){
            // 刚孵化出来的 Builder 每次都要寻找获取能量的容器
            creep.memory.source = undefined;
        }
        if(!!!creep.memory.source){
            // 寻找最近的能量存储设施、能量源或掉落的能量
            const energySource: EnergySource | undefined = FindClosestEnergyStorageForObtaining(creep);
            if(!!energySource){
                creep.memory.source = energySource.id;
                creep.memory.energyTakeMethod = energySource.take;
            }else{
                console.log(`Creep: ${creep.name} 的采集目标不存在。`)
                return;
            }
        }else{
            RefillCreep(creep, this.pathColor);
        }
    }

    // 建造建筑
    Target(creep: Creep): any {
        if(!!!creep.memory.construction){
            creep.memory.construction = FindFinishingConstructionSite(creep)?.id;
            // 更换目标建筑后，重新寻找数据源
            creep.memory.source = undefined;
            if(!!!creep.memory.construction){
                if(!!creep.room.controller){
                    // 如果没有需要建造的建筑，返回到控制器待命
                    creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: this.pathColor }});
                }
            }
        }else{
            const construction = Game.getObjectById(creep.memory.construction as Id<ConstructionSite>);
            if(!!!construction){
                delete creep.memory.construction;
                return;
            }
            // 建造
            if(creep.build(construction) == ERR_NOT_IN_RANGE){
                creep.moveTo(construction, { visualizePathStyle: { stroke: this.pathColor }});
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
            creep.say("🚧 执行建造工作。");
        }
        return creep.memory.working;
    }
}