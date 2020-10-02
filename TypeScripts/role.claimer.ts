import { LongDistanceMove } from "./CreepCommonMethod";
import { ICreepConfig } from "./ICreepConfig"

export class Claimer implements ICreepConfig{

    /**
     * Builder 类的构造函数
     * @property color creep 路径的颜色
     */
    constructor(color: string = "#b78a94") {
        this.pathColor = color;
        this.targetRoom = "W23N15";
    }

    // 路径颜色
    pathColor: string;

    // 目标房间
    targetRoom: string;

    // 前往目标房间
    Source(creep: Creep): any {
        LongDistanceMove(creep, this.targetRoom, this.pathColor);
    }

    // 声明房间
    Target(creep: Creep): any {
        const room = creep.room;
        if(!!room.controller){
            // 如果房间存在了就说明已经进入了该房间
            // 移动到房间的控制器并占领
            if (creep.claimController(room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(room.controller, { visualizePathStyle: { stroke: this.pathColor } })
            }
        }
    }

    Switch(creep: Creep): boolean  {
        // 切换工作状态
        // creep 不在目标房间且 creep 之前的工作状态为“工作”
        if(creep.room.name != this.targetRoom && !!creep.memory.working){
            creep.memory.working = false;
            creep.say("🔄 前往目标房间");
        }
        // creep 在目标房间且 creep 之前的工作状态为“不工作”
        if(creep.room.name == this.targetRoom && !!!creep.memory.working){
            creep.memory.working = true;
            creep.say("🚧 执行声明工作。");
        }
        return creep.memory.working;
    }
}