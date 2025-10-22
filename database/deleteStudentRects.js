const db = require('./db');


function deleteStudentRects(studentID) {
  const query = `DELETE FROM Rects WHERE student_id = '${studentID}'`;

  try {
    const stmt = db.prepare(query);
    stmt.run();
    console.log(`Deleted Rects from ${studentID}.`);
    return true;
  } catch (err) {
    console.error(`Error retrieving rows from Rects:`, err.message);
    return false;
  }
}

module.exports = deleteStudentRects;
