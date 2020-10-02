import { CreepConfigs, CreepRole } from "./CreepConfig";

const CreepExtensions = {
    // 工作方法
    Work(): void{
        var creepConfig = new CreepConfigs();
        let roleName = this.memory.role;
        if(!!roleName){
            let creepRole = roleName as CreepRole;
            if(!!!creepRole){
                console.log(`creep ${this.name} 内存属性 role  值 ${roleName} 不属于任何已存在的creepConfigs 名称。`);
                return;
            }else{
                creepConfig.Work(this);
            }
        }else{
            console.log(`creep ${this.name} 内存属性 role 不存在。`);
        }
    }
}


export function MountCreep() {
    _.assign(Creep.prototype, CreepExtensions);
}