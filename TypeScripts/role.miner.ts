import { IsFull, ObtainTakeMethod } from "./CreepCommonMethod";
import { ICreepConfig } from "./ICreepConfig"

export class Miner implements ICreepConfig{

    /**
     * Miner 类的构造函数
     * @property color creep 路径的颜色
     */
    constructor(color: string = "#1d2027") {
        this.pathColor = color;
    }

    // 路径颜色
    pathColor: string;

    // 采矿
    Source(creep: Creep): any {
        if(!!!creep.memory.source){
            // 寻找最近的矿场
            const mineral: Mineral | null = creep.pos.findClosestByRange(FIND_MINERALS,{
                filter: (m) => (
                    m.mineralAmount > 0 || m.ticksToRegeneration < 50
                )
            });
            if(!!mineral){
                creep.memory.source = mineral.id;
                creep.memory.energyTakeMethod = "harvest";
            }else{
                console.log(`Creep: ${creep.name} 的采集目标不存在。`)
                creep.memory.source = undefined;
                creep.memory.energyTakeMethod = undefined;
                return;
            }
        }else{
            const mineral = Game.getObjectById(creep.memory.source as Id<Mineral>);
            if(!!mineral){
                const result = creep.harvest(mineral);
                if (result == ERR_NOT_IN_RANGE) {
                    creep.moveTo(mineral, { visualizePathStyle: { stroke: this.pathColor }});
                }
                if(result == ERR_NOT_ENOUGH_RESOURCES) {
                    creep.memory.source = undefined;
                }
            }
        }
    }

    // 存储能量
    Target(creep: Creep): any {
        if (!!!creep.memory.storage) {
            const structure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (structure: AnyStructure) => {
                    return (
                        (structure.structureType == STRUCTURE_CONTAINER ||
                         structure.structureType == STRUCTURE_STORAGE) &&
                        structure.store.getFreeCapacity(RESOURCE_ZYNTHIUM) > 0
                    )
                }
            })
            if (!!!structure) {
                return;
            }else{
                creep.memory.storage = structure.id;
            }
        }
        const assignedStorage = Game.getObjectById(creep.memory.storage as Id<StructureContainer>);
        if(!!assignedStorage){
            let sourceId = assignedStorage.id;
            let methodType = ObtainTakeMethod(assignedStorage);
            if(!IsFull({ id: sourceId, take: methodType})){
                if(creep.transfer(assignedStorage, RESOURCE_ZYNTHIUM) == ERR_NOT_IN_RANGE){
                    creep.moveTo(assignedStorage, { visualizePathStyle: { stroke: this.pathColor }});
                }
            }else{
                creep.memory.storage = undefined;
            }
        }else{
            creep.memory.storage = undefined;
        }
    }

    Switch(creep: Creep): boolean  {
        // 切换工作状态
        // creep 身上没有能量且 creep 之前的工作状态为“工作”
        if(creep.store[RESOURCE_ZYNTHIUM] <= 0 && !!creep.memory.working){
            creep.memory.working = false;
            delete creep.memory.storage;
            creep.say("🔄 执行采集工作。");
        }
        // creep 身上能量已满且 creep 之前的工作状态为“不工作”
        if(creep.store[RESOURCE_ZYNTHIUM] >= creep.store.getCapacity() && !!!creep.memory.working){
            creep.memory.working = true;
            creep.say("🚧 执行存储工作。");
        }
        return creep.memory.working;
    }
    
}