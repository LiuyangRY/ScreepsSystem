import { MountCreep } from "./CreepExtensions";

export function Mount() {
    if(!global.hasMounted)
    {
        MountCreep();

        global.hasMounted = true;
    }
}