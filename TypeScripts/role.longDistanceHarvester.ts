import { FindClostestStorageForStoring, IsFull, LongDistanceMove, ObtainTakeMethod } from "./CreepCommonMethod";
import { ICreepConfig } from "./ICreepConfig"

export class LongDistanceHarvester implements ICreepConfig{

    /**
     * LongDistanceHarvester 类的构造函数
     * @property color creep 路径的颜色
     */
    constructor(color: string = "#6a9955") {
        this.pathColor = color;
        this.OutsideMinesName = {
            "W23N14": [
                "W23N15"
            ],
            "W23N15": [
                "W23N16"
            ]
        };
    }

    // 路径颜色
    pathColor: string;

    // 房间外矿
    OutsideMinesName: Record<string, string[]> | undefined;

    // 采集能量矿
    Source(creep: Creep): any {
        if(!!!creep.memory.targetPos && !!this.OutsideMinesName) {
            const index: number = Math.floor(Math.random() * this.OutsideMinesName[creep.room.name]?.length);
            const targetRoomName: string = this.OutsideMinesName[creep.room.name][index]; 
            if(!!targetRoomName) {
                creep.memory.targetPos = {
                    x: 25,
                    y: 25,
                    room: targetRoomName
                }
            }
        }
        
        if(!!creep.memory.targetPos && creep.room.name != creep.memory.targetPos.room) {
            if(creep.room.name == "W23N15") {
                const exit: RoomPosition = new RoomPosition(28, 0, "W23N15");
                LongDistanceMove(creep, creep.memory.targetPos.room, this.pathColor, exit);
                return;
            }else {
                // 不在目标房间
                LongDistanceMove(creep, creep.memory.targetPos.room, this.pathColor);
                return;
            }
        }

        if(!!!creep.memory.source){
            // 寻找最近的能量存储设施、能量源或掉落的能量
            const source: Source | null = creep.pos.findClosestByRange(FIND_SOURCES,{
                filter: function (source): boolean { 
                    return source.energy > 0
                }});
            if(!!source){
                creep.memory.source = source.id;
                creep.memory.energyTakeMethod = "harvest";
            }else{
                console.log(`Creep: ${creep.name} 的采集目标不存在。`)
                return;
            }
        }else{
            const source = Game.getObjectById(creep.memory.source as Id<Source>);
            if(!!source){
                const result = creep.harvest(source);
                if (result == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, { visualizePathStyle: { stroke: this.pathColor }});
                }
                if(result == ERR_NOT_ENOUGH_RESOURCES) {
                    creep.memory.source = undefined;
                }
            }
        }
    }

    // 存储能量
    Target(creep: Creep): any {
        if(!!creep.memory.room && creep.room.name != creep.memory.room) {
            // 不在源房间
            LongDistanceMove(creep, creep.memory.room, this.pathColor);
            return;
        }
        if (!!!creep.memory.storage) {
            const assignedId = FindClostestStorageForStoring(creep);
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
            if(!IsFull({ id: sourceId, take: methodType})){
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