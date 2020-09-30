import { StructureConfig } from "./StructureConfig";

const StructureExtensions = {
    // 工作方法
    Work(): void{
        var structureConfig = new StructureConfig();
        structureConfig.Work(this);
    }
}


export function MountStructure() {
    _.assign(Structure.prototype, StructureExtensions);
}