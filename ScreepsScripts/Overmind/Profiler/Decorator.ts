import { USE_PROFILER } from "../~Settings";
import profiler from "./screeps-profiler";

export function Profile(target: Function): void;
export function Profile(target: object, key: string | symbol, _descriptor: TypedPropertyDescriptor<Function>): void;
export function Profile(target: object | Function, key?: string | symbol, _descriptor?: TypedPropertyDescriptor<Function>): void {
    if(!USE_PROFILER) {
        return;
    }
    if(key) {
        // 方法装饰器
        profiler.RegisterFN(target as Function, key as string);
        return;
    }
    // 类装饰器
    const ctor = target as any;
    if(!ctor.prototype) {
        return;
    }

    const className = ctor.name;
    profiler.RegisterClass(target as Function, className);
}