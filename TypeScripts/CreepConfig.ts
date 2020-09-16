import { Harvester } from "./role.harvester";
import { Builder } from "./role.builder";
import { Upgrader } from "./role.upgrader";
import { Repairer} from "./role.repairer"
import { WallRepairer } from "./role.wallRepairer";

export class CreepConfigs {
    creepRoles: string[];

    creepSpawningConfig: { [key: string]: CreepSpawningInfo };

    /**
     *  Creep 配置构造函数
     */
    constructor() {
        this.creepRoles = ["harvester", "builder", "upgrader", "repairer", "wallRepairer", "repairerV2", "harvesterV2", "builderV2", "upgraderV2", "wallRepairerV2"];
        this.creepSpawningConfig = {
                "repairer": new CreepSpawningInfo("repairer", [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], 1),
                "wallRepairer": new CreepSpawningInfo("wallRepairer", [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], 1),
                "harvester": new CreepSpawningInfo("harvester", [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], 1),
                "builder": new CreepSpawningInfo("builder", [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], 1),
                "upgrader": new CreepSpawningInfo("upgrader", [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], 1),
                // 更新换代测试角色
                "repairerV2": new CreepSpawningInfo("repairerV2", [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], 0),
                "wallRepairerV2": new CreepSpawningInfo("wallRepairer", [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], 0),
                "harvesterV2": new CreepSpawningInfo("harvesterV2", [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 2),
                "builderV2": new CreepSpawningInfo("builderV2", [WORK, WORK, WORK, CARRY, CARRY, MOVE, MOVE], 0),
                "upgraderV2": new CreepSpawningInfo("upgraderV2", [WORK, WORK, WORK, WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], 1),
        }
    }

    Work(creep: Creep){
        let working: boolean = false;
        let worker: Harvester | Builder | Upgrader | Repairer | null = null;
        switch (creep.memory["role"]) {
            case "harvester":
            case "harvesterV2":
                worker = new Harvester();
                break;
            case "builder":
            case "builderV2":
                worker = new Builder();
                break;
            case "upgrader":
            case "upgraderV2":
                worker = new Upgrader();
                break;
            case "repairer":
            case "repairerV2":
                worker = new Repairer();
                break;
            case "wallRepairer":
            case "wallRepairerV2":
                worker = new WallRepairer();
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

class CreepSpawningInfo{
    /**
     * Creep孵化信息
     */
    constructor(role: string, bodies: any[], count: number) {
        this.role = role;
        this.bodies = bodies;
        this.count = count;
    }
    role: string;
    bodies: any[];
    count: number;
}
