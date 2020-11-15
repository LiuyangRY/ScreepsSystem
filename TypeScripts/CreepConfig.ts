import { Harvester } from "./role.harvester";
import { Builder } from "./role.builder";
import { Upgrader } from "./role.upgrader";
import { Repairer} from "./role.repairer"
import { WallRepairer } from "./role.wallRepairer";
import { Claimer } from "./role.claimer";
import { LongDistanceHarvester } from "./role.longDistanceHarvester";
import { Attacker } from "./role.attacker";
import { Miner } from "./role.miner";
import { Carrier } from "./role.carrier";
import { RoadRepairer } from "./role.roadRepairer";

// Creep 角色枚举
export enum CreepRole {
    HARVESTER = "harvester",
    UPGRADER = "upgrader",
    BUILDER = "builder",
    LONGDISTANCEHARVESTER = "longDistanceHarvester",
    REPAIRER = "repairer",
    ROADREPAIRER = "roadRepairer",
    WALLREPAIRER = "wallRepairer",
    ATTACKER = "attacker",
    CLAIMER = "claimer",
    MINER = "miner",
    CARRIER = "carrier"
}

// Creep 定义
export class CreepDefinition {
    public readonly type: CreepRole;
    public readonly parts: BodyPartConstant[];
    public readonly cost: number;
  
    public constructor(type: CreepRole, parts: BodyPartConstant[], cost: number) {
      this.type = type;
      this.parts = parts;
      this.cost = cost;
    }
}

// Creep 配置
export class CreepConfigs {
    // 孵化顺序
    static CreepRoleOrder = [
        CreepRole.HARVESTER,
        CreepRole.UPGRADER,
        CreepRole.BUILDER,
        CreepRole.LONGDISTANCEHARVESTER,
        CreepRole.REPAIRER,
        CreepRole.ROADREPAIRER,
        CreepRole.WALLREPAIRER,
        CreepRole.MINER,
        CreepRole.CARRIER,
        CreepRole.ATTACKER,
        CreepRole.CLAIMER
    ];

    // 各角色数量
    static CreepAmounts: Record<CreepRole, number> = {
        [CreepRole.HARVESTER]: 3,
        [CreepRole.UPGRADER]: 3,
        [CreepRole.BUILDER]: 2,
        [CreepRole.MINER]: 1,
        [CreepRole.CARRIER]: 2,
        [CreepRole.LONGDISTANCEHARVESTER]: 2,
        [CreepRole.REPAIRER]: 2,
        [CreepRole.ROADREPAIRER]: 1,
        [CreepRole.WALLREPAIRER]: 1,
        [CreepRole.ATTACKER]: 0,
        [CreepRole.CLAIMER]: 0
    }

    // 角色定义
    static CreepRoleDefinitions: Record<CreepRole, CreepDefinition[]> = {
        [CreepRole.HARVESTER]: [
            new CreepDefinition(CreepRole.HARVESTER, [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 1100),
            new CreepDefinition(CreepRole.HARVESTER, [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 800),
            new CreepDefinition(CreepRole.HARVESTER, [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], 500),
            new CreepDefinition(CreepRole.HARVESTER, [WORK, CARRY, MOVE, MOVE, MOVE], 300),
            new CreepDefinition(CreepRole.HARVESTER, [WORK, CARRY, MOVE], 200)
          ],
          [CreepRole.UPGRADER]: [
            new CreepDefinition(CreepRole.UPGRADER, [WORK, WORK, WORK, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY], 650),
            new CreepDefinition(CreepRole.UPGRADER, [WORK, MOVE, CARRY, MOVE, MOVE], 300),
            new CreepDefinition(CreepRole.UPGRADER, [WORK, CARRY, MOVE], 200)
          ],
          [CreepRole.BUILDER]: [
            new CreepDefinition(CreepRole.BUILDER, [WORK, WORK, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY], 550),
            new CreepDefinition(CreepRole.BUILDER, [WORK, MOVE, MOVE, CARRY, CARRY], 300)
          ],
          [CreepRole.LONGDISTANCEHARVESTER]: [
            new CreepDefinition(CreepRole.LONGDISTANCEHARVESTER, [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], 500)
          ],
          [CreepRole.REPAIRER]: [
            new CreepDefinition(CreepRole.REPAIRER, [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], 500)
          ],
          [CreepRole.ROADREPAIRER]: [
            new CreepDefinition(CreepRole.WALLREPAIRER, [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], 500)
          ],
          [CreepRole.WALLREPAIRER]: [
            new CreepDefinition(CreepRole.WALLREPAIRER, [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], 500)
          ],
          [CreepRole.ATTACKER]: [
            new CreepDefinition(CreepRole.ATTACKER, [ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], 380)
          ],
          [CreepRole.CLAIMER]: [
            new CreepDefinition(CreepRole.CLAIMER, [CLAIM, MOVE], 650)
          ],
          [CreepRole.MINER]: [
            new CreepDefinition(CreepRole.MINER, [WORK, WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE], 800)
          ],
          [CreepRole.CARRIER]: [
            new CreepDefinition(CreepRole.CARRIER, [CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE], 500)
          ]
    };

    /**
     *  Creep 配置构造函数
     */
    constructor() {
    }

    Work(creep: Creep){
        let working: boolean = false;
        let worker: Harvester | Builder | Upgrader | Repairer | Claimer | null = null;
        switch (creep.memory["role"] as CreepRole) {
            case CreepRole.HARVESTER:
              worker = new Harvester();
              break;
            case CreepRole.LONGDISTANCEHARVESTER:
              worker = new LongDistanceHarvester();
              break;
            case CreepRole.BUILDER:
              worker = new Builder();
              break;
            case CreepRole.UPGRADER:
              worker = new Upgrader();
              break;
            case CreepRole.REPAIRER:
              worker = new Repairer();
              break;
            case CreepRole.ROADREPAIRER:
              worker = new RoadRepairer();
              break;
            case CreepRole.WALLREPAIRER:
              worker = new WallRepairer();
              break;
            case CreepRole.CLAIMER:
              worker = new Claimer();
              break;
            case CreepRole.ATTACKER:
              worker = new Attacker();
              break;
            case CreepRole.MINER:
              worker = new Miner();
              break;
            case CreepRole.CARRIER:
              worker = new Carrier();
              break;
        }
        working = worker?.Switch ? worker.Switch(creep) : true;
        if(!!worker){
            if(working){
                worker.Target(creep);
            }else{
                worker.Source(creep);
            }
        }
    }
} 
