/**
 * structure 配置项
 * @property prepare 准备阶段执行的方法
 * @property isReady 是否准备完成
 * @property source A阶段执行的方法
 * @property target B阶段执行的方法
 * @property switch 更新状态是是触发的方法
 */
export interface IStructureConfig {
    Prepare?: (structure: Structure) => any;
    IsReady?: (structure: Structure) => boolean;
    Target?: (structure: Structure) => any;
    Source?: (structure: Structure) => any;
    Switch?: (structure: Structure) => boolean;
}