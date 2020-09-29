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

// 水槽
type Sink = StructureSpawn |
    StructureExtension |
    StructureLab |
    StructurePowerSpawn |
    StructureNuker |
    StructureTower;

// 存储设施
type StorageUnit = StructureContainer |
    StructureTerminal |
    StructureStorage;

// 充电设施
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

// 房间对象
interface RoomObject {
    ref: string;
    targetedBy: string[];
    Serialize(): ProtoRoomObject;
}

// 房间位置
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

// 房间视野