import { ICreepConfig } from "./ICreepConfig"

export class WallRepairer implements ICreepConfig{

    /**
     * WallRepairer 类的构造函数
     * @property color creep 路径的颜色
     */
    constructor(color: string = "#66cc66") {
        this.pathColor = color;
        this.source = undefined;
        this.target = null;
    }

    // 路径颜色
    pathColor: string;

    // 能量源
    source: Structure<StructureConstant> | undefined | null;

    target: Structure<StructureConstant> | null;

    // 采集能量
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

    // 维修墙
    Target(creep: Creep): any {
        if(!!!this.target){
            const targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure: Structure) => (structure.hits < structure.hitsMax ) && (structure.structureType == STRUCTURE_WALL)
            });
            if(!!targets){
                // 找出血量百分比最低的建筑作为目标
                for(let percentage = 0.0001; percentage <= 1; percentage = percentage + 0.0001){
                    this.target = creep.pos.findClosestByPath(targets, {
                        filter: (wall: StructureWall) => (wall.hits / wall.hitsMax < percentage)
                    });
                    if(!!this.target){
                        break;
                    }
                }
            }
            // else{
            //     this.target == null;
            //     creep.say(`🚧 当前没有维修工作，将角色切换为升级者。`);
            //     creep.memory.role = "upgrader";
            // }
        }
        
        if(!!this.target){
            if(creep.repair(this.target) == ERR_NOT_IN_RANGE){
                creep.moveTo(this.target, { visualizePathStyle: { stroke: this.pathColor }});
            }
            if(this.target.hits == this.target.hitsMax){
                creep.say(`🚧 ${this.target.structureType}维修工作已完成。`);
                this.target = null;
            }
        }
    }

    Switch(creep: Creep): boolean  {
        // 切换工作状态
        // creep 身上没有能量且 creep 之前的工作状态为“工作”
        if(creep.store[RESOURCE_ENERGY] <= 0 && !!creep.memory.working){
            creep.memory.working = false;
            creep.say("🔄 执行采集工作");
        }
        // creep 身上能量已满且 creep 之前的工作状态为“不工作”
        if(creep.store[RESOURCE_ENERGY] >= creep.store.getCapacity() && !!!creep.memory.working){
            creep.memory.working = true;
            creep.say("🚧 执行维修工作。");
        }
        return creep.memory.working;
    }
}