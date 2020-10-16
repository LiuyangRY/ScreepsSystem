import { Mem } from "./Memory/Memory";

// 主循环
function main(): void {
    // 加载并清理内存，必要时暂停操作
    Mem.Load();         // 如果存在，则加载解析过的内存
    if(!Mem.ShouldRun()) {
        return;         // 如果必要的话，延迟运行
    }
    Mem.Clean();        // 清理内存内容

    // 实例化操作：构建或刷新游戏状态
    if(!Overmind || Overmind.shouldBuild || Game.time >= Overmind.expiration) {
        delete global.Overmind;                 // 删除以前的 Overmind 对象
        Mem.GarbageCollect(true);               // 快速清理内存垃圾
    }
}