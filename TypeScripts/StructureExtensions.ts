import { StructureConfig } from "./StructureConfig";

const StructureExtensions = {
    // 工作方法
    Work(): void{
        var structureConfig = new StructureConfig();
        structureConfig.Work(this);
    }
}


export function MountCreep() {
    _.assign(Structure.prototype, StructureExtensions);
}