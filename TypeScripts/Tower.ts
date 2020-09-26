import { IStructureConfig } from "./IStructureConfig"

export class Tower implements IStructureConfig{

    /**
     * Tower 的构造函数
     */
    constructor() {
    }

    Source(tower: Structure): any {
    }

    Target(tower: Structure): any {
    }

    Switch(tower: Structure): boolean  {
        return false;
    }
}