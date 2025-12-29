const express = require("express");
const router = express.Router();
const JobRequest_table = require("../model/JobRequest");
const dbdx = require("../instance/ms_instance_center");
const constance = require("../constance/constance");
const fsExtra = require("fs-extra");
const formidable = require("formidable");

router.post("/insert", async (req, res) => {
  try {
    const form = new formidable.IncomingForm();
    form.parse(req, async (error, fields, files) => {
      if (error) {
        console.error("Formidable Parse Error:", error);
        return res.json({
          error: "Failed to parse form data.",
          api_result: constance.result_nok,
        });
      }
      const getFieldValue = (field) =>
        Array.isArray(field) ? field[0] : field;
      var data = {
        DocReq: getFieldValue(fields.DocReq),
        ReqDate: getFieldValue(fields.ReqDate),
        ReqTime: getFieldValue(fields.ReqTime),
        UserReq: getFieldValue(fields.UserReq),
        Gmail: getFieldValue(fields.Gmail),
        Factory: getFieldValue(fields.Factory),
        Process: getFieldValue(fields.Process),
        Category: getFieldValue(fields.Category),
        ReqTitle: getFieldValue(fields.ReqTitle),
        Before: getFieldValue(fields.Before),
        After: getFieldValue(fields.After),
        ImproveM: getFieldValue(fields.ImproveM),
        ReducedY: getFieldValue(fields.ReducedY),
        CostDetail: getFieldValue(fields.CostDetail), // Before Steps
        BfStep1: getFieldValue(fields.BfStep1),
        BfStep2: getFieldValue(fields.BfStep2),
        BfStep3: getFieldValue(fields.BfStep3),
        BfStep4: getFieldValue(fields.BfStep4),
        BfStep5: getFieldValue(fields.BfStep5),
        BfStep6: getFieldValue(fields.BfStep6),
        BfStep7: getFieldValue(fields.BfStep7),
        BfStep8: getFieldValue(fields.BfStep8),
        BfStep9: getFieldValue(fields.BfStep9),
        BfStep10: getFieldValue(fields.BfStep10), // After Steps
        AfStep1: getFieldValue(fields.AfStep1),
        AfStep2: getFieldValue(fields.AfStep2),
        AfStep3: getFieldValue(fields.AfStep3),
        AfStep4: getFieldValue(fields.AfStep4),
        AfStep5: getFieldValue(fields.AfStep5),
        AfStep6: getFieldValue(fields.AfStep6),
        AfStep7: getFieldValue(fields.AfStep7),
        AfStep8: getFieldValue(fields.AfStep8),
        AfStep9: getFieldValue(fields.AfStep9),
        AfStep10: getFieldValue(fields.AfStep10),
        URLlink: getFieldValue(fields.URLlink),
        FromDate1: getFieldValue(fields.FromDate1),
        ToDate1: getFieldValue(fields.ToDate1),
        Detail1: getFieldValue(fields.Detail1),
        FromDate2: getFieldValue(fields.FromDate2),
        ToDate2: getFieldValue(fields.ToDate2),
        Detail2: getFieldValue(fields.Detail2),
        FromDate3: getFieldValue(fields.FromDate3),
        ToDate3: getFieldValue(fields.ToDate3),
        Detail3: getFieldValue(fields.Detail3),
        FromDate4: getFieldValue(fields.FromDate4),
        ToDate4: getFieldValue(fields.ToDate4),
        Detail4: getFieldValue(fields.Detail4),
        FromDate5: getFieldValue(fields.FromDate5),
        ToDate5: getFieldValue(fields.ToDate5),
        Detail5: getFieldValue(fields.Detail5),
        Responsible: getFieldValue(fields.Responsible),
        Status: getFieldValue(fields.Status),
      }; // 3. จัดการไฟล์: ป้องกัน TypeError
      const filePicArray = Array.isArray(files.FilePic)
        ? files.FilePic
        : files.FilePic
        ? [files.FilePic]
        : [];
      const filePic = filePicArray[0]; // ดึงไฟล์ตัวแรกออกมา
      if (filePic && filePic.filepath) {
        try {
          // อ่านไฟล์แบบ Synchronous
          data.FileType = filePic.mimetype; // ลบ 'await' ออก เพราะ fsExtra.readFileSync เป็น synchronous call
          data.FilePic = fsExtra.readFileSync(filePic.filepath);
          console.log(`File read successfully from: ${filePic.filepath}`);
        } catch (readError) {
          console.error("Error reading uploaded file:", readError); // หากอ่านไฟล์ไม่ได้ ให้ออกจากการทำงานและส่ง error กลับ
          return res.json({
            error: "Failed to read uploaded file.",
            api_result: constance.result_nok,
          });
        }
      } else {
        // กรณีไม่ส่งไฟล์ หรือไฟล์ไม่มีข้อมูล filepath
        console.log(
          "No valid 'FilePic' found in the request or filepath is undefined. Proceeding without file data."
        );
      } // 4. บันทึกข้อมูลลงฐานข้อมูล
      let result = await JobRequest_table.create(data);
      console.log("Database Insert Result:", result);
      res.json({
        result: { DocReq: result.DocReq },
        api_result: constance.result_ok,
      });
    });
  } catch (error) {
    console.error("General API Error:", error);
    res.json({ error, api_result: constance.result_nok });
  }
});
router.post("/showDocNo", async (req, res) => {
  const { DocReq } = req.body;
  try {
    let result = await JobRequest_table.sequelize.query(
      `SELECT 'DX' + RIGHT('0000000' + CAST(ISNULL(MAX(CAST(SUBSTRING([DocReq], 3, 7) AS INT)), 0) + 1 AS VARCHAR(7)), 7) AS NextRunno
      FROM [DX_Center].[dbo].[JobRequests]
      WHERE [DocReq] LIKE 'DX[0-9]%';`,
      {
        replacements: { DocReq },
        type: JobRequest_table.sequelize.QueryTypes.SELECT,
      }
    );
    const NextRunno = result.length > 0 ? result[0].NextRunno : "0000001"; // ถ้ายังไม่มีเลย ให้ Runno = 0000001
    return res.json({ runno: NextRunno, api_result: constance.result_ok });
  } catch (error) {
    res.json({ error, api_result: constance.result_nok });
  }
});
router.get("/getfilePDF/:DocReq", async (req, res) => {
  // console.log(req.params);
  try {
    const { DocReq } = req.params;
    let result = await JobRequest_table.findOne({ where: { DocReq: DocReq } });
    res.type(result.FileType);
    res.end(result.FilePic);
  } catch (error) {
    res.json({ error, message: constance.result_ok });
  }
});
router.put("/update", async (req, res) => {
  try {
    let result = await JobRequest_table.update(req.body, {
      where: { DocReq: req.body.DocReq },
    });
    // console.log(req.body.DocReq);
    res.json({ result, api_result: constance.result_ok });
  } catch (error) {
    res.json({ error, api_result: constance.result_nok });
  }
});
router.post("/filterWork", async (req, res) => {
  try {
    const { searchTerm, YearMonth, Factory, Process, Category, Status } =
      req.body;
    let whereClause = "WHERE 1=1";
    if (searchTerm && searchTerm.trim() !== "") {
      whereClause += ` AND (r.[DocReq] LIKE '%' + :searchTerm + '%' OR r.[ReqTitle] LIKE '%' + :searchTerm + '%')`;
    }
    if (YearMonth && YearMonth.trim() !== "") {
      whereClause += ` AND FORMAT(r.[ReqDate], 'yyyy-MM') = :YearMonth`;
    }
    if (Factory && Factory.trim() !== "") {
      whereClause += ` AND r.[Factory] = :Factory`;
    }
    if (Process && Process.trim() !== "") {
      whereClause += ` AND r.[Process] = :Process`;
    }
    if (Category && Category.trim() !== "") {
      whereClause += ` AND r.[Category] = :Category`;
    }
    if (Status && Status.trim() !== "") {
      whereClause += ` AND r.[Status] = :Status`;
    }
    let query = `
      SELECT ROW_NUMBER() OVER(ORDER BY r.[DocReq]) AS [Row]
      , FORMAT(r.[createdAt], 'HH:mm') AS [Cut_RecTime]
      , FORMAT(r.[ReqDate], 'yyyy-MM') AS [YearMonth]
      , r.[Status]
      , r.* FROM [DX_Center].[dbo].[JobRequests] r
      ${whereClause}
      ORDER BY r.[DocReq]`;
    const [result] = await JobRequest_table.sequelize.query(query, {
      replacements: {
        searchTerm,
        YearMonth,
        Factory,
        Process,
        Category,
        Status,
      },
    });
    res.json({ result: result, api_result: constance.result_ok });
  } catch (error) {
    console.error(error);
    res.json({ error, api_result: constance.result_nok });
  }
});
router.get("/getFilterOptions", async (req, res) => {
  try {
    const [yearMonths, factories, processes, categories, statuses] =
      await Promise.all([
        JobRequest_table.sequelize.query(
          `SELECT DISTINCT FORMAT([ReqDate], 'yyyy-MM') AS [YearMonth] FROM [DX_Center].[dbo].[JobRequests] ORDER BY [YearMonth] ASC`
        ),
        JobRequest_table.sequelize.query(
          `SELECT DISTINCT [Factory] FROM [DX_Center].[dbo].[JobRequests] ORDER BY [Factory] ASC`
        ),
        JobRequest_table.sequelize.query(
          `SELECT DISTINCT [Process] FROM [DX_Center].[dbo].[JobRequests] ORDER BY [Process] ASC`
        ),
        JobRequest_table.sequelize.query(
          `SELECT DISTINCT [Category] FROM [DX_Center].[dbo].[JobRequests] ORDER BY [Category] ASC`
        ),
        JobRequest_table.sequelize.query(
          `SELECT DISTINCT [Status] FROM [DX_Center].[dbo].[JobRequests] ORDER BY [Status] ASC`
        ),
      ]);
    res.json({
      result: {
        yearMonthList: yearMonths[0],
        factoryList: factories[0],
        processList: processes[0],
        categoryList: categories[0],
        statusList: statuses[0],
      },
      api_result: constance.result_ok,
    });
  } catch (error) {
    res.json({ error, api_result: constance.result_nok });
  }
});
router.post("/SummaryAll", async (req, res) => {
  const { DateForm, DateTo } = req.body;
  try {
    let result = await JobRequest_table.sequelize.query(
      `SELECT COUNT([Category]) as CouCategory,CAST(SUM(CASE WHEN [Status] = 'Finished' 
      THEN 1 ELSE 0 END) AS VARCHAR(10)) + ' (' + CAST(CAST(SUM(CASE WHEN [Status] = 'Finished'
      THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS DECIMAL(5, 1)) AS VARCHAR(10)) + '%)' AS CountPercent,
      SUM([ImproveM]) as SumTotalReq
      FROM [DX_Center].[dbo].[JobRequests]
      WHERE [Status] != 'Cancelled' AND [ReqDate] BETWEEN :DateForm AND :DateTo`,
      {
        replacements: { DateForm, DateTo },
        type: JobRequest_table.sequelize.QueryTypes.SELECT,
      }
    );
    res.json({ result: result, api_result: constance.result_ok });
  } catch (error) {
    res.json({ error, api_result: constance.result_nok });
  }
});
router.post("/ChartStatus", async (req, res) => {
  const { DateForm, DateTo } = req.body;
  try {
    let result = await JobRequest_table.sequelize.query(
      `SELECT [Status], COUNT([Status]) as Total
          FROM [DX_Center].[dbo].[JobRequests]
      WHERE [ReqDate] BETWEEN :DateForm AND :DateTo
      GROUP BY [Status]
	    ORDER BY 
       CASE
         WHEN [Status] = 'Waiting' THEN 1
         WHEN [Status] = 'On-Going' THEN 2
         WHEN [Status] = 'Finished' THEN 3
         WHEN [Status] = 'Cancelled' THEN 4
       END`,
      {
        replacements: { DateForm, DateTo },
        type: JobRequest_table.sequelize.QueryTypes.SELECT,
      }
    );
    // res.json({ result: result[0], api_result: constance.result_ok });
    res.json({ result: result, api_result: constance.result_ok });
  } catch (error) {
    res.json({ error, api_result: constance.result_nok });
  }
});
router.post("/ChartStackFac", async (req, res) => {
  const { DateForm, DateTo } = req.body;
  try {
    let result = await JobRequest_table.sequelize.query(
      `SELECT [Factory],
          SUM(CASE WHEN [Status] = 'Waiting' THEN 1 ELSE 0 END) AS Waiting,
          SUM(CASE WHEN [Status] = 'On-Going' THEN 1 ELSE 0 END) AS [On_Going],
          SUM(CASE WHEN [Status] = 'Finished' THEN 1 ELSE 0 END) AS Finished,
          SUM(CASE WHEN [Status] = 'Cancelled' THEN 1 ELSE 0 END) AS Cancelled
      FROM [DX_Center].[dbo].[JobRequests]
      WHERE [ReqDate] BETWEEN :DateForm AND :DateTo
      GROUP BY [Factory]
      ORDER BY CASE [Factory]
          WHEN 'NAT' THEN 1
          WHEN 'NHT' THEN 2
          WHEN 'NMB' THEN 3
          WHEN 'PELMEC' THEN 4
          WHEN 'NHB' THEN 5 END;`,
      {
        replacements: { DateForm, DateTo },
        type: JobRequest_table.sequelize.QueryTypes.SELECT,
      }
    );
    // res.json({ result: result[0], api_result: constance.result_ok });
    res.json({ result: result, api_result: constance.result_ok });
  } catch (error) {
    res.json({ error, api_result: constance.result_nok });
  }
});
router.post("/ChartBarCategory", async (req, res) => {
  const { DateForm, DateTo } = req.body;
  try {
    let result = await JobRequest_table.sequelize.query(
      `SELECT [Category], COUNT([Category]) as CouTotal, SUM([ImproveM]) as SumTotal
          FROM [DX_Center].[dbo].[JobRequests]
		      WHERE [Status] !='Cancelled' AND [ReqDate] BETWEEN :DateForm AND :DateTo
       GROUP BY [Category]
	    ORDER BY 
       CASE
         WHEN [Category] = 'Auto input AS400' THEN 1
         WHEN [Category] = 'Dashboard Report' THEN 2
         WHEN [Category] = 'e-Record' THEN 3
         WHEN [Category] = 'Modify M/C Program' THEN 4
         WHEN [Category] = 'Other' THEN 5
       END`,
      {
        replacements: { DateForm, DateTo },
        type: JobRequest_table.sequelize.QueryTypes.SELECT,
      }
    );
    // res.json({ result: result[0], api_result: constance.result_ok });
    res.json({ result: result, api_result: constance.result_ok });
  } catch (error) {
    res.json({ error, api_result: constance.result_nok });
  }
});
module.exports = router;
