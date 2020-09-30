//#region 获取能量的方法
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

// 寻找最近的存储设施以获取能量
export function FindClosestEnergyStorageForObtaining(creep: Creep): EnergySource | undefined {
    const pos = creep.pos;
    const room = creep.room;
    const ownedStructures = room.find(FIND_MY_STRUCTURES, {
        filter: (structure: AnyOwnedStructure) => {
            return (
                (structure.structureType == STRUCTURE_LINK) &&
                structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
            )
        }
    }) as RoomObject[];
    const structures = room.find(FIND_STRUCTURES, {
        filter: (structure: AnyStructure) => {
            return (
                (structure.structureType == STRUCTURE_CONTAINER ||
                structure.structureType == STRUCTURE_STORAGE ) &&
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
    const closestPath = pos.findClosestByPath(ownedStructures.concat(structures).concat(resources).concat(sources)) as Structure | Source | Resource;
    if(!!!closestPath){
        return undefined;
    }
    const takeMethod = ObtainTakeMethod(closestPath);
    return {
        id: closestPath.id,
        take: takeMethod
    };
}

// 查找最近的存储能量设施以存储能量
export function FindClostestStorageForStoring(creep: Creep): Structure | undefined {
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
    let memoryEnergyStorage = {} as EnergySource;
    if(!!creep.memory.source && !!creep.memory.energyTakeMethod){
        memoryEnergyStorage.id = creep.memory.source as Id<Structure<StructureConstant> | Source | Resource<ResourceConstant>>;
        memoryEnergyStorage.take = creep.memory.energyTakeMethod as Harvest | Pickup | Withdraw;
    }
    if(!!!memoryEnergyStorage || !!!Game.getObjectById(memoryEnergyStorage.id) || IsEmpty(memoryEnergyStorage)){
        let foundEnergyStorage: EnergySource | undefined = FindClosestEnergyStorageForObtaining(creep);
        if(!!!foundEnergyStorage){
            console.log("Creep: " + creep.name + " 找不到可供使用的能量存储设施。");
            return;
        }
        creep.memory.source = foundEnergyStorage.id;
        creep.memory.energyTakeMethod = foundEnergyStorage.take;
        memoryEnergyStorage = foundEnergyStorage;
    }
    if(!!!memoryEnergyStorage){
        console.log("Creep: " + creep.name + " 找不到可供使用的能量。");
        creep.memory.source = undefined;
        creep.memory.energyTakeMethod = undefined;
        return;
    }
    const object = Game.getObjectById(memoryEnergyStorage.id);
    if(!!!memoryEnergyStorage.take){
        console.log("Creep: " + creep.name + " 获取能量的方法不存在。")
        return;
    }
    switch (memoryEnergyStorage.take) {
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
            console.log("Creep: " + creep.name + " 获取能量的方法：" + memoryEnergyStorage.take +"不存在。")
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
            return IsStorageEmpty(object as StructureSpawn | StructureTower | StructureExtension | StructureStorage | StructureContainer | StructureLink);
        case "harvest":
            return (object as Resource).amount <= 0;
        case "pickup":
            return (object as Source).energy <= 0;
    }
    return true;
}

// 能量是否已满
export function IsFull(energySource: EnergySource): boolean {
    const object = Game.getObjectById(energySource.id);
    switch (energySource.take) {
        case "withdraw":
            return IsStorageFull(object as StructureSpawn | StructureTower | StructureExtension | StructureStorage | StructureContainer | StructureLink);
        case "harvest":
            return (object as Resource).amount > 0;
        case "pickup":
            return (object as Source).energy > 0;
    }
    return true;
}

// 存储设施是否为空
export function IsStorageEmpty(storage: StructureSpawn | StructureTower | StructureExtension | StructureStorage | StructureContainer | StructureLink): boolean {
    if(
        storage.structureType == STRUCTURE_STORAGE ||
        storage.structureType == STRUCTURE_CONTAINER
        ) {
            return storage.store.getUsedCapacity(RESOURCE_ENERGY) == 0;
        }
    if(
        storage.structureType == STRUCTURE_SPAWN ||
        storage.structureType == STRUCTURE_LINK ||
        storage.structureType == STRUCTURE_EXTENSION ||
        storage.structureType == STRUCTURE_TOWER
        ) {
        return storage.store.getUsedCapacity(RESOURCE_ENERGY) == 0;
    }
    return true;
}

// 存储设施是否已满
export function IsStorageFull(storage: StructureSpawn | StructureTower | StructureExtension | StructureStorage | StructureContainer | StructureLink): boolean {
    if(
        storage.structureType == STRUCTURE_STORAGE ||
        storage.structureType == STRUCTURE_CONTAINER
        ) {
            return storage.store.getFreeCapacity(RESOURCE_ENERGY) == 0;
        }
    if(
        storage.structureType == STRUCTURE_SPAWN ||
        storage.structureType == STRUCTURE_LINK ||
        storage.structureType == STRUCTURE_EXTENSION ||
        storage.structureType == STRUCTURE_TOWER
        ) {
        return storage.store.getFreeCapacity(RESOURCE_ENERGY) == 0;
    }
    return false;
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

// 查找完成度最高的建筑点
export function FindFinishingConstructionSite(creep: Creep): ConstructionSite | undefined {
    let constructionSite: ConstructionSite | null;
    const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES, {
        filter: (c: ConstructionSite) => (c.progress < c.progressTotal)
    });
    if(!!constructionSites){
        // 找出完成度最高的建筑点
        for(let percentage = 0.99; percentage >= 0; percentage = percentage - 0.01){
            constructionSite = creep.pos.findClosestByPath(constructionSites, {
                filter: (c: ConstructionSite) => (c.progress / c.progressTotal > percentage)
            });
            if(!!constructionSite){
                return constructionSite;
            }
        }
    }else {
        return undefined;
    }
}

// 查找血量最低的所属建筑
export function FindBrokenOwnedStructure(creep: Creep): OwnedStructure | undefined{
    let ownedStructure: OwnedStructure | null;
    const structures = creep.room.find(FIND_MY_STRUCTURES, {
        filter: (s: Structure) => (s.hits < s.hitsMax ) && 
            (s.structureType != STRUCTURE_WALL)
    });
    if(!!structures){
        // 找出血量百分比最低的建筑
        for(let percentage = 0.1; percentage <= 1; percentage = percentage + 0.1){
            ownedStructure = creep.pos.findClosestByPath(structures, {
                filter: (os: Structure) => (os.hits / os.hitsMax < percentage)
            });
            if(!!ownedStructure){
                return ownedStructure;
            }
        }
    }else {
        return undefined;
    }
}

// 查找血量最低的中立建筑
export function FindBrokenStructure(creep: Creep): Structure | undefined{
    let structure: Structure | null;
    const structures = creep.room.find(FIND_STRUCTURES, {
        filter: (s: Structure) => (s.hits < s.hitsMax ) && 
            (
                s.structureType == STRUCTURE_ROAD ||
                s.structureType == STRUCTURE_WALL || 
                s.structureType == STRUCTURE_CONTAINER
            )
    });
    if(!!structures){
        // 找出血量百分比最低的建筑
        for(let percentage = 0.1; percentage <= 1; percentage = percentage + 0.1){
            structure = creep.pos.findClosestByPath(structures, {
                filter: (s: StructureWall) => (s.hits / s.hitsMax < percentage)
            });
            if(!!structure){
                return structure;
            }
        }
    }else {
        return undefined;
    }
}

// 移动到其他房间
export function LongDistanceMove(creep: Creep, targetRoomName: string, pathColor: string = "#ffffff"): void {
    if(!!targetRoomName && targetRoomName.length > 0){
        // 要占领的房间
        const room = Game.rooms[targetRoomName];
        // 如果该房间不存在就先往房间走
        if (!!!room) {
            const targetPosition: RoomPosition = new RoomPosition(25, 25, targetRoomName);
            if(!!targetPosition){
                creep.moveTo(targetPosition, { visualizePathStyle: { stroke: pathColor }, reusePath: 50 });
            }else {
                console.log(`房间：${targetRoomName} 不存在。`);
            }
        }
    }else{
        return;
    }
}

//#endregion