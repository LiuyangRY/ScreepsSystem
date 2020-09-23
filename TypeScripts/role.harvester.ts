import { FindClostestStorageForHarvesting, FindSpawn, IsEmpty, ObtainTakeMethod, SetTargetStorage } from "./CommonMethod";
import { ICreepConfig } from "./ICreepConfig"

export class Harvester implements ICreepConfig{

    /**
     * Harvester 类的构造函数
     * @property color creep 路径的颜色
     */
    constructor(color: string = "#6a9955") {
        this.pathColor = color;
        this.validityCount = 10;
    }

    // 路径颜色
    pathColor: string;

    // 能量源有效期
    validityCount: number;

    // 采集能量矿
    Source(creep: Creep): any {
        if(!!!creep.memory.source || !!!creep.memory.sourceValidatedCount){
            // 寻找最近的能量存储设施、能量源或掉落的能量
            const source: Source | null = creep.pos.findClosestByRange(FIND_SOURCES,{
                filter: function (source): boolean { 
                    return source.energy > 0
                }});
            if(!!source){
                creep.memory.source = source.id;
                creep.memory.energyTakeMethod = "harvest";
                creep.memory.sourceValidatedCount = this.validityCount;
            }else{
                console.log(`Creep: ${creep.name} 的采集目标不存在。`)
                return;
            }
        }else{
            creep.memory.sourceValidatedCount = creep.memory.sourceValidatedCount - 1;
            const source = Game.getObjectById(creep.memory.source as Id<Source>);
            if(!!source){
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, { visualizePathStyle: { stroke: this.pathColor }});
                }
            }
        }
    }

    // 存储能量
    Target(creep: Creep): any {
        if (!!!creep.memory.storage) {
            const assignedId = FindClostestStorageForHarvesting(creep);
            if (!!!assignedId) {
                return;
            }else{
                creep.memory.storage = assignedId.id;
            }
        }
        const assignedStorage = Game.getObjectById(creep.memory.storage as Id<StructureSpawn | StructureExtension | StructureLink | StructureContainer>);
        if(!!assignedStorage){
            let sourceId = assignedStorage.id;
            let methodType = ObtainTakeMethod(assignedStorage);
            if(IsEmpty({ id: sourceId, take: methodType})){
                if(creep.transfer(assignedStorage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
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
        if(creep.store[RESOURCE_ENERGY] <= 0 && !!creep.memory.working){
            creep.memory.working = false;
            delete creep.memory.storage;
            creep.say("🔄 执行采集工作。");
        }
        // creep 身上能量已满且 creep 之前的工作状态为“不工作”
        if(creep.store[RESOURCE_ENERGY] >= creep.store.getCapacity() && !!!creep.memory.working){
            creep.memory.working = true;
            creep.say("🚧 执行存储工作。");
        }
        return creep.memory.working;
    }
    
}