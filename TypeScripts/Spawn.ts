import { CreepConfigs, CreepRole } from "./CreepConfig";

export class SpawnSystem{
  /**
   * SpawnSystem 构造函数
   */
  constructor() {
  }

  // Creep 管理
  CreepManager(): void {
      this.ForEverySpawn(spawn => {
        if (spawn.spawning) {
          this.DrawSpawning(spawn);
        }
        else {
          for (const _role of CreepConfigs.CreepRoleOrder) {
            const role = _role as CreepRole
            const amountOfLive = _.filter(Game.creeps, creep => creep && creep.memory.role as unknown as CreepRole === role)
              .filter(creep => creep.memory.room === spawn.room.name)
              .length;
            if (amountOfLive < CreepConfigs.CreepAmounts[role]) {
              for (const creepDef of CreepConfigs.CreepRoleDefinitions[role]) {
                const availableEnergy = spawn.room.energyAvailable;
                if (availableEnergy >= creepDef.cost && !spawn.spawning && this.HasTask(spawn, role)) {
                  spawn.spawnCreep(creepDef.parts, `${spawn.room.name}${spawn.name}${role.toString()}:${Game.time}`, {
                    memory: {
                      role: _role.toString(),
                      room: spawn.room.name,
                      working: false,
                      param: {}
                    }
                  });
                  return;
                }
              }
            }
          }
        }
      });
  }
  

  // 检查角色是否有必要孵化，如果没有任务，则不孵化
  HasTask(spawn: StructureSpawn, creepRole: CreepRole): boolean {
    // 筛选当前不需要孵化的角色
    switch(creepRole) {
      case CreepRole.BUILDER:
        const targets = spawn.room.find(FIND_CONSTRUCTION_SITES);
        if (!!!targets || targets.length == 0) {
            // 孵化者所在房间没有需要建造的建筑
            return false;
        }
      default:
        return true;
    }
  }

  // 显示孵化信息
  DrawSpawning(spawn: StructureSpawn): void {
      if (spawn.spawning) {
        const spawningCreep = Game.creeps[spawn.spawning.name];
        const role = spawningCreep.memory.role as unknown as CreepRole;
        spawn.room.visual.text(
          role?.toString(),
          spawn.pos.x + 1,
          spawn.pos.y,
          {align: 'left', opacity: 0.8});
      }
  }

  // 遍历每个 Spawn，并执行 onSpawn 委托
  ForEverySpawn(onSpawn: (spawn: StructureSpawn) => void): void {
      for (const spawnName in Game.spawns) {
          const spawn = Game.spawns[spawnName];
          onSpawn(spawn);
      }
  }
}