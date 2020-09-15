import { ICreepConfig } from "./ICreepConfig"

export class Builder implements ICreepConfig{

    /**
     * Builder 类的构造函数
     * @property color creep 路径的颜色
     */
    constructor(color: string = "#cbcb41") {
        this.pathColor = color;
        this.source = undefined;
        this.target = null;
    }

    // 路径颜色
    pathColor: string;

    // 能量源
    source: Source | undefined | null;

    target: ConstructionSite<BuildableStructureConstant> | null;

    // 采集能量
    Source(creep: Creep): any {
        this.source = creep.pos.findClosestByRange(FIND_SOURCES,{
            filter: function (source): boolean { 
                return source.energy > 0
            }
        });
        // if(!!!this.sourceId){
        //     this.sourceId = creep.pos.findClosestByRange(FIND_SOURCES,{
        //         filter: function (source): boolean { 
        //             return source.energy > 0
        //         }
        //     })?.id;
        // }
        if(!!this.source){
            if (creep.harvest(this.source) == ERR_NOT_IN_RANGE) {
                creep.moveTo(this.source, { visualizePathStyle: { stroke: this.pathColor }});
            }
        }
    }

    // 建造建筑
    Target(creep: Creep): any {
        if(!!!this.target){
            const targets = creep.room.find(FIND_CONSTRUCTION_SITES);
            if(!!targets && targets.length > 0){
                this.target = targets[0];
            }
            // else{
            //     creep.say(`🚧 当前没有建造工作，将角色切换为升级者。`);
            //     creep.memory.role = "repairer";
            // }
        }
        
        if(!!this.target){
            if(creep.build(this.target) == ERR_NOT_IN_RANGE){
                creep.moveTo(this.target, { visualizePathStyle: { stroke: this.pathColor }});
            }
            if(this.target.progress == this.target.progressTotal){
                creep.say(`🚧 ${this.target.structureType}建造工作已完成。`);
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
            creep.say("🚧 执行建造工作。");
        }
        return creep.memory.working;
    }
}