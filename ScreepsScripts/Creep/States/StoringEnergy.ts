import { IdleState, MovingState, Replay, ReplayFunction, Resolve, ResolveAndReplay, StateResolver } from "./CreepState";

export function StoringEnergy(creep: Creep, state: StateResolver): void{
    if(creep.store.getUsedCapacity(RESOURCE_ENERGY) === 0){
        delete creep.memory.storage;
        ResolveAndReplay(creep, state);
        return;
    }
    if(!creep.memory.storage){
        const assigned = AssignStorage(creep, state?.Replay);
        if(!assigned){
            return;
        }
    }
    const assignedStorage = Game.getObjectById(creep.memory.storage as Id<StructureSpawn | StructureExtension | StructureLink | StructureStorage | StructureContainer>);
    if(!assignedStorage){
        AssignStorage(creep, state?.Replay);
        return;
    }
    const transferResult = creep.transfer(assignedStorage, RESOURCE_ENERGY);
    switch (transferResult) {
        case OK:
            delete creep.memory.storage;
            creep.memory.state = Resolve(state);
            break;
        case ERR_NOT_IN_RANGE:
            GoToStorage(creep, assignedStorage,  state.Replay);
            break;
        case ERR_FULL:
            AssignStorage(creep, state?.Replay);
            break;
    }
}

// 将存储设施分配给 Creep
function AssignStorage(creep: Creep, replay: ReplayFunction | undefined): boolean {
    const spawn = FindSpawn(creep);
    if(!!spawn){
        SetTargetStorage(creep, spawn);
    }else{
        const storage = FindClostestStorage(creep);
        if(!!storage){
            SetTargetStorage(creep, storage);
        }else{
            ResolveAndReplay(creep, { nextState: IdleState, Replay: replay });
            return false;
        }
    }
    return true;
}

function FindSpawn(creep: Creep): Structure | undefined{
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

// 查找最近的存储设施
function FindClostestStorage(creep: Creep): Structure | undefined {
    const storage = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: (structure: AnyOwnedStructure) => (
            (
                (
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
        return undefined;
    }
}

// 前往存储设施
function GoToStorage(creep: Creep, assignStorage: Structure, replay: ReplayFunction): void {
    SetTargetStorage(creep, assignStorage);
    creep.say("🥾");
    ResolveAndReplay(creep, { nextState: MovingState, Replay: replay });
}

// 设置目标存储设施
function SetTargetStorage(creep: Creep, storage: Structure): void {
    creep.memory.storage = storage.id;
    creep.memory.targetPos = {
        x: storage.pos.x,
        y: storage.pos.y,
        room: storage.room.name
    };
}