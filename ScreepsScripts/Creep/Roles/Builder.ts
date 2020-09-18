import { BuildingState, CreepState, IdleState, ResolveAndReplay, MovingState, RefillingState, SpawningState, StateResolver } from "../States/CreepState";
import { Refilling } from "../States/Refilling";
import { Move } from "../States/Moving"
import { Building } from "../States/Building"

// 建造者工作
export function BuilderJob(creep: Creep): void {
    if(!creep.memory.state){
        creep.memory.state = SpawningState;
    }
    switch (creep.memory.state) {
        case SpawningState:
            Initialize(creep, { nextState: RefillingState });
            break;
        case RefillingState:
            Refilling(creep, { nextState: BuildingState });
        case MovingState:
            Move(creep, { GetNextState: StateAfterMoving(creep) });
            break;
        case BuildingState:
            Building(creep, { GetNextState: StateAfterBuilding(creep) });
            break;
        case IdleState:
            break;
    }
}

// 建造后的状态
function StateAfterBuilding(creep: Creep) {
    return function(): CreepState {
        return creep.store.getUsedCapacity(RESOURCE_ENERGY) > 0 ? BuildingState : RefillingState;
    }
}

// 移动后的状态
function StateAfterMoving(creep: Creep) {
    return function(): CreepState{
        return creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0 ? BuildingState : RefillingState;
    }
}

// 初始化
function Initialize(creep: Creep, state: StateResolver): void {
    if(creep.spawning){
        return;
    }
    ResolveAndReplay(creep, state);
}