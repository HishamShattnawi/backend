// Import the Express library
const express = require("express");
const addRow = require("./database/addRow");
const getRows = require("./database/getRows");
const deleteStudentRects = require("./database/deleteStudentRects");
const deleteRow = require("./database/deleteRow");
const db = require("./database/db");
const ExcelJS = require("exceljs"); // Import the ExcelJS library
const path = require("path");
const dayjs = require("dayjs");
const fs = require('fs');


const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const EXCEL_TEMPLATE = path.join(__dirname, 'templates', 'ttt.xlsx');

app.post("/addStudent", (req, res) => {
  const { name, imageid } = req.body;
  try {
    var rees = addRow("students", {
      name: name,
      imageid: imageid,
    });
    if (!rees.state) {
      res.status(400).send({ error: rees.msg });
    }
    const student = getRows("students", `WHERE name = '${name}'`)[0];
    res.status(200).send({
      state: true,
      msg: "تمت اضافة الطالب",
      student: student,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.get("/getAllStudents", (req, res) => {
  try {
    const students = getRows("students", "");
    students.sort((a, b) => a.name.localeCompare(b.name));

    res.status(200).send({
      state: true,
      msg: "Get All Students Successfully",
      students: students,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.delete("/deleteStudent/:userID", (req, res) => {
  var id = req.params.userID;
  try {
    const rows = deleteRow("students", id);
    if (rows) {
      const r = deleteStudentRects(id);
      res.status(200).send({ state: true, msg: "تم حذف الطالب" });
    } else {
      res.status(400).send({ state: false, msg: "خطاء غير معروف" });
    }
  } catch (error) {
    res.status(400).send({ state: false, msg: error.message });
  }
});

app.get("/getStudent/:userID", (req, res) => {
  var id = req.params.userID;
  try {
    const student = getRows("students", `WHERE id = '${id}'`)[0];
    if (student != null) {
      res.status(200).send({
        state: true,
        msg: "Get Student Successfully",
        student: student,
      });
    } else {
      res.status(200).send({
        state: true,
        msg: "لا يوجد طالب بهذا الرقم",
      });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.post("/addRect", (req, res) => {
  const { student_id, suraName, fromTo, itsnew, mis, date } = req.body;
  const student = getRows("students", `WHERE id = '${student_id}'`)[0];
  if (student == null) {
    res.status(400).send({ state: false, msg: "لا يوجد طالب بهذا الرقم" });
    return;
  }
  try {
    var todayDate = new Date()
      .toISOString()
      .slice(0, 10)
      .split("-")
      .reverse()
      .join("/");

    var rees = addRow("Rects", {
      student_id: student_id,
      suraName: suraName,
      fromTo: fromTo,
      itsnew: itsnew,
      mis: mis,
      date: date ?? todayDate,
    });
    if (!rees.state) {
      res
        .status(400)
        .send({ state: false, msg: "لم يسجل الموضع", error: rees.msg });
    }
    var rects = getRows("Rects", `WHERE student_id = '${student_id}'`);
    rects.sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split("/").map(Number);
      const [dayB, monthB, yearB] = b.date.split("/").map(Number);

      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);

      return dateA - dateB;
    });
    res.status(200).send({ state: true, msg: "تمت اضافة الموضع", rects });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.delete("/deleteRect/:rectID", (req, res) => {
  var id = req.params.rectID;
  try {
    const rows = deleteRow("Rects", id);
    if (rows) {
      res.status(200).send({ state: true, msg: "تم حذف الموضع" });
    } else {
      res.status(400).send({ state: false, msg: "خطاء غير معروف" });
    }
  } catch (error) {
    res.status(400).send({ state: false, msg: error.message });
  }
});

app.get("/getAllRectsFor/:userID", (req, res) => {
  try {
    const rects = getRows("Rects", `WHERE student_id = '${req.params.userID}'`);
    if (rects.length == 0) {
      res
        .status(200)
        .send({ state: true, msg: "لا يوجد مواضع لهذا الطالب", rects: [] });
      return;
    }
    rects.sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split("/").map(Number);
      const [dayB, monthB, yearB] = b.date.split("/").map(Number);

      const dateA = new Date(yearA, monthA - 1, dayA);
      const dateB = new Date(yearB, monthB - 1, dayB);

      return dateA - dateB;
    });

    res.status(200).send({
      state: true,
      msg: "Get All Rects Successfully",
      rects: rects,
    });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

function getAllStudentsRectsForDay(dayDate) {
  try {
    const rect = getRows("Rects", `WHERE date = '${dayDate}'`);
    if (rect != null && rect.length != 0) {
      return rect;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error retrieving rows from Rects:`, error.message);
    return null;
  }
}

app.get("/getAllStudentsRectsForDay", (req, res) => {
  const { dayDate } = req.body;

  try {
    const rect = getAllStudentsRectsForDay(dayDate);
    if (rect != null && rect.length != 0) {
      res.status(200).send({
        state: true,
        msg: "Get Rects Successfully",
        rects: rect,
      });
    } else {
      res.status(200).send({
        state: true,
        msg: "لا يوجد موضع بهذا التاريخ",
      });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.post("/addHW", (req, res) => {
  const { student_id, hw } = req.body;
  var r = getRows("HW", `WHERE student_id = '${student_id}'`);
  if (r.length != 0) {
    res
      .status(200)
      .send({ state: false, msg: "هذا الطالب لديه واجب", studentHw: r[0] });
    return;
  }
  try {
    var rees = addRow("HW", {
      student_id: student_id,
      hw: hw,
    });
    if (!rees.state) {
      res
        .status(400)
        .send({ state: false, msg: "لم يسجل الواجب", error: rees.msg });
    }
    var studentHw = getRows("HW", `WHERE student_id = '${student_id}'`)[0];
    res.status(200).send({ state: true, msg: "تمت اضافة الواجب", studentHw });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.delete("/deleteHWs", (req, res) => {
  try {
    db.prepare("DELETE FROM HW").run();
    res.status(200).send({ state: true, msg: "تم حذف الواجبات" });
  } catch (error) {
    res.status(400).send({ state: false, msg: error.message });
  }
});

app.delete("/deleteHW/:hwID", (req, res) => {
  var id = req.params.hwID;
  try {
    const rows = deleteRow("HW", id);
    if (rows) {
      res.status(200).send({ state: true, msg: "تم حذف الواجب" });
    } else {
      res.status(400).send({ state: false, msg: "خطاء غير معروف" });
    }
  } catch (error) {
    res.status(400).send({ state: false, msg: error.message });
  }
});

app.get("/getAllHws", (req, res) => {
  try {
    const hws = getRows("HW");
    if (hws.length == 0) {
      res.status(200).send({ state: true, msg: "لا يوجد واجبات" });
      return;
    }
    res.status(200).send({ state: true, msg: "Get All Hws Successfully", hws });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.post('/exportExcel', async (req, res) => {
  try {
    const { dayDate } = req.body;
    if (!dayDate) return res.status(400).json({ error: 'dayDate مطلوب' });

    // تأكد أن التمبلِيت موجود
    if (!fs.existsSync(EXCEL_TEMPLATE)) {
      return res.status(500).json({ error: 'ملف التمبلِيت غير موجود' });
    }

    // جهّز البيانات
    const students = getRows('students');

    // حمّل التمبلِيت
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(EXCEL_TEMPLATE);
    const worksheet = workbook.worksheets[0];

    for (let i = 0; i < students.length; i++) {
      const rects = getRows('Rects', `WHERE student_id='${students[i].id}' AND date='${dayDate}'`);
      const hw = getRows('HW', `WHERE student_id='${students[i].id}'`)[0];

      worksheet.getCell(`A${i + 2}`).value = students[i].name;

      let bValue = '';
      for (let j = 0; j < rects.length; j++) {
        const isNewText = rects[j].itsnew ? ' (جديد)' : '(مراجعة)';
        bValue += `${rects[j].suraName} ${rects[j].fromTo} ${isNewText}`;
        if (j !== rects.length - 1) bValue += '\n';
      }

      worksheet.getCell(`B${i + 2}`).value = bValue === '' ? 'لم يسمع' : bValue;
      worksheet.getCell(`C${i + 2}`).value = hw?.hw ?? '';
    }

    // ابعث الملف كتحميل بدون حفظ
    const fileName = `كشف-${dayDate}.xlsx`;
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    // Content-Disposition مع اسم عربي (RFC 5987)
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'صار خطأ أثناء التوليد', details: err.message });
  }
});


// Start the server and listen on port 3000
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
