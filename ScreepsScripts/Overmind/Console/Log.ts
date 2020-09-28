import { Color } from "../Utilities/Utils";

// 日志等级枚举
export enum LogLevels {
    ERROR,      // Log.Level = 0
    WARNING,    // Log.Level = 1
    ALERT,      // Log.Level = 2
    INFO,       // Log.Level = 3
    DEBUG,      // Log.Level = 4
}

// 默认日志等级为信息
export const LOG_LEVEL: number = LogLevels.INFO;

// 是否在输出日志时显示当前 Tick 数
export const LOG_PRINT_TICK: boolean = true;

// 是否显示源代码的行数
export const LOG_PRINT_LINES: boolean = false;

// 加载源代码映射并显示 Typescript 中的代码行数
export const LOG_LOAD_SOURCE_MAP: boolean = false;

// 源文件链接对齐最大值（用于日志输出对齐）
export const LOG_MAX_PAD: number = 100;

// VSC 位置，用于创建源文件链接。 仓库和版本信息将在 git 构建时填充。
export const LOG_VSC = { repo: "@@_repo_@@", revision: "@@_revision_@@", valid: false };

// VSC 链接的 URL 模板，用于 GitHub 和 GitLab
export const LOG_VSC_URL_TEMPLATE = (path: string, line: string) => {
    return `${LOG_VSC.repo}/blob/${LOG_VSC.revision}/${path}#${line}`;
};

// <调用位置> (<源文件>:<行号>:<列号>)
const StackLineRe = /([^]*\(([^:]*):([0-9]*):([0-9]*)\))/;
const FATAL = -1;
const FatalColor = "#D65156";

// 源代码位置
interface SourcePos {
    Compiled: string;
    Final: string;
    Original: string | undefined;
    Caller: string | undefined;
    Path: string | undefined;
    Line: number | undefined;
}

// 查找源代码位置
export function Resolve(fileLine: string): SourcePos {
    const split = _.trim(fileLine).match(StackLineRe);
    if(!split || !Log.SourceMap) {
        return { Compiled: fileLine, Final: fileLine } as SourcePos;
    }

    const pos = { column: parseInt(split[4], 10), line: parseInt(split[3], 10) };
    const original = Log.SourceMap.OriginalPositionFor(pos);
    const line = `${split[1]} (${original.Source}:${original.line})`;
    const out = {
        Caller      : split[1],
        Compiled    : fileLine,
        Final       : line,
        Line        : original.line,
        Original    : line,
        Path        : original.source  
    };
    return out;
}

// 创建 VSC 链接
function MakeVSCLink(pos: SourcePos): string {
    if(LOG_VSC.valid || !pos.Caller || !pos.Path || !pos.Line || !pos.Line || !pos.Original) {
        return pos.Final;
    }
    return Link(VSCUrl(pos.Path, `L${pos.Line.toString()}`), pos.Original);
}

// 提示工具
function Tooltip(str: string, tooltip: string): string {
    return `<abbr title="${tooltip}">${str}</abbr>`;
}

// VSC链接
function VSCUrl(path: string, line: string): string {
    return LOG_VSC_URL_TEMPLATE(path, line);
}

// 链接
function Link(href: string, title: string): string {
    return `<a href="${href}" target="_blank">${title}</a>`;
}

// 时间
function Time(): string {
    return Color(Game.time.toString(), "gray");
}

// Log 类为在 Screeps 控制台中显示固定格式的信息提供方法
export class Log {
    static SourceMap: any;

    static LoadSourceMap() {
        console.log("源代码映射已被弃用");
    }

    get Level(): number {
        return Memory.settings.log.level;
    }

    SetLogLevel(value: number) {
        let changeValue = true;
        switch (value) {
            case LogLevels.ERROR:
                console.log(`日志等级设置为${value}，显示：ERROR。`);
                break;
            case LogLevels.WARNING:
                console.log(`日志等级设置为${value}，显示：ERROR, WARNING。`);
                break;
            case LogLevels.ALERT:
                console.log(`日志等级设置为${value}，显示：ERROR, WARNING,ALERT。`);
                break;
            case LogLevels.INFO:
                console.log(`日志等级设置为${value}，显示：ERROR, WARNING,ALERT,INFO。`);
                break;
            case LogLevels.DEBUG:
                console.log(`日志等级设置为${value}，显示：ERROR, WARNING,ALERT,INFO,DEBUG。`);
                break;
            default:
                console.log(`无效输入: ${value}. 日志等级只能被设置为 `
							+ LogLevels.ERROR + ' 至 ' + LogLevels.DEBUG + ', 之间的整数.');
				changeValue = false;
				break;
        }
        if(changeValue){
            Memory.settings.log.level = value;
        }
    }

