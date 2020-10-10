export class TaskConfig {
    /**
     * 任务配置构造函数
     */
    constructor() {
    }
}

// 任务状态
export enum TaskState {
    ABANDONED = "abandoned",
    CREATED = "created",
    UNACCEPTED = "unaccepted",
    ACCEPTED = "accepted",
    UNCOMPLETED = "uncompleted",
    COMPLETED = "completed"
}

// 任务
export class Task {
    /**
     *  任务构造函数
     */
    constructor(createrId: string, targetId: string, action: any, isLoop: boolean = false, loopCount:number = 0) {
        this.CreaterId = createrId;
        this.TargetId = targetId;
        this.Action = action;
        this.IsLoop = isLoop;
        this.LoopCount = loopCount;
        this.State = TaskState.CREATED;
        this.AccepterId = undefined;
    }

    // 创建者编号
    CreaterId: string;

    // 任务目标编号
    TargetId: string;

    // 执行动作
    Action: any;

    // 任务状态
    State: TaskState;

    // 接受者编号
    AccepterId: string | undefined;

    // 是否为循环任务（如果是循环次数，则执行指定次数后停止，否则将一直执行）
    IsLoop: boolean;

    // 循环次数
    LoopCount: number;
}