import { IStructureConfig } from "./IStructureConfig"

export class Link implements IStructureConfig{

    /**
     * Link 的构造函数
     */
    constructor() {
    }

    Source(link: Structure): any {
    }

    Target(link: Structure): any {
    }

    Switch(link: Structure): boolean  {
        return false;
    }
}