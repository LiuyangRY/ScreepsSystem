import { ICreepConfig } from "./ICreepConfig"

export class Upgrader implements ICreepConfig{

    /**
     * Upgrader 类的构造函数
     * @property color creep 路径的颜色
     */
    constructor(color: string = "#3ac98f") {
        this.pathColor = color;
    }

    // 路径颜色
    pathColor: string;

    // 控制器
    controller: StructureController | undefined;

    // 采集能量矿
    Source(creep: Creep): any {
        const sourceId = creep.pos.findClosestByRange(FIND_SOURCES)?.id;
        if(!!sourceId){
            const source = Game.getObjectById(sourceId);
            if(!!source){
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, { visualizePathStyle: { stroke: this.pathColor }});
                }
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