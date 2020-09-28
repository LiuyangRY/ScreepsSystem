declare const require: (module: string) => any;
declare var global: any;

// NodeJS
declare namespace NodeJS {
    interface Global {
        age?: number;
        _cache: IGlobalCache;
        __VERSION__: string;
        Overmind: IOvermind;
        Assimilator: IAssimilator;
        Print(...args: any[]): string;
        Deref(ref: string): RoomObject | null;
        DerefRoomPosition(protoPos: ProtoPos): RoomPosition;
        Gc(quick?: boolean): void;
    }
}

declare module "columnify";

// 如果抛出 TS2451 错误, 在 typed-screeps index.d.ts file 中将 "declare let Game: Game;" 修改为 "declare var Game: Game;"
// 游戏
interface Game {

}

// 全局缓存
interface IGlobalCache {
    accessed: { [key: string]: number };
    expiration: { [key: string]: number };
    structures: { [key: string]: Structure[] };
    numbers: { [key: string]: number };
    lists: { [key: string]: any[] };
    costMatrices: { [key: string]: CostMatrix };
    roomPositions: { [key: string]: RoomPosition | undefined };
    things: { [key: string]: undefined | HasID | HasID[] };
}

// 缓存
interface ICache {
    overlords: { [overlord: string]: { [roleName: string]: string[] }};
    creepsByColony: { [colonyName: string]: Creep[] };
    targets: { [ref: string]: string[] };
    outpostFlags: Flag[];
    Build(): void;
    Refresh(): void;
}

// 扩张计划
interface IExpansionPlanner {
    Refresh(): void;
    Init(): void;
    Run(): void;
}

// 主宰内存
interface IOvermindMemory {
    terminalNetwork: any;
    versionUpdater: any;
}

// 吸收者
declare const Assimilator: IAssimilator;

interface IAssimilator {
    Validate(code: any): void;
    GenerateChecksum(): string;
    UpdateVlidChecksumLedger(): void;
    IsAssimilated(username: string): boolean;
    GetClearanceCode(username: string): string | null;
    Run(): void;
}

// 主宰
interface IOvermind {
    shouldBuild: boolean;
    expiration: number;
    cache: ICache;
    overseer: IOverseer;
    directives: { [flagName: string]: any };
    zerg: { [creepName: string]: any };
    colonies: { [roomName: string]: any };
    overlords: { [ref: string]: any };
    spawnGroups: { [ref: string]: any };
    colonyMap: { [roomName: string]: string };
    memory: IOvermindMemory;
    terminalNetwork: ITerminalNetwork;
    tradeNetwork: ITradeNetwork;
    expansionPlanner: IExpansionPlanner;
    exceptions: Error[];

    Build(): void;
    Refresh(): void;
    Init(): void;
    Run(): void;
    PostRun(): void;
    Visuals(): void;
}

// 提示
interface INotifier {
    Alert(message: string, roomName: string, priority?: number); void;
    GenerateNotificationsList(links: boolean): string[];
    Visuals(): void;
}

// 监督者
interface IOverseer {
    notifier: INotifier;
    RegisterDirective(directive: any): void;
    RemoveDirective(directive: any): void;
    RegisterOverlord(overlord: any): void;
    GetOverlordsForColony(colony: any): any[];
    IsOverlordSuspended(overlord: any): boolean;
    SuspendOverlordFor(overlord: any, ticks: number): void;
    SuspendOverlordUntil(overlord: any, untilTick: number): void;
    Init(): void;
    Run(): void;
    GetCreepReport(colony: any): string[][];
    Visuals(): void;
}

// 终端状态
interface TerminalState {
    name: string;
    type: "in" | "out" | "in/out";
    amounts: { [resourceType: string]: number };
    tolerance: number;
}

// 终端网络
interface ITerminalNetwork {
    allTerminals: StructureTerminal[];
    readyTerminals: StructureTerminal[];
    memory: any;
    
    Refresh(): void;
    RequestResource(terminal: StructureTerminal, resourceType: ResourceConstant, amount: number): void;
    RegisterTerminalState(terminal: StructureTerminal, state: TerminalState): void;
    Init(): void;
    Run(): void;
}

// 交易网络
interface ITradeNetwork {
    memory: any;
    
    Refresh(): void;
    PriceOf(mineralType: ResourceConstant): number;
    LookForGoodDeals(terminal: StructureTerminal, mineral: string, margin?: number): void;
    SellDirectly(terminal: StructureTerminal, resource: ResourceConstant, amount?: number, flexibleAmount?: boolean): number| undefined;
    Sell(terminal: StructureTerminal, resource: ResourceConstant, amount: number, maxOrderOfType?: number): number | undefined;
    Buy(terminal: StructureTerminal, mineralType: ResourceConstant, amount: number): void;
    MaintainBuyOrder(terminal: StructureTerminal, resource: ResourceConstant, amount: number, maxOrdersOfType?: number): void;
    Init(): void;
    Run(): void;
}

declare var Overmind: IOvermind;

declare var _cache: IGlobalCache;

declare function Print(...args: any[]): void;

// 坐标
interface Coord {
    x: number;
    y: number;
}

// 房间坐标
interface RoomCoord {
    x: number;
    y: number;
    xDir: string;
    yDir: string;
}

// 寻路目标
interface PathFinderGoal {
    pos: RoomPosition;
    range: number;
    cost?: number;
}

interface ProtoCreep {
    body: BodyPartConstant[];
    name: string;
    memory: any;
}

interface ProtoCreepOptions {
    assignment?: RoomObject;
    patternRepetitionLimit?: number;
}

interface ProtoRoomObject {
    ref: string;
    pos: ProtoPos;
}

interface ProtoPos {
    x: number;
    y: number;
    roomName: string;
}

interface HasPos {
    pos: RoomPosition;
}

interface HasRef {
    ref: string;
}

interface HasID {
    id: string;
}