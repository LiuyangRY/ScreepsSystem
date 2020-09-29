// Creep 原型扩展
interface Creep {
    hitsPredicted?: number;
    intel?: { [property: string]: number };
    memory: CreepMemory;
    boosts: _ResourceConstantSansEnergy[];
    boostCounts: { [boostType: string]: number };
    inRampart: boolean;
}

// 建筑点原型扩展
interface ConstructionSite {
    isWalkable: boolean;
}

// 目标原型扩展
interface Flag {

}

// 水槽类型
type Sink = StructureSpawn |
    StructureExtension |
    StructureLab |
    StructurePowerSpawn |
    StructureNuker |
    StructureTower;

// 存储设施类型
type StorageUnit = StructureContainer |
    StructureTerminal |
    StructureStorage;

// 充电设施类型
type RechargeObjectType = StructureStorage |
    StructureTerminal |
    StructureContainer |
    StructureLink |
    Tombstone |
    Resource;

// 房间原型扩展
interface Room {
    print: string;
    my: boolean;
    isOutpost: boolean;
    owner: string | undefined;
    reservedByMe: boolean;
    siginedByMe: boolean;
    creeps: Creep[];
    sourceKeepers: Creep[];
    hostiles: Creep[];
    dangerousHostiles: Creep[];
    playerHostiles: Creep[];
    invaders: Creep[];
    dangerousPlayerHostiles: Creep[];
    fleeDefaults: HasPos[];
    hostileStructures: Structure[];
    structures: Structure[];
    flags: Flag[];
    tombstones: Tombstone[];
    drops: { [resourceType: string]: Resource[] };
    droppedEnergy: Resource[];
    droppedPower: Resource[];
    // 房间建筑
    _refreshStructureCache;
    // 多个建筑
    spawns: StructureSpawn[];
    extensions: StructureExtension[];
    roads: StructureRoad[];
    walls: StructureWall[];
    constructedWalls: StructureWall[];
    ramparts: StructureRampart[];
    walkableRamparts: StructureRampart[];
    barriers: (StructureWall | StructureRampart)[];
    storageUnits: StorageUnit[];
    keeperLairs: StructureKeeperLair[];
    portals: StructurePortal[];
    links: StructureLink[];
    towers: StructureTower[];
    labs: StructureLab[];
    containers: StructureContainer[];
    powerBanks: StructurePowerBank[];
    // 单个建筑
    observer: StructureObserver | undefined;
    powerSpawn: StructurePowerSpawn | undefined;
    extractor: StructureExtractor | undefined;
    nuker: StructureNuker | undefined;
    repairables: Structure[];
    rechargeables: RechargeObjectType[];
    sources: Source[];
    mineral: Mineral | undefined;
    constructionSites: ConstructionSite[];
    _creepMatrix: CostMatrix;
    _kitingMatrix: CostMatrix;
}

// 房间对象原型扩展
interface RoomObject {
    ref: string;
    targetedBy: string[];
    Serialize(): ProtoRoomObject;
}

// 房间位置原型扩展
interface RoomPosition {
    print: string;
    printPlain: string;
    room: Room | undefined;
    name: string;
    coordName: string;
    isEdge: boolean;
    isVisible: boolean;
    rangeToEdge: number;
    roomCoords: Coord;
    neighbors: RoomPosition[];

    InRangeToPos(pos: RoomPosition, range: number): boolean;
    InRangeToXY(x: number, y: number, range: number): boolean;
    GetRangeToXY(x: number, y: number): number;
    GetPositionsAtRange(range: number, includeWalls?: boolean, includeEdges?: boolean): RoomPosition[];
    GetPositionsInRange(range: number, includeWalls?: boolean, includeEdges?: boolean): RoomPosition[];
    GetOffsetPos(dx: number, dy: number): RoomPosition;
    LookFor<T extends keyof AllLookAtTypes>(structureType: T): Array<AllLookAtTypes[T]>;
    LookForStructure(sturctureType: StructureConstant): Structure | undefined;
    IsWalkable(ignoreCreeps?: boolean): boolean;
    AvailableNeighbors(ignoreCreeps?: boolean): RoomPosition[];
    GetPositionAtDirection(direction: DirectionConstant, range?: number): RoomPosition;
    GetMultiRoomRangeTo(pos: RoomPosition): number;
    FindClosestByLimitedRange<T>(objects: T[] | RoomPosition[], rangeLimit: number, opts?: { filter: any | string; }): T | undefined;
    FindClosestByMultiRoomRange<T extends _HasRoomPosition>(objects: T[]): T | undefined;
    FindClosestByRangeThenPath<T extends _HasRoomPosition>(objects: T[]): T | undefined;
}

// 房间视野原型扩展
interface RoomVisual {
    Box(x: number, y: number, w: number, h: number, style?: LineStyle): RoomVisual;
    InfoBox(info: string[], x: number, y: number, opts?: { [option: string]: any }): RoomVisual;
    MultiText(textLines: string[], x: number, y: number, opts?: { [option: string]: any }): RoomVisual;
    Structure(x: number, y: number, type: string, opts?: { [option: string]: any }): RoomVisual;
    ConnectRoads(opts?: { [option: string]: any }): RoomVisual | void;
    Speech(text: string, x: number, y: number, opts?: { [option: string]: string }): RoomVisual;
    AnimatedPosition(x: number, y: number, opts?: { [option: string]: any }): RoomVisual;
    Resource(typs: ResourceConstant, x: number, y: number, size?: number, opacity?: number): number;
    _Fluid(type: string, x: number, y: number, size?: number, opacity?: number): void;
    _Mineral(type: string, x: number, y: number, size?: number, opacity?: number): void;
    _Compound(type: string, x: number, y: number, size?: number, opacity?: number): void;
}

// 建筑原型扩展
interface Structure {
    IsWalkable: boolean;
}

// 容器建筑原型扩展
interface StructureContainer {
    Energy: number;
    IsFull: boolean;
    IsEmpty: boolean;
}

// 控制器原型扩展
interface StructureCOntroller {
    ReservedByMe: boolean;
    SignedByMe: boolean;
    SignedByScreeps: boolean;

    NeedsReserving(reserveeBuffer: number): boolean;
}

// 扩展原型扩展
interface StructureExtension {
    IsFull: boolean;
    IsEmpty: boolean;
}

// 连接原型扩展
interface StructureLink {
    IsFull: boolean;
    IsEmpty: boolean;
}

// 存储设施原型扩展
interface StructureStorage {
    Energy: number;
    IsFull: boolean;
    IsEmpty: boolean;
}

// 孵化设施原型扩展
interface StructureSpawn {
    IsFull: boolean;
    IsEmpty: boolean;

    Cost(bodyArray: string[]): number;
}

// 终端原型扩展
interface StructureTerminal {
    Energy: any;
    IsFull: boolean;
    IsEmpty: boolean;
}

// 塔原型扩展
interface StructureTower {
    IsFull: boolean;
    IsEmpty: boolean;
}

// 墓碑原型扩展
interface Tombstone {
    Energy: number;
}

// 字符串原型扩展
interface String {
    PadRight(length: number, char?: string): string;
    PadLeft(length: number, char?: string): string;
}

// 数字原型扩展
interface Number {
    ToPercent(decimals?: number): string;
    Truncate(decimals: number): number;
}