import { CreepState, HarvestingState, IdleState, MovingState, ResolveAndReplay, SpawningState, StateResolver, StoringState, UpgradingState } from "../States/CreepState"
import { Move } from "../States/Moving";
import { Harvest } from "../States/HarvestingEnergy";
import { StoringEnergy } from "../States/StoringEnergy";
import { UpgradeController } from "../States/UpgradingController";

// 采集工作
export function HarvesterJob(creep: Creep): void {
    if(!creep.memory.state){
        creep.memory.state = SpawningState;
    }
    switch (creep.memory.state) {
        case SpawningState:
            Initialize(creep, { nextState: HarvestingState, Replay: HarvesterJob });
            break;
        case MovingState:
            Move(creep, { GetNextState: StateAfterMoving(creep), Replay: HarvesterJob });
            break;
        case HarvestingState:
            Harvest(creep, true, { nextState: StoringState, Replay: HarvesterJob });
            break;
        case StoringState:
            StoringEnergy(creep, { nextState: HarvestingState, Replay: HarvesterJob });
            break;
        case IdleState:
            UpgradeController(creep, { nextState: HarvestingState, Replay: HarvesterJob });
            break;
    }
}

// 移动后状态
function StateAfterMoving(creep: Creep) {
    return function(): CreepState {
        return creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0 ? StoringState : HarvestingState;
    };
}

// 初始化
function Initialize(creep: Creep, state: StateResolver){
    if(creep.spawning){
        return;
    }
    ResolveAndReplay(creep, state);
}