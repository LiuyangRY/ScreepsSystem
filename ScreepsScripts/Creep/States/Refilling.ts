import { MovingState, ReplayFunction, ResolveAndReplay, StateResolver } from "./CreepState";

export function Refilling(creep: Creep, state: StateResolver): void {
    if(creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0){
        ResolveAndReplay(creep, state);
        return;
    }
    let storage;
    if(creep.memory.container &&
        Game.getObjectById(creep.memory.container)?.store.getUsedCapacity(RESOURCE_ENERGY) > 0){
            storage = Game.getObjectById(creep.memory.container);
    }else{
        storage = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure: AnyStructure) =>
                    (structure.structureType == STRUCTURE_STORAGE && structure.my && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
                ||  (structure.structureType == STRUCTURE_LINK && structure.my && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
                ||  (structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0)
        });
    }
    if(!!storage){
        const result = creep.withdraw(storage, RESOURCE_ENERGY);
        switch (result) {
            case OK:
                break;
            case ERR_NOT_IN_RANGE:
                GoToStorage(creep, storage, state.Replay);
                break;
            default:
                console.log(`Refilling: withdraw result ${result}`);
                break;
        }
    }
}

// 前往存储设施
function GoToStorage(creep: Creep, assignedStorage: Structure, replay: ReplayFunction | undefined): void {
    SetTargetStorage(creep, assignedStorage);
    creep.say("🥾");
    ResolveAndReplay(creep, {nextState: MovingState, Replay: replay});
  }
  
// 设置目标存储设施
function SetTargetStorage(creep: Creep, storage: Structure): void {
creep.memory.storage = storage.id;
creep.memory.targetPos = {
    x: storage.pos.x,
    y: storage.pos.y,
    room: storage.pos.roomName,
};
}