    get ShowSource(): boolean {
        return Memory.settings.log.showSource;
    }

    get ShowTick(): boolean {
        return Memory.settings.log.showTick;
    }

    set ShowTick(value: boolean) {
        Memory.settings.log.showTick = value;
    }

    private _maxFileString: number = 0;

    /**
     * Log 构造函数
     */
    constructor() {
        _.defaultsDeep(Memory, {
            settings: {
                log: {
                    level: LOG_LEVEL,
                    showSource: LOG_PRINT_LINES,
                    showTick: LOG_PRINT_TICK
                }
            }
        });
    }


    Trace(error: Error): Log {
        if(this.Level >= LogLevels.ERROR && error.stack) {
            console.log(this.ResolveStack(error.stack));
        }
        return this;
    }

    Throw(e: Error) {
        console.log.apply(this, this.BuildArguments(FATAL).concat([Color(e.toString(), FatalColor)]));
    }

    Error(...args: any[]): undefined {
        if(this.Level >= LogLevels.ERROR) {
            console.log.apply(this, this.BuildArguments(LogLevels.ERROR).concat([].slice.call(args)));
        }
        return undefined;
    }

    Warning(...args: any[]): undefined {
        if(this.Level >= LogLevels.WARNING) {
            console.log.apply(this, this.BuildArguments(LogLevels.WARNING).concat([].slice.call(args)));
        }
        return undefined;
    }

    Alert(...args: any[]): undefined {
        if(this.Level >= LogLevels.ALERT) {
            console.log.apply(this, this.BuildArguments(LogLevels.ALERT).concat([].slice.call(args)));
        }
        return undefined;
    }

    Notify(message: string): undefined {
        this.Alert(message);
        Game.notify(message);
        return undefined;
    }

    Info(...args: any[]): undefined {
        if(this.Level >= LogLevels.INFO) {
            console.log.apply(this, this.BuildArguments(LogLevels.INFO).concat([].slice.call(args)));
        }
        return undefined;
    }

    Debug(...args: any[]) {
        if(this.Level >= LogLevels.DEBUG) {
            console.log.apply(this, this.BuildArguments(LogLevels.DEBUG).concat([].slice.call(args)));
        }
    }

    DebugCreep(creep: { name: string, memory: any, pos: RoomPosition }, ...args: any[]) {
        if(creep.memory && creep.memory.debug) {
            this.Debug(`${creep.name} @ ${creep.pos.print}:`, args);
        }
    }

    PrintObject(obj: any) {
        console.log.apply(this, this.BuildArguments(LogLevels.DEBUG).concat(JSON.stringify(obj)));
    }

    GetFileLine(upStack = 4): string {
        const stack = new Error("").stack;

        if(stack) {
            const lines = stack.split("\n");
            if(lines.length > upStack) {
                const originalLines = _.drop(lines, upStack).map(Resolve);
                const hoverTest = _.map(originalLines, "final").join("&#10;");
                return this.AdjustFileLine(
                  originalLines[0].Final,
                  Tooltip(MakeVSCLink(originalLines[0]), hoverTest)
                );
            }
        }
    }

    private BuildArguments(level: number): string[] {
        const out: string[] = [];
        switch(level) {
            case LogLevels.ERROR:
                out.push(Color("ERROR ", "red"));
                break;
            case LogLevels.WARNING:
                out.push(Color("WARNING ", "orange"));
                break;
            case LogLevels.ALERT:
                out.push(Color("ALERT ", "yellow"));
                break;
            case LogLevels.INFO:
                out.push(Color("INFO ", "green"));
                break;
            case LogLevels.DEBUG:
                out.push(Color("DEBUG ", "gray"));
                break;
            case FATAL:
                out.push(Color("FATAL ", FatalColor));
                break;
            default:
                break;
        }
        if(this.ShowTick) {
            out.push(Time());
        }
        if(this.ShowSource && level <= LogLevels.ERROR) {
            out.push(this.GetFileLine());
        }
        return out;
    }

    private ResolveStack(stack: string): string {
        if(!Log.SourceMap) {
            return stack;
        }
        return _.map(stack.split("\n").map(Resolve), "final").join("\n");
    }

    private AdjustFileLine(visibleText: string, line: string): string {
        const newPad = Math.max(visibleText.length, this._maxFileString);
        this._maxFileString = Math.min(newPad, LOG_MAX_PAD);

        return `|${_.padRight(line, line.length + this._maxFileString - visibleText.length, " ")}|`;
    }
}

if(LOG_LOAD_SOURCE_MAP) {
    Log.LoadSourceMap();
}

export const log = new Log();