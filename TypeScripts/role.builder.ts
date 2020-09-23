import { EnergySource, FindClosestEnergyStorage, RefillCreep } from "./CommonMethod";
import { ICreepConfig } from "./ICreepConfig"

export class Builder implements ICreepConfig{

    /**
     * Builder 类的构造函数
     * @property color creep 路径的颜色
     */
    constructor(color: string = "#cbcb41") {
        this.pathColor = color;
        this.validityCount = 10;
    }

    // 路径颜色
    pathColor: string;

    // 能量源有效期
    validityCount: number;

    // 采集能量
    Source(creep: Creep): any {
        if(!!!creep.memory.source || !!!creep.memory.sourceValidatedCount){
            // 寻找最近的能量存储设施、能量源或掉落的能量
            const energySource: EnergySource | undefined = FindClosestEnergyStorage(creep);
            if(!!energySource){
                creep.memory.source = energySource.id;
                creep.memory.energyTakeMethod = energySource.take;
                creep.memory.sourceValidatedCount = this.validityCount;
            }else{
                console.log(`Creep: ${creep.name} 的采集目标不存在。`)
                return;
            }
        }else{
            creep.memory.sourceValidatedCount = creep.memory.sourceValidatedCount - 1;
            RefillCreep(creep, this.pathColor);
        }
    }

    // 建造建筑
    Target(creep: Creep): any {
        if(!!!creep.memory.construction){
            creep.memory.construction = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES)?.id;
            if(!!!creep.memory.construction){
                if(!!creep.room.controller){
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
            if(construction.progress == construction.progressTotal){
                creep.say(`🚧 ${construction.structureType}建造工作已完成。`);
                creep.memory.construction = null;
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