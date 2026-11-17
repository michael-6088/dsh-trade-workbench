// 获客子系统的类型声明。
//
// leads/ 下的 45 个模块是从 dsh-waimao v0.8.0 原样 fork 的纯 JS（共约
// 1.1 万行）。逐行补 TS 标注既无收益也会让后续同步上游 diff 变得困难，
// 因此这些模块不参与 tsc 检查（tsconfig 只 include src/**/*.ts 与 src/**/*.tsx），
// 只在这里声明 Host 半身实际用到的几个入口，其余一律 any。

declare module "./leads/index.js" {
  export function registerLeadsPlugin(
    hostCtx: any,
    options?: { prefix?: string; startCron?: boolean },
  ): { tools: string[]; disposers: Array<() => void> };
  export function apply(ctx: any): void;
  export const inject: string[];
}

declare module "./leads/db.js" {
  export function setLeadsDbPath(path: string): void;
  export function leadsDbPath(): string | null;
  export function getLeadsDb(): any;
  export function closeLeadsDb(): void;
}

declare module "./leads/rpc.js" {
  export function createLeadsRpc(): {
    has(op: string): boolean;
    run(op: string, args: any): Promise<any>;
    ops: string[];
  };
}
