import express from "express";
import { codeEvaluation } from "../controllers/evaluateCode";
const router = express.Router();

router.post("/evaluate", async (req, res) =>
  new codeEvaluation().eval(req.body, res)
);

export default router;
