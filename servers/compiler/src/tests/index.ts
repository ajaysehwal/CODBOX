// // src/services/compilationService.ts
// import crypto from 'crypto';
// import { ResultCache } from '@cache/resultCache';
// import { CompilationQueue } from '@queue/compilationQueue';
// import { Compiler } from '@compilation/compiler';
// import { Executor } from '@execution/executor';

// export class CompilationService {
//   constructor(
//     private cache: ResultCache,
//     private queue: CompilationQueue,
//     private compiler: Compiler,
//     private executor: Executor
//   ) {
//     this.initializeQueue();
//   }

//   private initializeQueue() {
//     this.queue.process(async (job) => {
//       const { code, language } = job.data;
//       const compiledCode = await this.compiler.compile(code, language);
//       const result = await this.executor.execute(compiledCode);
//       return result;
//     });
//   }

//   async compileAndRun(code: string, language: string): Promise<string> {
//     const cacheKey = this.getCacheKey(code, language);
//     const cachedResult = this.cache.get(cacheKey);
    
//     if (cachedResult) {
//       return cachedResult;
//     }

//     const job = await this.queue.addJob({ code, language });
//     const result = await job.finished();

//     this.cache.set(cacheKey, result);
//     return result;
//   }

//   private getCacheKey(code: string, language: string): string {
//     return crypto.createHash('md5').update(`${language}:${code}`).digest('hex');
//   }
// }


// // src/app.ts
// import { WebSocketServer } from '@websocket/server';
// import { ResultCache } from '@cache/resultCache';
// import { CompilationQueue } from '@queue/compilationQueue';
// import { Compiler } from '@compilation/compiler';
// import { Executor } from '@execution/executor';
// import { CompilationService } from '@services/compilationService';

// const cache = new ResultCache();
// const queue = new CompilationQueue();
// const compiler = new Compiler();
// const executor = new Executor();

// const compilationService = new CompilationService(cache, queue, compiler, executor);
// const wsServer = new WebSocketServer(compilationService);

// console.log('WebSocket server is running on port 8080');