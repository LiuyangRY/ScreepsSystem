import { IStructureConfig } from "./IStructureConfig"
import { FindBrokenHostile } from "./StructureCommonMethod";

export class Tower implements IStructureConfig{

    Hostiles: Creep[] | undefined;

    /**
     * Tower 的构造函数
     */
    constructor() {
        this.Hostiles = undefined;
    }

    Source(structure: Structure): any {
    }

    Target(structure: Structure): any {
        const tower = structure as StructureTower;
        let target: Creep | undefined;
        if(!!tower) {
            target = FindBrokenHostile(tower, this.Hostiles);
        }else {
            console.log("炮塔不存在。");
        }

        if(!!target){
            tower.attack(target);
        }else {
            this.Hostiles = undefined;
        }
    }

    Switch(structure: Structure): boolean  {
        // 切换工作状态
        // tower 能量大于500且所在房间没有敌人
        const tower = structure as StructureTower;
        const hostiles = tower.room.find(FIND_HOSTILE_CREEPS);
        if(tower.store[RESOURCE_ENERGY] <= 500 && (!!!hostiles || hostiles.length == 0)){
            this.Hostiles = undefined;
            return false;
        }
        // tower 有能量且所在房间有敌人
        if(tower.store[RESOURCE_ENERGY] > 0 && !!hostiles && hostiles.length > 0){
            this.Hostiles = hostiles;
            return true;
        }
        return false;
    }
}