const db = require('./db');


function deleteRow(tableName , userID) {
  const query = `DELETE FROM ${tableName} WHERE id = '${userID}'`;

  try {
    const stmt = db.prepare(query);
    stmt.run();
    console.log(`Deleted row from ${tableName}.`);
    return true;
  } catch (err) {
    console.error(`Error retrieving rows from ${tableName}:`, err.message);
    return false;
  }
}

module.exports = deleteRow;
