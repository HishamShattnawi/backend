const db = require("./db");
const getRows = require("./getRows");

function updateRow(tableName, userID, newValues) {
  // بناء استعلام التحديث
  const setClause = Object.keys(newValues)
    .map(key => `${key} = '${newValues[key]}'`)
    .join(', ');

  const query = `UPDATE ${tableName} SET ${setClause} WHERE id = '${userID}'`;

  try {
    const stmt = db.prepare(query);
    stmt.run();
    
    console.log(`Updated row in ${tableName}.`);
    return getRows(tableName , `WHERE id = '${userID}'`);
  } catch (err) {
    console.error(`Error updating rows in ${tableName}:`, err.message);
    return false;
  }
}

module.exports = updateRow;
