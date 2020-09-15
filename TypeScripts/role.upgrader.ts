import { ICreepConfig } from "./ICreepConfig"

export class Upgrader implements ICreepConfig{

    /**
     * Upgrader 类的构造函数
     * @property color creep 路径的颜色
     */
    constructor(color: string = "#3ac98f") {
        this.pathColor = color;
        this.source = undefined;
    }

    // 路径颜色
    pathColor: string;

    // 控制器
    controller: StructureController | undefined;

    // 能量源
    source: Structure<StructureConstant> | undefined | null;

    // 采集能量矿
    Source(creep: Creep): any {
        this.source = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: function (structure): boolean { 
                return (structure.structureType == STRUCTURE_CONTAINER) 
                    &&  structure.store.getCapacity(RESOURCE_ENERGY) > 0
            }
        });
        if(!!this.source){
            if (creep.withdraw(this.source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(this.source, { visualizePathStyle: { stroke: this.pathColor }});
            }
        }
    }

    // 升级控制器
    Target(creep: Creep): any {
        if(!!!this.controller){
            this.controller = creep.room.controller;
        }
        if(!!this.controller){
            if(creep.upgradeController(this.controller) == ERR_NOT_IN_RANGE){
                creep.moveTo(this.controller, { visualizePathStyle: { stroke: this.pathColor }});
            }
        }
    }

    Switch(creep: Creep): boolean  {
        // 切换工作状态
        // creep 身上没有能量且 creep 之前的工作状态为“工作”
        if(creep.store[RESOURCE_ENERGY] <= 0 && !!creep.memory.working){
            creep.memory.working = false;
            creep.say("🔄 执行采集工作。");
        }
        // creep 身上能量已满且 creep 之前的工作状态为“不工作”
        if(creep.store[RESOURCE_ENERGY] >= creep.store.getCapacity() && !!!creep.memory.working){
            creep.memory.working = true;
            creep.say("🚧 执行升级工作。");
        }
        return creep.memory.working;
    }
}