import { IdleState, MovingState, ReplayFunction, ResolveAndReplay, StateResolver } from "./CreepState"

export function UpgradeController(creep: Creep, state: StateResolver): void {
    if(creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0){
        ResolveAndReplay(creep, state);
        return;
    }
    const controller = creep.room.controller;
    if(!controller){
        creep.say("💤");
        ResolveAndReplay(creep, { nextState: IdleState, Replay: state?.Replay });
        return;
    }
    const upgradeResult = creep.upgradeController(controller);
    switch(upgradeResult){
        case OK:
            break;
        case ERR_NOT_IN_RANGE:
            GoToController(creep, controller, state?.Replay);
            break;
    }
}

// 前往控制器
function GoToController(creep: Creep, controller: StructureController | undefined, replay: ReplayFunction): void{
    creep.memory.targetPos = {
        x: controller.pos.x,
        y: controller.pos.y,
        room: controller.room.name
    };
    creep.memory.param = creep.memory.param || {};
    creep.memory.param.range = 3;
    creep.say("🥾");
    ResolveAndReplay(creep, { nextState: MovingState, params: { range: 3 }, Replay: replay });
}