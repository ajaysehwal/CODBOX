import { Judge0 } from "../services/judge0";
import { EvalReuqest } from "../types";
import { Response } from "express";

export class codeEvaluation {
  private readonly stdin = "stdin";
  private judge0: Judge0;
  constructor() {
    this.judge0 = new Judge0();
  }
  async eval(req: EvalReuqest, res: Response) {
    try {
      const language_id = this.judge0.getLanguageId(req.language);
      if (!language_id) {
        res.status(400).json({ error: "Invalid Language" });
        return;
      }
      const result = await this.judge0.executeCode({
        source_code: req.source_code,
        language_id: language_id,
        stdin: this.stdin,
      });
      res.json({ success: true, result });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message });
      return;
    }
  }
}
