import { IsEmpty, IsFull, ObtainTakeMethod, RefillCreep } from "./CreepCommonMethod";
import { ICreepConfig } from "./ICreepConfig"

export class Carrier implements ICreepConfig{

    /**
     * Carrier 类的构造函数
     * @property color creep 路径的颜色
     */
    constructor(color: string = "#0082fc") {
        this.pathColor = color;
        this.ObtainingResourcePointIds = {
            "W23N14": [
                "5f741906a34b87c6a5d2f991", // 矿场容器
                "5f60fb2bd97ebec7bbbc56fa", // 第二资源点容器
                "5f77620a20d9047423892ee8", // 外矿容器
            ]
        };
        this.KeepResourcePointIds = {
            "W23N14": [
                "5f676b5f18223f863075c569", // 主基地存储器
            ]
        };
    }

    // 路径颜色
    pathColor: string;

    // 资源获取点编号
    ObtainingResourcePointIds: Record<string, string[]> | undefined;

    // 资源集中点编号
    KeepResourcePointIds: Record<string, string[]> | undefined;

    // 获取资源
    Source(creep: Creep): any {
        if(!!!creep.memory.source){
            if(!!this.ObtainingResourcePointIds) {
                const resourceIds = this.ObtainingResourcePointIds[creep.room.name];
                for(let resourceIndex in resourceIds) {
                    const source = Game.getObjectById(resourceIds[resourceIndex] as Id<Structure | Resource>);
                    if(!!source) {
                        const method = ObtainTakeMethod(source);
                        if(!!method) {
                            const structure = source as StructureStorage | StructureContainer;
                            for(const resourceType in structure.store) {
                                if(!!structure && !IsEmpty({ id: structure.id, take: method }, resourceType as ResourceConstant)) {
                                    creep.memory.source = source.id;
                                    creep.memory.energyTakeMethod = method;
                                    creep.memory.resourceType = resourceType;
                                    return;
                                }
                            }
                            return;
                        }else {
                            continue;
                        }
                    }
                }
            }else {
                console.log("运输者资源获取点无配置信息，请检查配置。")
            }
        }else{
            RefillCreep(creep, this.pathColor);
        }
    }

    // 存储能量
    Target(creep: Creep): any {
        if(!!!creep.memory.storage) {
            if(!!this.KeepResourcePointIds) {
                const storageIds = this.KeepResourcePointIds[creep.room.name];
                for(let storageIndex in storageIds) {
                    const storage = Game.getObjectById(storageIds[storageIndex] as Id<Structure>);
                    if(!!storage) {
                        const method = ObtainTakeMethod(storage);
                        if(!!method && !IsFull({ id: storage.id, take: method }, undefined)) {
                            creep.memory.storage = storage.id;
                            return;
                        }else {
                            continue;
                        }
                    }
                }
            }else {
                console.log("运输者资源存储点无配置信息，请检查配置。")
            }
        }
        const assignedStorage = Game.getObjectById(creep.memory.storage as Id<StructureStorage | StructureContainer>);
        if(!!assignedStorage){
            let sourceId = assignedStorage.id;
            let methodType = ObtainTakeMethod(assignedStorage);
            if(!IsFull({ id: sourceId, take: methodType})){
                for(const resourceType in creep.store) {
                    if(creep.transfer(assignedStorage, resourceType as ResourceConstant) == ERR_NOT_IN_RANGE){
                        creep.moveTo(assignedStorage, { visualizePathStyle: { stroke: this.pathColor }});
                    }
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
        // creep 身上没有资源且 creep 之前的工作状态为“工作”
        if(creep.store.getUsedCapacity() <= 0 && !!creep.memory.working){
            creep.memory.working = false;
            delete creep.memory.storage;
            creep.say("🔄 执行采集工作。");
        }
        // creep 身上资源已满且 creep 之前的工作状态为“不工作”
        if(creep.store.getFreeCapacity() <= 0 && !!!creep.memory.working){
            creep.memory.working = true;
            creep.say("🚧 执行存储工作。");
        }
        return creep.memory.working;
    }
}