import { Mount} from "./Mount"
import { SpawnSystem} from "./role.spawn"

export function loop() {
    // 挂载原型扩展方法
    Mount();
    // 孵化
    new SpawnSystem().SpawnControl();
    // Creep 工作
    for(var creepName in Game.creeps){
        var creep = Game.creeps[creepName];
        if(!!creep){
            if (!!global.hasMounted){
                creep.Work();
            }else{
                // 重新挂载挂载原型扩展方法
                global.hasMounted = false;
                Mount();
            }
        }
    }
    // Tower 攻击入侵者
    for(var roomName in Game.rooms){
        var room = Game.rooms[roomName];
        if(!!room){
            var towers = room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType == STRUCTURE_TOWER 
            });
            if(!!towers){
                for(var tower of towers){
                    var target = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                    if(!!target){
                        tower.attack(target);
                    }
                }
            }
        }
    }
}
