import express from "express";
import serverhealthRoutes from "./health";
import codeEvaluationRoutes from "./codeEvalRoutes";
import filesManagerRoutes from "./fileRoutes";
const router = express.Router();
router.use("/", serverhealthRoutes);
router.use("/v1", codeEvaluationRoutes);
router.use("/file", filesManagerRoutes);
export default router;
