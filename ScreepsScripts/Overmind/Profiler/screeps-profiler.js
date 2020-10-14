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

// 连接属性
function HookUpPrototypes() {
    Profiler.prototypes.forEach(proto => {
        profileObjectFunctions(proto.val, proto.name);
    });
}

// 配置对象方法
function ProfileObjectFunctions(object, label) {
    if(object.prototype) {
        ProfileObjectFunctions(object.prototype, label);
    }
    const objectToWrap = object;

    Object.getOwnPropertyNames(objectToWrap).forEach(functionName => {
        const extendedLabel = `${label}.${functionName}`;

        const isBlackListed = functionBlackList.indexOf(functionName) !== -1;
        if(isBlackListed) {
            return;
        }

        const descriptor = Object.getOwnPropertyDescriptor(objectToWrap, functionName);
        if(!descriptor) {
            return;
        }

        const hasAccessor = descriptor.get || descriptor.set;
        if(hasAccessor) {
            const configurable = descriptor.configurable;
            if(!configurable) {
                return;
            }

            const profileDescriptor = {};

            if(descriptor.get) {
                const extendedLabelGet = `${extendedLabel}:get`;
                profileDescriptor.get = ProfileFunction(descriptor.get, extendedLabelGet);
            }

            if(descriptor.set) {
                const extendedLabelSet = `${extendedLabel}:set`;
                profileDescriptor.set = ProfileFunction(descriptor.set, extendedLabelSet);
            }

            Object.defineProperty(objectToWrap, functionName, profileDescriptor);
            return;
        }

        const isFunction = typeof descriptor.value === "function";
        if(!isFunction || !descriptor.writable) {
            return;
        }
        const originalFunction = objectToWrap[functionName];
        objectToWrap[functionName] = ProfileFunction(originalFunction, extendedLabel);
    });
    return objectToWrap;
}

// 配置函数
function ProfileFunction(fn, functionName) {
    const fnName = functionName || fn.name;
    if(!fnName) {
        console.log("无法发现函数：", fn);
        console.log("无法配置该函数。");
        return fn;
    }
    return WrapFunction(fnName, fn);
}

