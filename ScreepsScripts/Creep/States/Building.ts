import { IdleState, MovingState, Replay, ReplayFunction, Resolve, ResolveAndReplay, StateResolver } from "./CreepState";

// 建造
export function Building(creep: Creep, state: StateResolver): void {
    if(creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0){
        ResolveAndReplay(creep, state);
        return;
    }
    if(!creep.memory.construction){
        creep.memory.construction = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES)?.id;
    }
    if(!creep.memory.construction){
        ResolveAndReplay(creep, { nextState: IdleState, Replay: state.Replay });
        return;
    }
    const construction = Game.getObjectById(creep.memory.construction as Id<ConstructionSite>);
    if(!construction){
        delete creep.memory.construction;
        ResolveAndReplay(creep, state);
        return;
    }
    const buildResult = creep.build(construction);
    switch(buildResult){
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            GoToConstruction(creep, construction, state?.Replay);
            break;
    }
}

// 前往需要建造的建筑
function GoToConstruction(creep: Creep, construction: ConstructionSite, Replay: ReplayFunction | undefined): void {
    SetTarget(creep, construction);
    creep.say("");
    ResolveAndReplay(creep, { nextState: MovingState, Replay });
}

// 设置目标
function SetTarget(creep: Creep, construction: ConstructionSite): void {
    creep.memory.storage = construction.id;
    creep.memory.targetPos = {
        x: construction.pos.x,
        y: construction.pos.y,
        room: construction.pos.roomName
    }
}