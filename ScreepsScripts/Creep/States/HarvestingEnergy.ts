import { MovingState, ReplayFunction, Resolve, ResolveAndReplay, StateResolver } from "./CreepState";
import { AssignToSouce } from "../Management/SourceAssigner";

// 采集
export function Harvest(creep: Creep, checkCapicity: boolean, state: StateResolver): void {
    if(checkCapicity && creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0){
        ResolveAndReplay(creep, state);
        return;
    }
    if(!creep.memory.source){
        FindSource(creep);
        return;
    }
    const source = Game.getObjectById(creep.memory.source as Id<Source>);
    if(!source){
        FindSource(creep);
        return;
    }
    const harvestResult = creep.harvest(source);
    switch (harvestResult) {
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            GoToSource(creep, source, state?.Replay);
    }
}

// 前往源
function GoToSource(creep: Creep, source: Source, replay: ReplayFunction | undefined): void {
    creep.memory.targetPos = {
        x: source.pos.x,
        y: source.pos.y,
        room: source.pos.roomName
    };
    creep.say("🥾");
    ResolveAndReplay(creep, { nextState: MovingState, Replay: replay });
}

// 发现源
function FindSource(creep: Creep): void {
    creep.room.find(FIND_SOURCES)
        .sort((source1, source2) => creep.pos.getRangeTo(source1) - creep.pos.getRangeTo(source2))
        .find((source) => AssignToSouce(creep, source));
}