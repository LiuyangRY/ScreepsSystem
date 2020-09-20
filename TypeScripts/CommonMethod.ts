//#region 获取能量

type Harvest = "harvest";
type Pickup = "pickup";
type Withdraw = "withdraw";
// 获取能量的方法类型
export type EnergyTakeMethod = 
    Harvest |
    Pickup |
    Withdraw;

// 能量源类型
export interface EnergySource {
    id: Id<Structure | Source | Resource>,
    take: EnergyTakeMethod | undefined
}
// 查找孵化器
export function FindSpawn(creep: Creep): Structure | undefined{
    const spawns = creep.room.find(FIND_MY_STRUCTURES, {
        filter: (structure: AnyOwnedStructure) => (
            structure.structureType == STRUCTURE_SPAWN && 
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        )
    });
    if(!!spawns && spawns.length > 0){
        return spawns[0];
    }else{
        return undefined;
    }
}

// 寻找 Creep 最近的能量存储设施
export function FindClosestEnergyStorage(creep: Creep): EnergySource {
    const pos = creep.pos;
    const room = creep.room;
    const structures = room.find(FIND_STRUCTURES, {
        filter: (structure: AnyStructure) => {
            return (
                (structure.structureType == STRUCTURE_CONTAINER ||
                structure.structureType == STRUCTURE_STORAGE) &&
                structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
            )
        }
    }) as RoomObject[];
    const resources = room.find(FIND_DROPPED_RESOURCES, {
        filter: (resource: Resource<ResourceConstant>) => {
            return resource.resourceType == RESOURCE_ENERGY
        }
    }) as RoomObject[];
    const sources = room.find(FIND_SOURCES, {
        filter: (source: Source) => {
            return source.energy > 0
        }
    }) as RoomObject[];
    const closestPath = pos.findClosestByPath(structures.concat(resources).concat(sources)) as Structure | Source | Resource;
    const takeMethod = ObtainTakeMethod(closestPath);
    return {
        id: closestPath.id,
        take: takeMethod
    };
}

// 为 Harvester 查找最近的存储能量设施
export function FindClostestStorageForHarvesting(creep: Creep): Structure | undefined {
    const storage = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: (structure: AnyOwnedStructure) => (
            (
                (
                    structure.structureType == STRUCTURE_SPAWN ||
                    structure.structureType == STRUCTURE_TOWER ||
                    structure.structureType == STRUCTURE_EXTENSION ||
                    structure.structureType == STRUCTURE_LINK
                )
                && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            )
            ||
            (
                (
                    structure.structureType == STRUCTURE_STORAGE
                )
                && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            )
        )
    });
    if(!!storage){
        return storage;
    }else{
        const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: function (structure): boolean { 
                    return (structure.structureType == STRUCTURE_CONTAINER) 
                        &&  structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                }
            });
        if(!!container){
            return container;
        }
    }
    return undefined;
}

// 为 Creep 填充能量
export function RefillCreep(creep: Creep, pathColor: string): void {
    let foundEnergyStorage = {} as EnergySource;
    if(!!creep.memory.source && !!creep.memory.energyTakeMethod){
        foundEnergyStorage.id = creep.memory.source as Id<Structure<StructureConstant> | Source | Resource<ResourceConstant>>;
        foundEnergyStorage.take = creep.memory.energyTakeMethod as Harvest | Pickup | Withdraw;
    }
    if(!!!foundEnergyStorage || !!!Game.getObjectById(foundEnergyStorage.id) || IsEmpty(foundEnergyStorage)){
        foundEnergyStorage = FindClosestEnergyStorage(creep);
        creep.memory.source = foundEnergyStorage.id;
        creep.memory.energyTakeMethod = foundEnergyStorage.take;
    }
    if(!!!foundEnergyStorage){
        console.log("Creep: " + creep.name + " 找不到可供使用的能量。");
        return;
    }
    const object = Game.getObjectById(foundEnergyStorage.id);
    if(!!!foundEnergyStorage.take){
        console.log("Creep: " + creep.name + " 获取能量的方法不存在。")
        return;
    }
    switch (foundEnergyStorage.take) {
        case "harvest":
            if(creep.harvest(object as Source) == ERR_NOT_IN_RANGE){
                creep.moveTo(object as Source, { visualizePathStyle: { stroke: pathColor }});
            }
            break;
        case "pickup":
            if (creep.pickup(object as Resource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(object as Resource, { visualizePathStyle: { stroke: pathColor }});
            }
            break;
        case "withdraw":
            if (creep.withdraw(object as StructureStorage | StructureContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(object as StructureStorage | StructureContainer, { visualizePathStyle: {stroke: pathColor }});
            }
            break;
        default:
            console.log("Creep: " + creep.name + " 获取能量的方法：" + foundEnergyStorage.take +"不存在。")
            break;
    }
}

// 获取能量方法
export function ObtainTakeMethod(energySource: Structure | Source | Resource): EnergyTakeMethod | undefined {
    if(_.get(energySource, "structureType")){
        return "withdraw";
    }
    if(_.get(energySource, "energy")){
        return "harvest";
    }
    if(_.get(energySource, "resourceType")){
        return "pickup";
    }
    return undefined;
}

// 能量是否为空
export function IsEmpty(energySource: EnergySource): boolean {
    const object = Game.getObjectById(energySource.id);
    switch (energySource.take) {
        case "withdraw":
            return IsStorageEmpty(object as StructureStorage | StructureContainer);
        case "harvest":
            return (object as Resource).amount <= 0;
        case "pickup":
            return (object as Source).energy <= 0;
    }
    return true;
}

// 存储设施是否为空
export function IsStorageEmpty(storage: StructureStorage | StructureContainer): boolean {
    if(storage.structureType == STRUCTURE_STORAGE ||
        storage.structureType == STRUCTURE_CONTAINER){
            return storage.store.getUsedCapacity(RESOURCE_ENERGY) == 0;
        }
    return true;
}

// 设置目标存储设施
export function SetTargetStorage(creep: Creep, storage: Structure): void {
    creep.memory.storage = storage.id;
    creep.memory.targetPos = {
        x: storage.pos.x,
        y: storage.pos.y,
        room: storage.room.name
    };
}
//#endregion