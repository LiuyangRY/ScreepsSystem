import { CreepConfigs } from "./CreepConfig";

export class SpawnSystem{
    /**
     * SpawnSystem 构造函数
     */
    constructor() {
        this.needSpawningInfo = null;
        this.creepRoleCurrentCount = null;
        this.CreepName = "";
    }
    // 需要生成
    needSpawningInfo: { [key: string]: { SpawnCount: number }} | null;
    // 当前各个角色数量
    creepRoleCurrentCount: { [key: string]: number } | null;
    // 正在生成的 Creep 名称
    CreepName: string;

    // 孵化控制
    SpawnControl(creepConfigs: CreepConfigs = new CreepConfigs()): void{
        // 清理已死亡的 Creep
        for(let creepName in Memory.creeps){
            if(!(creepName in Game.creeps)){
                delete Memory.creeps[creepName];
                console.log(`Creep ${creepName} 已被清理。`);
            }
        }
        
        if(!!!this.needSpawningInfo){
            this.needSpawningInfo = {};
            this.creepRoleCurrentCount = {};
            // 获取每种角色现有数量
            for(let creepName in Game.creeps){
                let creep = Game.creeps[creepName];
                if(creepConfigs.creepRoles.indexOf(creep.memory.role) == -1){
                    console.log(`creep ${creepName} 内存属性 role 值 ${creep.memory.role} 不属于任何已存在的creepConfigs 名称`);
                }else{
                    if(!!this.creepRoleCurrentCount[creep.memory.role]){
                        this.creepRoleCurrentCount[creep.memory.role] += 1;
                    }else{
                        this.creepRoleCurrentCount[creep.memory.role] = 1;
                    }
                }
            }
            // 将每种角色现有数量与配置数量做比较，判断是否需要孵化
            for(let roleConfigKey in creepConfigs.creepSpawningConfig){
                if(!!!this.creepRoleCurrentCount[roleConfigKey] || this.creepRoleCurrentCount[roleConfigKey] == 0){
                    // 如果配置的角色不存在或数量为0，按照配置的数量生成 Creep
                    this.needSpawningInfo[roleConfigKey] = { SpawnCount: creepConfigs.creepSpawningConfig[roleConfigKey].count };
                }else if(!!this.creepRoleCurrentCount[roleConfigKey] && 
                        this.creepRoleCurrentCount[roleConfigKey] < creepConfigs.creepSpawningConfig[roleConfigKey].count){
                    // 如果配置的角色存在，但是数量不足的话，补充至配置的数量
                    this.needSpawningInfo[roleConfigKey] = { SpawnCount: creepConfigs.creepSpawningConfig[roleConfigKey].count - this.creepRoleCurrentCount[roleConfigKey] };
                }
            }
        }
        
        
        // 如果需要孵化，指定孵化器并开始孵化
        for(let spawnName in Game.spawns){
            let spawn = Game.spawns[spawnName];
            if(!!spawn && !spawn.spawning){
                for(let spawnInfo in this.needSpawningInfo){
                    if(!!Game.creeps[this.CreepName]){
                        // 从生成列表中删除已生成的Creep
                        delete this.needSpawningInfo[spawnInfo];
                        break;
                    }
                    // 筛选当前不需要孵化的角色
                    const targets = spawn.room.find(FIND_CONSTRUCTION_SITES);
                    if (!!!targets || targets.length == 0) {
                        // 孵化者所在房间没有需要建造的建筑，因此不生成 Builder
                        if(creepConfigs.creepSpawningConfig[spawnInfo].role.indexOf("builder") > 0){
                            delete this.needSpawningInfo[spawnInfo];
                            break;
                        }
                    }
                    for(let i: number = 0; i < this.needSpawningInfo[spawnInfo].SpawnCount; i++){
                        do{
                            this.CreepName = spawn.name + creepConfigs.creepSpawningConfig[spawnInfo].role + (new Date()).valueOf();
                        }
                        while(!!Game.creeps[this.CreepName])
                        spawn.spawnCreep(creepConfigs.creepSpawningConfig[spawnInfo].bodies, this.CreepName, { memory: { role: creepConfigs.creepSpawningConfig[spawnInfo].role }});
                    }
                }
            }
        }
    }
}