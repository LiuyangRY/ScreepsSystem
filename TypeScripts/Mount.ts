import { MountCreep } from "./CreepExtensions";
import { MountStructure } from "./StructureExtensions";

export function Mount() {
    if(!global.hasMounted)
    {
        MountCreep();

        MountStructure();

        global.hasMounted = true;
    }
}