// 配置
const Profiler = {
    // 打印配置
    PrintProfile() {
        console.log(Profiler.output());
    },

    // 将配置以邮件发送
    EmailProfile() {
        Game.notify(Profiler.output(1000));
    },
    
    // 调用磨工作
    CallGrind() {
        const elapsedTicks = Game.time - Memory.profiler.enabledTick + 1;
        Memory.profiler.map["(tick)"].calls = elapsedTicks;
        Memory.profiler.map["(tick)"].time = Memory.profiler.totalTime;
        Profiler.checkMapItem("(root)");
        Memory.profiler.map["(root)"].calls = 1;
        Memory.profiler.map["(root)"].time = Memory.profiler.totalTime;
        Profiler.checkMapItem("(tick)", Memory.profiler.map["(root)"].subs);
        Memory.profiler.map["(root)"].subs["(tick)"].calls = elapsedTicks;
        Memory.profiler.map["(root)"].subs["(tick)"].time = Memory.profiler.totalTime;
        let body = `事件: ns\n概述:${Math.round(Memory.profiler.totalTime * 1000000)}\n`;
        for(const fnName of Object.keys(Memory.profiler.map)) {
            const fn = Memory.profiler.map[fnName];
            let callsBody = "";
            let callsTime = 0;
            for(const callName of Object.keys(fn.subs)) {
                const call = fn.subs[callName];
                const ns = Math.round(call.time * 1000000);
                callsBody += `cfn=${callName}\ncalls=$${call.calls} 1\n1 ${ns}\n`;
                callsTime += call.time;
            }
            body += `\nfn=${fnName}\n1 ${Math.round((fn.time - callsTime) * 1000000)}\n ${callsBody}`;
        }
        return body;
    },

    // 输出
    OutPut(passedOutputLengthLimit) {
        const outputLengthLimit = passedOutputLengthLimit || 1000;
        if(!Memory.profiler || !Memory.profiler.enabledTick) {
            return "配置未激活";
        }

        const endTick = Math.min(Memory.profiler.disableTick || Game.time, Game.time);
        const startTick = Memory.profiler.enabledTick + 1;
        const elapsedTicks = endTick - startTick;
        const header = "调用\t\t事件\t\t平均\t\t函数";
        const footer = [
            `平均: ${(Memory.profiler.totalTime / elapsedTicks).toFixed(2)}`,
            `全部: ${Memory.profiler.totalTime.toFixed(2)}`,
            `时钟: ${elapsedTicks}`
        ].join("\t");

        const lines = [header];
        let currentLength = header.length + 1 + footer.length;
        const allLines = Profiler.Lines();
        let done = false;
        while(!done && allLines.length) {
            const line = allLines.shift();
            // 新增行后，增加行的长度
            if(currentLength + line.length + 1 < outputLengthLimit) {
                lines.push(line);
                currentLength += line.length + 1;
            } else {
                done = true;
            }
        }
        lines.push(footer);
        return lines.join("\n");
    },

    // 格式化输出信息
    Lines() {
        const stats = Object.keys(Memory.profiler.map).map(functionName => {
            const functionCalls = Memory.profiler.map[functionName];
            return {
                name: functionName,
                calls: functionCalls.calls,
                totalTime: functionCalls.time,
                averageTime: functionCalls.time / functionCalls.calls
            };
        }).sort((val1, val2) => {
            return val2.totalTime - val1.totalTime;
        });

        const lines = stats.map(data => {
            return [
                data.calls,
                data.totalTime.toFixed(1),
                data.averageTime.toFixed(3),
                data.name
            ].join("\t\t");
        });
        return lines;
    },

    // 属性
    prototypes: [
        {name: "Game", val: global.Game},
        {name: "Map", val: global.Game.map},
        {name: "Market", val: global.Game.market},
        {name: "PathFinder", val: global.PathFinder},
        {name: "RawMemory", val: global.RawMemory},
        {name: "ConstructionSite", val: global.ConstructionSite},
        {name: "Creep", val: global.Creep},
        {name: "Flag", val: global.Flag},
        {name: "Mineral", val: global.Mineral},
        {name: "Nuke", val: global.Nuke},
        {name: "OwnedStructure", val: global.OwnedStructure},
        {name: "CostMatrix", val: global.PathFinder.CostMatrix},
        {name: "Resource", val: global.Resource},
        {name: "Room", val: global.Room},
        {name: "RoomObject", val: global.RoomObject},
        {name: "RoomPosition", val: global.RoomPosition},
        {name: "RoomVisual", val: global.RoomVisual},
        {name: "Source", val: global.Source},
        {name: "Structure", val: global.Structure},
        {name: "StructureContainer", val: global.StructureContainer},
        {name: "StructureController", val: global.StructureController},
        {name: "StructureExtension", val: global.StructureExtension},
        {name: "StructureExtractor", val: global.StructureExtractor},
        {name: "StructureKeeperLair", val: global.StructureKeeperLair},
        {name: "StructureLab", val: global.StructureLab},
        {name: "StructureLink", val: global.StructureLink},
        {name: "StructureNuker", val: global.StructureNuker},
        {name: "StructureObserver", val: global.StructureObserver},
        {name: "StructurePowerBank", val: global.StructruePowerBank},
        {name: "StructurePowerSpawn", val: global.StructureSpawn},
        {name: "StructurePortal", val: global.StructurePortal},
        {name: "StructureRampart", val: global.StructureRampart},
        {name: "StructureRoad", val: global.StructureRoad},
        {name: "StructureSpawn", val: global.StructureSpawn},
        {name: "StructureStorage", val: global.StructureStorage},
        {name: "StructureTerminal", val: global.StructureTerminal},
        {name: "StructureTower", val: global.StructureTower},
        {name: "StructureWall", val: global.StructureWall}
    ],

    // 检查映射项
    CheckMapItem(functionName, map = Memory.profiler.map) {
        if(!map[functionName]) {
            map[functionName] = {
                time: 0,
                calls: 0,
                subs: {}
            };
        }
    },

    // 记录
    Record(functionName, time, parent) {
        this.CheckMapItem(functionName);
        Memory.profiler.map[functionName].calls++;
        Memory.profiler.map[functionName].time += time;
        if(parent) {
            this.CheckMapItem(parent);
            this.CheckMapItem(functionName, Memory.profiler.map[parent].subs);
            Memory.profiler.map[parent].subs[functionName].calls ++;
            Memory.profiler.map[parent].subs[functionName].time += time;
        }
    },

    // 终止时钟
    EndTick() {
        if(Game.time >= Memory.profiler.enabledTick) {
            const cpuUsed = Game.cpu.getUsed();
            Memory.profiler.totalTime += cpuUsed;
            Profiler.Report();
        }
    },

    // 报告
    Report() {
        if(Profiler.ShouldPrint()) {
            Profiler.PrintProfile();
        } else if(Profiler.ShouldEmail()) {
            Profiler.EmailProfile();
        }
    },

    // 是否分析
    IsProfiling() {
        if(!enabled || !Memory.profiler) {
            return false;
        }
        return !Memory.profiler.disableTick || Game.time <= Memory.profiler.disableTick;
    },

    // 类型
    Type() {
        return Memory.profiler.type;
    },

    // 是否应该打印
    ShouldPrint() {
        const streaming = Profiler.Type() === "stream";
        const profiling = Profiler.Type() === "profile";
        const onEndingTick = Memory.profiler.disableTick === Game.time;
        return streaming || (profiling && onEndingTick);
    },

    // 是否应该发邮件
    ShouldEmail() {
        return Profiler.Type() === "email" && Memory.profiler.disableTick === Game.time;
    }
};

module.exports = {
    Wrap(callback) {
        if(enabled) {
            SetupProfiler();
        }

        if(Profiler.IsProfiling()) {
            usedOnStart = Game.cpu.getUsed();

            // 注释行是保持配置系统性能的一部分，并衡量特定类型的开销
            const returnVal = callback();
            Profiler.EndTick();
            return returnVal;
        }
        return callback();
    },

    Enable() {
        enabled = true;
        HookUpPrototypes();
    },

    Output: Profiler.OutPut,
    CallGrind: Profiler.CallGrind,
    
    RegisterObject: ProfileObjectFunctions,
    RegisterFN: ProfileFunction,
    RegisterClass: ProfileObjectFunctions
};