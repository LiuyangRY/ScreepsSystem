import { Profile } from "../Profiler/Decorator";

// 使用 GaleShapley 在字符串索引的二部图之间生成稳定的匹配，可能是不相等的数
@Profile
export class Matcher {
    men: string[];
    women: string[];
    menFree: { [man: string]: boolean };
    womenFree: { [woman: string]: boolean };
    menPrefs: { [man: string]: string[] };
    womenPrefs: { [woman: string]: string[] };
    couples: { [man: string]: string };

    constructor(menPrefs: { [man: string]: string[] }, womenPrefs: { [woman: string]: string[] }) {
        this.menPrefs = menPrefs;
        this.womenPrefs = womenPrefs;
        this.men = _.keys(menPrefs);
        this.women = _.keys(womenPrefs);
        this.menFree = _.zipObject(this.men, _.map(this.men, man => true));
        this.womenFree = _.zipObject(this.women, _.map(this.women, woman => true));
        this.couples = {};
    }

    // 返回 woman 选择 man1 或者 man2
    private Prefers(woman: string, man1: string, man2: string): boolean {
        return _.indexOf(this.womenPrefs[woman], man1) < _.indexOf(this.womenPrefs[woman], man2);
    }

    // 将 man 和 woman 组合
    private Engage(man: string, woman: string): void {
        this.menFree[man] = false;
        this.womenFree[woman] = false;
        _.remove(this.menPrefs[man], w => w == woman);  // 移除 man 提出的 woman
        this.couples[man] = woman;
    }

    // 解散 man 和 woman 的组合
    private Breakup(man: string, woman: string): void {
        this.menFree[man] = true;
        this.womenFree[woman] = true;
        // 在 men 和 women 组合前不要对他们做任何事
        delete this.couples[man];
    }

    // 返回第一个可以组合的自由人
    private NextMan(): string | undefined {
        return _.find(this.men, man => this.menFree[man] && this.menPrefs[man].length > 0);
    }

    // 匹配
    Match(): { [man: string]: string } {
        const MAX_ITERATIONS = 1000;
        let count = 0;
        let man = this.NextMan();
        while(man) {
            if(count > MAX_ITERATIONS) {
                console.log("稳定匹配超时");
                return this.couples;
            }
        }
        const woman = _.first(this.menPrefs[man]);
        if(this.womenFree[woman]) {
            this.Engage(man, woman);
        } else {
            const currentMan = _.findKey(this.couples, w => w == woman);
            if(this.Prefers(woman, man, currentMan)) {
                this.Breakup(currentMan, woman);
                this.Engage(man, woman);
            } else {
                _.remove(this.menPrefs[man], w => w == woman);
            }
            man = this.NextMan();
            count ++;
        }
        return this.couples;
    }
}
    