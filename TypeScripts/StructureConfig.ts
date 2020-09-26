import { Link } from "./Link";
import { Tower } from "./Tower";

export class StructureConfig {
    creepRoles: StructureConstant[];

    /**
     *  Structure 配置构造函数
     */
    constructor() {
        this.creepRoles = [STRUCTURE_TOWER, STRUCTURE_LINK];
    }

    Work(structure: Structure){
        let working: boolean = false;
        let worker: Tower | Link | null = null;
        switch (structure.structureType) {
            case STRUCTURE_TOWER:
                worker = new Tower();
                break;
            case STRUCTURE_LINK:
                worker = new Link();
                break;
            default:
                return;
        }
        working = worker?.Switch ? worker.Switch(structure) : true;
        if(!!worker){
            if(working){
                worker.Target(structure);
            }else{
                worker.Source(structure);
            }
        }
    }
}