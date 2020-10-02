import { LongDistanceMove } from "./CreepCommonMethod";
import { ICreepConfig } from "./ICreepConfig"

export class Attacker implements ICreepConfig{

    /**
     * Attacker 类的构造函数
     * @property color creep 路径的颜色
     */
    constructor(color: string = "#bc1616") {
        this.pathColor = color;
        this.targetRoomName = "W23N15";
    }

    // 路径颜色
    pathColor: string;

    // 目标房间名称
    targetRoomName: string | undefined;

    // 目标编号
    static targetIds: string[] = ["5f5759984ac9e3151270c41e", "5f5757604cd73a6bd6c398b0", "5f5754c159bb078d24415734", "5f4ca302eba1feaef30c6fdb", "5f4ca30b587162052550fada", "5f4ca126ff89cb8680456a6b", "5f4ca13509de0f90f44a8180", "5f4ca1496336e472c7284c9a"];

    // 前往目标房间
    Source(creep: Creep): any {
        if(!!this.targetRoomName && creep.room.name != this.targetRoomName) {
            // 不在目标房间
            LongDistanceMove(creep, this.targetRoomName, this.pathColor);
            return;
        }
    }

    // 攻击目标
    Target(creep: Creep): any {
        if(!!!creep.memory.target) {
            if (!!Attacker.targetIds) {
                let targetId = Attacker.targetIds.shift();
                if(!!targetId){
                    creep.memory.target = targetId;
                }
            }
        }
        const target = Game.getObjectById(creep.memory.target as Id<Creep | PowerCreep | Structure>);
        if (!!target && target.hits > 0) {
            if(creep.attack(target) == ERR_NOT_IN_RANGE) {
                creep.moveTo(target, { visualizePathStyle: { stroke: this.pathColor }});
            }
        }else {
            creep.memory.target = undefined;
        }
    }

    Switch(creep: Creep): boolean  {
        // 切换工作状态
        // creep 不在目标房间且 creep 之前的工作状态为“工作”
        if(creep.room.name != this.targetRoomName && !!creep.memory.working){
            creep.memory.working = false;
            creep.say("🔄 前往目标房间");
        }
        // creep 在目标房间且 creep 之前的工作状态为“不工作”
        if(creep.room.name == this.targetRoomName && !!!creep.memory.working){
            creep.memory.working = true;
            creep.say("🚧 执行声明工作。");
        }
        return creep.memory.working;
    }
    
}