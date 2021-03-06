// Creep 内存扩展属性
interface CreepMemory {
    construction?: any;
    container?: Id<StructureContainer>;
    storage?: string;
    source?: string;
    room: string;
    role: string;
    targetPos?: {
        x: number,
        y: number,
        room: string
    };
    param?: Record<string, any>;
}

// 源 内存扩展属性
interface SourceMemory {
    creeps: string[];
    spots: number;
}

// 内存扩展属性
interface Memory {
    creeps: { [name: string]: CreepMemory };
    powerCreeps: { [name: string]: PowerCreepMemory };
    flags: { [name: string]: FlagMemory };
    rooms: { [name: string]: RoomMemory };
    spawns: { [name: string]: SpawnMemory };
    sources: { [id: string]: SourceMemory };
    stats: Record<string, any>;
    mainComponentsTime: Record<string, any>;
}

// global 全局扩展
declare namespace NodeJS {
    interface Global {
        log: any;
        legacy: boolean;
    }
}