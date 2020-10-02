import { Mount} from "./Mount"
import { SpawnSystem} from "./role.spawn"
import { FindBrokenHostile } from "./StructureCommonMethod";

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
    // 建筑工作
    for(var structureId in Game.structures) {
        var structure = Game.structures[structureId];
        if(!!structure) {
            if (!!global.hasMounted){
                structure.Work();
            }else{
                // 重新挂载挂载原型扩展方法
                global.hasMounted = false;
                Mount();
            }
        }
    }
}
