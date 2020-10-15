// 包含玩家信息的全局设置文件

import { leftAngleQuote, rightAngleQuote } from "./Utilities/StringConstants";
import { GetReinforcementLearningTrainingVerbosity, GetUsernamr, OnPublicServer, OnTrainingEnvironment } from "./Utilities/Utils";

/**
 * 作者的 screeps 用户名，用于各种更新和通信。（如果修改该项，可能会破坏一些内容）
 */
export const Muon = "Muon";

/**
 * 我的 screeps 用户名。
 */
export const MY_USERNAME: string = GetUsernamr();

/**
 * Profiling 是非常消耗性能的，并且可能会导致脚本执行超时。通过设置该项，你可以限制分析时处理集群的数量，
 * 超过这个限制的殖民地不会被运行
 */
export const PROFILER_COLONY_LIMIT = Math.ceil(Game.gcl.level / 2);

/**
 * 在进行分析时，确保将这些殖民地包括在PROFILER_COLONY_LIMIT指定的随机选择的殖民地中。
 */
export const PROFILER_INCLUDE_COLONIES: string[] = [/* 'W23N14' */];

/**
 * 启用该项以在每个 try...catch 语句块中封装构造、初始化、运行语句。
 */
export const USE_TRY_CATCH: boolean = true;

/**
 * 限制可以声明的房间数量
 */
export const MAX_OWNED_ROOMS: number = Infinity;

/**
 * 在 Shard3（CPU 限制20）中可以声明的房间数量
 */
export const SHARD3_MAX_OWNED_ROOMS: number = 3;

/**
 * 全局 Overmind 对象将在指定时钟事件后被重新实例化，同时调用 refresh() 方法。
 */
export const NEW_OVERMIND_INTERVAL: number = OnPublicServer() ? 20 : 5;

/**
 * 房间视野主尺度
 */
export const GUI_SCALE = 1.0;

/**
 * 如果将其设置为true，则将得到一个简化版的Overmind，该版本适合在我的python screeps环境中进行训练
 * 将取而代之运行。主循环将被禁用，而 creeps 将基于串行操作来控制
 * 通过内存从RL模型与他们通信。
 * 警告:启用RL_TRAINING_MODE将擦除您的内存内容!
 */
export const RL_TRAINING_MODE = OnTrainingEnvironment();

/**
 * 配置有多少内容被记录到控制台
 * 0: 无日志
 * 1: 每100时钟时间记录一次
 * 2: 每个时钟时间记录一次
 */
export const RL_TRAINING_VERBOSITY = GetReinforcementLearningTrainingVerbosity();

/**
 * 允许从源代码（包括 screeps-profiler）构建。（这与 Overmind-Profiler 不同）
 */
export const USE_PROFILER: boolean = false;

/**
 * 如果该项被启用, Memory.bot 将默认为 true。如果已经使用 SetMode() 方法进行了设置，该项将不会生效。
 */
export const DEFAULT_OPERATION_MODE: OperationMode = 'Automatic';