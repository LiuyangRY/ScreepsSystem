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
            if(creep.memory.role == "claimer"){
                // 要占领的房间
                const room = Game.rooms['W23N15'];
                // 如果该房间不存在就先往房间走
                if (!!!room) {
                    creep.moveTo(new RoomPosition(25, 25, 'W23N15'), { visualizePathStyle: { stroke: "#b78a94" } })
                }
                else {
                    if(!!room.controller){
                        // 如果房间存在了就说明已经进入了该房间
                        // 移动到房间的控制器并占领
                        if (creep.claimController(room.controller) == ERR_NOT_IN_RANGE) {
                            creep.moveTo(room.controller, { visualizePathStyle: { stroke: "#b78a94" } })
                        }
                    }
                }
                continue;
            }
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
