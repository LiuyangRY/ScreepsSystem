import { ICreepConfig } from "./ICreepConfig"

export class Harvester implements ICreepConfig{

    /**
     * Harvester 类的构造函数
     * @property color creep 路径的颜色
     */
    constructor(color: string = "#6a9955") {
        this.pathColor = color;
        this.target = null;
    }

    // 路径颜色
    pathColor: string;

    // 能量矿主键
    sourceId: Id<Source> | undefined;

    // 收集目标
    target: any;

    // 采集能量矿
    Source(creep: Creep): any {
        if(!!!this.sourceId){
            this.sourceId = creep.pos.findClosestByRange(FIND_SOURCES)?.id;
        }
        if(!!this.sourceId){
            const source = Game.getObjectById(this.sourceId);
            if(!!source){
                if (creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(source, { visualizePathStyle: { stroke: this.pathColor }});
                }
            }
        }
    }

    // 存储能量
    Target(creep: Creep): any {
        if(!!!this.target){
            this.target = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: function (structure): boolean { 
                        return (structure.structureType == STRUCTURE_TOWER
                            || structure.structureType == STRUCTURE_SPAWN 
                            ||  structure.structureType == STRUCTURE_EXTENSION) 
                            &&  structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                    }});
            if(!!!this.target){
                this.target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: function (structure): boolean { 
                            return (structure.structureType == STRUCTURE_CONTAINER) 
                                &&  structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                        }
                    });
            }
        }
        if(!!this.target && this.target.store[RESOURCE_ENERGY] < this.target.store.getCapacity(RESOURCE_ENERGY)){
            if(creep.transfer(this.target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
                creep.moveTo(this.target, { visualizePathStyle: { stroke: this.pathColor }});
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
            creep.say("🚧 执行存储工作。");
        }
        return creep.memory.working;
    }
}