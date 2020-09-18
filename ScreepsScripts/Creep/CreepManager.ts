import "lodash";
import { CreepRole } from "./Enum/CreepRoleEnum";

// Creep 结构
class CreepDefinition {
    public readonly type: CreepRole;
    public readonly bodyPartsComponents: BodyPartConstant[];
    public readonly cost: number;

    /**
     * Creep 结构类型构造函数
     */
    constructor(type: CreepRole, bodyParts: BodyPartConstant[], cost: number) {
        this.type = type;
        this.bodyPartsComponents = bodyParts;
        this.cost = cost;
    }
}

// Creep 角色顺序
const creepRoleOrder = [
    CreepRole.HARVESTER,
    CreepRole.UPGRADER,
    CreepRole.BUILDER,
    CreepRole.MINER,
    CreepRole.CARRIER
];

// Creep 结构配置
const creepDefinition: Record<CreepRole, CreepDefinition[]> = {
    [CreepRole.HARVESTER]:[
        new CreepDefinition(CreepRole.HARVESTER, [MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY], 500),
        new CreepDefinition(CreepRole.HARVESTER, [MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY], 400),
        new CreepDefinition(CreepRole.HARVESTER, [MOVE, WORK, CARRY], 200),
    ],
    [CreepRole.UPGRADER]: [
        new CreepDefinition(CreepRole.UPGRADER, [MOVE, MOVE, MOVE, MOVE, WORK, CARRY, CARRY, CARRY, CARRY, CARRY], 550),
        new CreepDefinition(CreepRole.UPGRADER, [MOVE, MOVE, MOVE, WORK, CARRY], 300),
        new CreepDefinition(CreepRole.UPGRADER, [MOVE, WORK, CARRY], 200),
    ],
    [CreepRole.BUILDER]: [
      new CreepDefinition(CreepRole.BUILDER, [MOVE, MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY], 550),
      new CreepDefinition(CreepRole.BUILDER, [MOVE, MOVE, WORK, CARRY, CARRY], 300),
      new CreepDefinition(CreepRole.BUILDER, [MOVE, WORK, CARRY], 200),
    ],
    [CreepRole.MINER]: [
      new CreepDefinition(CreepRole.MINER, [MOVE, WORK, WORK, WORK, WORK, WORK], 550),
    ],
    [CreepRole.CARRIER]: [
      new CreepDefinition(CreepRole.CARRIER, [MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY], 500),
    ]
};

// Creep 数量配置
const creepAmount: Record<CreepRole, number> = {
    [CreepRole.HARVESTER]: 2,
    [CreepRole.UPGRADER]: 2,
    [CreepRole.BUILDER]: 2,
    [CreepRole.MINER]: 2,
    [CreepRole.CARRIER]: 2
};

// Creep 符号配置
const creepSymbols: Record<CreepRole, string> = {
    [CreepRole.HARVESTER]: "🌾",
    [CreepRole.UPGRADER]: "⚡",
    [CreepRole.BUILDER]: "🔨",
    [CreepRole.MINER]: "⛏️",
    [CreepRole.CARRIER]: "📦"
};

// Creep 管理
export function CreepManager(): void {
    ForEverySpawn(spawn => {
        if(spawn.spawning){
            DrawSpawning(spawn);
        }else{
            for(const _role of creepRoleOrder){
                const role = _role as CreepRole;
                const amountOfLive = _.filter(Game.creeps, creep => !!creep && creep.memory.role == role)
                    .filter(creep => creep.memory.room === spawn.room.name)
                    .length;
                if(amountOfLive < creepAmount[role]){
                    for(const creepDef of creepDefinition[role]){
                        const availableEnergy = spawn.room.energyAvailable;
                        if(availableEnergy >= creepDef.cost && !spawn.spawning){
                            spawn.spawnCreep(creepDef.bodyPartsComponents, `${spawn.name}-${role}:${Game.time}`, {
                                memory: {
                                    role: role,
                                    room: spawn.room.name,
                                    param: {}
                                }
                            });
                        }
                    }
                }
            }
        }
    })

    // 显示正在孵化的 Creep 信息
    function DrawSpawning(spawn: StructureSpawn): void {
        if(spawn.spawning){
            const spawningCreep = Game.creeps[spawn.spawning.name];
            const role = spawningCreep.memory.role as CreepRole;
            const creepSymbol = creepSymbols[role];
            spawn.room.visual.text(
                creepSymbol,
                spawn.pos.x + 1,
                spawn.pos.y,
                { align: "left", opacity: 0.8}
            );
        }
    }

    // 遍历每个 Spawn
    function ForEverySpawn(onSpawn: (spawn: StructureSpawn) => void): void {
        for(const spawnName in Game.spawns){
            const spawn = Game.spawns[spawnName];
            onSpawn(spawn);
        }
    }
}