// Creep 状态
export type SpawningState = "spawning-state";
export type MovingState = "moving-state";
export type StoringState = "storing-state";
export type HarvestingState = "harvesting-state";
export type PickingUpState = "picking-up-state";
export type WithdrawingState = "withdrawing-state";
export type RefillingState = "refilling-state";
export type BuildingState = "building-state";
export type RepairingState = "repairing-state";
export type UpgradingState = "upgrading-state";
export type IdleState = "idle-state";

export type CreepState = 
    SpawningState |
    StoringState |
    HarvestingState |
    PickingUpState |
    UpgradingState |
    WithdrawingState |
    RefillingState |
    BuildingState |
    RepairingState |
    MovingState |
    IdleState;

export const SpawningState: SpawningState = "spawning-state";
export const MovingState: MovingState = "moving-state";
export const StoringState: StoringState = "storing-state";
export const HarvestingState: HarvestingState = "harvesting-state";
export const PickingUpState: PickingUpState = "picking-up-state";
export const WithdrawingState: WithdrawingState = "withdrawing-state";
export const RefillingState: RefillingState = "refilling-state";
export const BuildingState: BuildingState = "building-state";
export const RepairingState: RepairingState = "repairing-state";
export const UpgradingState: UpgradingState = "upgrading-state";
export const IdleState: IdleState = "idle-state";

// 重播方法
export type ReplayFunction = (creep: Creep) => void;

// 状态解析
export interface StateResolver {
    nextState?: CreepState;
    params?: Record<string, any>;
    GetNextState?: () => CreepState;
    Replay?: ReplayFunction;
}

// 解析
export function Resolve(stateResolver: StateResolver): CreepState {
    if(!!stateResolver.nextState){
        return stateResolver.nextState;
    }
    if(!!stateResolver.GetNextState){
        return stateResolver.GetNextState();
    }
    throw new Error("Unresolvable state.")
}

// 重播
export function Replay(creep: Creep, stateResolver: StateResolver): void {
    if(!!stateResolver.Replay){
        stateResolver.Replay(creep);
    }
}

// 解析并重播
export function ResolveAndReplay(creep: Creep, stateResolver: StateResolver): void {
    creep.memory.state = Resolve(stateResolver);
    creep.memory.param = stateResolver?.params;
    Replay(creep, stateResolver);
}