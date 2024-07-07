import { Socket } from "socket.io";
import { judge0 } from "../judge0";
interface Request {
  source_code: string;
  user_id: string;
  language: string;
}
export class CodeEvaluator {
  private judge0: judge0;
  private stdin = "stdin";
  private JUDGE0API_KEY = process.env.JUDGE0API_KEY as string;
  private JUDGE0API_HOST = process.env.JUDGE0API_HOST as string;
  constructor(public socket: Socket) {
    this.judge0 = new judge0(this.JUDGE0API_KEY, this.JUDGE0API_HOST);
    this.init();
  }
  init() {
    this.evaluateCode();
  }
  async evaluateCode() {
    this.socket.on("evalcode", async (request: Request, callback) => {
      const language_id = await this.judge0.getLanguageId(request.language);
      if (!language_id) {
        return callback({
          success: false,
          error: `${request.language} is not supported yet`,
        });
      }
      const readyforJudge = {
        source_code: request.source_code,
        language_id: language_id,
        stdin: this.stdin,
      };
      const result = await this.judge0.executeCode(readyforJudge);
      return callback({ success: true, result });
    });
  }
}
