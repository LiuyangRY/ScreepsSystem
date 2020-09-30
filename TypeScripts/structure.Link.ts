import { IStructureConfig } from "./IStructureConfig"
import { StructureConfig } from "./StructureConfig";

export class Link implements IStructureConfig{

    MainLinkConfig: { [key: string]: string } | undefined;

    /**
     * Link 的构造函数
     */
    constructor(structureConfig: StructureConfig = new StructureConfig()) {
        this.MainLinkConfig = structureConfig.mainLinkConfig;
    }

    Source(structure: Structure): any {
    }

    Target(structure: Structure): any {
        if(!!this.MainLinkConfig) {
            const roomName = structure.room.name;
            const mainLinkId: string | undefined = this.MainLinkConfig[roomName];
            if(!!mainLinkId) {
                const linkTo = Game.getObjectById(mainLinkId as Id<StructureLink>);
                if(!!linkTo) {
                    const linkFrom = structure as StructureLink;
                    if(!!linkFrom && linkFrom.cooldown == 0 && linkTo.store.getFreeCapacity(RESOURCE_ENERGY) > 0){
                        const amount = linkFrom.store.getUsedCapacity(RESOURCE_ENERGY) <= linkTo.store.getFreeCapacity(RESOURCE_ENERGY) ?
                            linkFrom.store.getUsedCapacity(RESOURCE_ENERGY) : linkTo.store.getFreeCapacity(RESOURCE_ENERGY);
                        linkFrom.transferEnergy(linkTo, amount);
                    }else {
                        console.log(`连接设施不存在。`);
                    }
                }else {
                    console.log(`主连接设施编号"${mainLinkId}"不存在，请检查设施配置。`);
                }
            }
        }else {
            console.log("主连接设施编号配置不存在，请检查设施配置。");
        }
    }

    Switch(structure: Structure): boolean  {
        // 切换工作状态
        // Link 上没有能量
        const link = structure as StructureLink;
        if(link.store[RESOURCE_ENERGY] <= 0){
            return false;
        }
        // Link 上能量已满且冷却时间为0
        if(link.store[RESOURCE_ENERGY] > 0 && link.cooldown == 0){
            return true;
        }
        return false;
    }
}