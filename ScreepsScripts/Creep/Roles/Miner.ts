import { HarvestingState, MovingState, Resolve, SpawningState, StateResolver } from "../States/CreepState";
import { Harvest } from "../States/HarvestingEnergy";
import { Move } from "../States/Moving";

// 采矿者工作
export function MinerJob(creep: Creep): void {
    if(!creep.memory.state){
        creep.memory.state = SpawningState;
    }
    switch (creep.memory.state) {
        case SpawningState:
            Initialize(creep, { nextState: HarvestingState });
            break;
        case HarvestingState:
            Harvest(creep, false, { nextState: HarvestingState });
            break;
        case MovingState:
            Move(creep, { nextState: HarvestingState });
            break;
    }
}

// 初始化
function Initialize(creep: Creep, state: StateResolver): void {
    if(creep.spawning){
        return;
    }
    creep.memory.state = Resolve(state);
}