"use strict"

// 这是 https://github.com/samogot/screeps-profiler 的修改版本
let usedOnStart = 0;
let enabled = false;
let depth = 0;
let parentFn = "(tick)";

// 已被包装的异常
function AlreadyWarppedError() {
    this.name = "AlreadyWrappedError";
    this.message = "Error attempted to double wrap a function.";
    this.stack = ((new Error())).stack;
}

// 设置分析器
function SetupProfiler() {
    depth = 0;  // 重置深度，每次循环都需要重置
    parentFn = "(tick)";
    Game.profiler = {
        Stream(duration, filter) {
            SetupMemory("stream", duration || 10, filter);
        },
        Email(duration, filter) {
            SetupMemory("email", duration || 100, filter);
        },
        Profile(duration, filter) {
            SetupMemory("profile", duration || 100, filter);
        },
        Background(filter) {
            SetupMemory("background", false, filter);
        },
        Callgrind() {
            const id = `id${Math.random()}`;
            const download = `
            <script>
                var element = document.getElementById("${id}");
                if(!element) {
                    element = document.createElement("a");
                    element.setAttribute("id", "${id}");
                    element.setAttribute("href", "data: text/plain; charset= utf-8, ${encodeURIComponent(Profiler.callgrind())}");
                    element.setAttribute("download", "callgrind.out.${Game.time}");
                    element.style.display = "none";
                    document.body.appendChild(element);
                    element.click();
                }
            </script>
            `;
            console.log(download.split("\n").map((s) => s.trim()).join(""));
        },
        Restart() {
            if(Profiler.isProfiling()) {
                const filter = Memory.profiler.filter;
                let duration = false;
                if(!!Memory.profiler.disableTick) {
                    // 计算初始间隔，分析器在第一次被调用时被启用，因此次数加1
                    duration = Memory.profile.disableTick - Memory.profiler.enabledTick + 1;
                }
                const type = Memory.profiler.type;
                SetupMemory(type, duration, filter);
            }
        },
        reset: resetMemory,
        output: Profiler.output,
    };
    OverloadCPUCalc();
}

// 设置内存
function SetupMemory(profileType, duration, filter) {
    ResetMemory();
    const disableTick = Number.isInteger(duration) ? Game.time + duration : false;
    if(!Memory.profiler) {
        Memory.profiler = {
            map: {},
            totalTime: 0,
            enabledTick: Game.time + 1,
            disableTick,
            type: profileType,
            filter
        };
    }
}

// 重置内存
function ResetMemory() {
    Memory.profiler = null;
}

// CPU过载计算
function OverloadCPUCalc() {
    if(Game.rooms.sim) {
        usedOnStart = 0; // 只有在模拟环境中才需要被重置
        Game.cpu.getUsed = function getUsed() {
            return performance.now() - usedOnStart;
        };
    }
}

// 获取过滤器
function GetFilter() {
    return Memory.profiler.filter;
}

// 函数黑名单
const functionBlackList = [
    "getUsed",  // 避免包装这个方法，可能会导致递归问题，而且应该减少性能消耗
    "constructor",  // ES6 中类的构造需要使用 “new” 关键字
];

// 公共属性
const commonProperties = ["length", "name", "arguments", "caller", "prototype"];

// 包装函数
function WrapFunction(name, originalFunction) {
    if(originalFunction.profilerWrapped) {
        throw new AlreadyWarppedError();
    }

    function WrappedFunction() {
        if(Profiler.isProfiling()) {
            const nameMatchesFilter = name === GetFilter();
            const start = Game.cpu.getUsed();
            if(nameMatchesFilter) {
                depth++;
            }
            const curParent = parentFn;
            parentFn = name;
            let result;
            if(this && this.constructor === WrappedFunction) {
                result = new originalFunction(...arguments);
            } else {
                result = originalFunction.apply(this, arguments);
            }
            parentFn = curParent;
            if(depth > 0 || !GetFilter()) {
                const end = Game.cpu.getUsed();
                Profiler.record(name, end - start, parentFn);
            }
            if(nameMatchesFilter) {
                depth--;
            }
            return result;
        }

        if(this && this.constructor === WrappedFunction) {
            return new originalFunction(...arguments);
        }
        return originalFunction.apply(this, arguments);
    }

    WrappedFunction.profilerWrapped = true;
    WrappedFunction.toString = () => 
        `// screeps-profiler wrapped function:\n${originalFunction.toString()}`;

    Object.getOwnPropertyNames(originalFunction).forEach(property => {
        if(!commonProperties.includes(property)) {
            WrappedFunction[property] = originalFunction[property];
        }
    });
}