import { EnergySource, RefillCreep, FindClosestEnergyStorageForObtaining, ObtainTakeMethod, IsEmpty } from "./CreepCommonMethod";
import { ICreepConfig } from "./ICreepConfig"

export class Upgrader implements ICreepConfig{

    /**
     * Upgrader 类的构造函数
     * @property color creep 路径的颜色
     */
    constructor(color: string = "#3ac98f") {
        this.pathColor = color;
        this.ObtainingResourcePointIds = {
            "W42S55": [
                "579fa8f80700be0674d2e937", // 资源点1
            ]
        };
    }

    // 路径颜色
    pathColor: string;

    // 资源获取点编号
    ObtainingResourcePointIds: Record<string, string[]> | undefined;

    // 采集能量
    Source(creep: Creep): any {
        if(!!!creep.memory.source){
            if(!!this.ObtainingResourcePointIds) {
                const resourceIds = this.ObtainingResourcePointIds[creep.room.name];
                for(let resourceIndex in resourceIds) {
                    const source = Game.getObjectById(resourceIds[resourceIndex] as Id<Structure | Resource>);
                    if(!!source) {
                        const method = ObtainTakeMethod(source);
                        if(!!method) {
                            const structure = source as StructureLink | StructureContainer | StructureStorage;
                            if(!!structure.store && structure.store)
                            for(const resourceType in structure.store) {
                                if(!!structure && !IsEmpty({ id: structure.id, take: method }, resourceType as ResourceConstant)) {
                                    creep.memory.source = source.id;
                                    creep.memory.energyTakeMethod = method;
                                    creep.memory.resourceType = resourceType;
                                    return;
                                } else {
                                    // 寻找最近的能量存储设施、能量源或掉落的能量
                                    const energySource: EnergySource | undefined = FindClosestEnergyStorageForObtaining(creep);
                                    if(!!energySource){
                                        creep.memory.source = energySource.id;
                                        creep.memory.energyTakeMethod = energySource.take;
                                    }else{
                                        console.log(`Creep: ${creep.name} 的采集目标不存在。`)
                                        return;
                                    }
                                }
                            }
                        }else {
                            continue;
                        }
                    }
                }
            }else {
                console.log("升级者资源获取点无配置信息，请检查配置。")
            }
        }else{
            RefillCreep(creep, this.pathColor);
        }
    }

    // 升级控制器
    Target(creep: Creep): any {
        if(!!creep.room.controller){
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE){
                creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: this.pathColor }});
            }
        }
    }

    Switch(creep: Creep): boolean  {
        // 切换工作状态
        // creep 身上没有能量且 creep 之前的工作状态为“工作”
        if(creep.store[RESOURCE_ENERGY] <= 0 && !!creep.memory.working){
            creep.memory.working = false;
            creep.say("🔄 执行采集工作。");
        }
        // creep 身上能量已满且 creep 之前的工作状态为“不工作”
        if(creep.store[RESOURCE_ENERGY] >= creep.store.getCapacity() && !!!creep.memory.working){
            creep.memory.working = true;
            creep.say("🚧 执行升级工作。");
        }
        return creep.memory.working;
    }
}