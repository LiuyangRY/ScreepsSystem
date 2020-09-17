import { CreepState, HarvestingState, IdleState, MovingState, Resolve, SpawningState, StateResolver, UpgradingState } from "../States/CreepState";
import { Harvest } from "../States/HarvestingEnergy";
import { Move } from "../States/Moving";
import { UpgradeController } from "../States/UpgradingController"

type Harvest = "harvest";
type Pickup = "pickup";
type Withdraw = "withdraw";

type EnergyTakeMethod = 
    Harvest |
    Pickup |
    Withdraw;

interface EnergySource {
    id: Id<Structure | Source | Resource>,
    take: EnergyTakeMethod | undefined
}

// 升级者状态
export enum UpgraderState {
    UPGRADING = '⚡',
    REFILLING = '🌾'
}

const VISITED_ENERGY_STORAGE = "E";

export function UpgraderJob(creep: Creep): void {
    if(global.legacy){
        RunLegacy(creep);
    }else{
        if(!creep.memory.state){
            creep.memory.state = SpawningState;
        }
        switch (creep.memory.state) {
            case SpawningState:
                Initialize(creep, { nextState: HarvestingState });
                break;
            case HarvestingState:
                Harvest(creep, true, { nextState: UpgradingState });
                break;
            case MovingState:
                Move(creep, { GetNextState: StateAfterMoving(creep) });
                break;
            case UpgradingState:
                UpgradeController(creep, { nextState: HarvestingState });
                break;
            case IdleState:
                break;
        }
    }
}

// 移动后的状态
function StateAfterMoving(creep: Creep) {
    return function(): CreepState {
        return creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0 ? UpgradingState : HarvestingState;
    };
}

// 初始化
function Initialize(creep: Creep, state: StateResolver) {
    if(creep.spawning){
        return;
    }
    creep.memory.state = Resolve(state);
}

// 运行逻辑
function RunLegacy(creep: Creep): void {
    switch (CalculateState(creep)) {
        case UpgraderState.REFILLING:
            UpgradingController(creep);
            break;
        case UpgraderState.UPGRADING:
            RefillCreep(creep);
            break;
    }
}

// 计算状态
function CalculateState(creep: Creep): UpgraderState {
    creep.memory.state = creep.memory.state ? creep.memory.state : UpgraderState.REFILLING;
    if(creep.memory.state == UpgraderState.UPGRADING){
        if(creep.store[RESOURCE_ENERGY] == 0){
            creep.memory.state = UpgraderState.REFILLING;
        }
    }else if(creep.memory.state == UpgraderState.REFILLING){
        if(creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0){
            creep.memory.state = UpgraderState.UPGRADING;
        }
    }
    creep.say(creep.memory.state);
    return creep.memory.state as UpgraderState;
}

// 升级控制器
function UpgradingController(creep: Creep): void {
    if(!!creep.room.controller){
        if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE){
            creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' }});
        }
    }else{
        creep.say(`No controller in room ${creep.room.controller}!`)
    }
}

// Creep 填充能量
function RefillCreep(creep: Creep): void {
    let foundEnergyStorage = {} as EnergySource | undefined;
    if(!foundEnergyStorage || !Game.getObjectById(foundEnergyStorage.id) || IsEmpty(foundEnergyStorage)){
        if(!creep.memory.param){
            return;
        }
        creep.memory.param[VISITED_ENERGY_STORAGE] = foundEnergyStorage = FindClosestEnergyStorage(creep);
    }
    const object = Game.getObjectById(foundEnergyStorage.id);
    switch (foundEnergyStorage.take) {
        case "harvest":
            if(creep.harvest(object as Source) == ERR_NOT_IN_RANGE){
                creep.moveTo(object as Source, { visualizePathStyle: { stroke: '#ffaa00' }});
            }
            break;
        case "pickup":
            if (creep.pickup(object as Resource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(object as Resource, { visualizePathStyle: { stroke: '#ffaa00' }});
            }
            break;
        case "withdraw":
            if (creep.withdraw(object as StructureStorage | StructureContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(object as StructureStorage | StructureContainer, { visualizePathStyle: {stroke: '#ffaa00' }});
            }
            break;
    }
}

// 能量是否为空
function IsEmpty(energySource: EnergySource): boolean {
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

// 寻找最近的能量存储设施
function FindClosestEnergyStorage(creep: Creep): EnergySource {
    const pos = creep.pos;
    const room = creep.room;
    const structures = room.find(FIND_STRUCTURES, {
        filter: (structure: AnyStructure) => {
            (structure.structureType == STRUCTURE_CONTAINER ||
            structure.structureType == STRUCTURE_STORAGE) &&
            structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
        }
    }) as RoomObject[];
    const resources = room.find(FIND_DROPPED_RESOURCES, {
        filter: (resource: Resource<ResourceConstant>) => {
            resource.resourceType == RESOURCE_ENERGY
        }
    }) as RoomObject[];
    const sources = room.find(FIND_SOURCES, {
        filter: (source: Source) => {
            source.energy > 0
        }
    }) as RoomObject[];
    const closestPath = pos.findClosestByPath(structures.concat(resources).concat(sources)) as Structure | Source | Resource;
    const takeMethod = ObtainTakeMethod(closestPath);
    return {
        id: closestPath.id,
        take: takeMethod
    };
}

// 获取能量的方法
function ObtainTakeMethod(energySource: Structure | Source | Resource): EnergyTakeMethod | undefined {
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

// 存储设施是否为空
function IsStorageEmpty(storage: StructureStorage | StructureContainer): boolean {
    if(storage.structureType == STRUCTURE_STORAGE ||
        storage.structureType == STRUCTURE_CONTAINER){
            return storage.store.getUsedCapacity(RESOURCE_ENERGY) == 0;
        }
    return true;
}