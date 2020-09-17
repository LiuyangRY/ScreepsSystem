import { HarvesterJob } from "./Roles/Harvester";
import { UpgraderJob, UpgraderState } from "./Roles/Upgrader";
import { BuilderJob } from "./Roles/Builder";
import { MinerJob } from "./Roles/Miner";
import { CarrierJob } from "./Roles/Carrier";
import { CreepRole} from "./Enum/CreepRoleEnum";

const worker: Record<CreepRole, (creep: Creep) => void> = {
    [CreepRole.HARVESTER]: HarvesterJob,
    [CreepRole.UPGRADER]: UpgraderJob,
    [CreepRole.BUILDER]: BuilderJob,
    [CreepRole.MINER]: MinerJob,
    [CreepRole.CARRIER]: CarrierJob
}

export function CreepWorker() {
    for(const creepName in Game.creeps){
        const creep = Game.creeps[creepName];
        if(!!creep){
            const role = creep.memory.role as unknown as CreepRole;
            if(!!role){
                worker[role](creep);
            }
        }
    }
}