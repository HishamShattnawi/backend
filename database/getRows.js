<<<<<<< HEAD
const db = require('./db');


function getRows(tableName , searchQuery) {
  const query = `SELECT * FROM ${tableName} ${searchQuery}`;

  try {
    const stmt = db.prepare(query);
    const rows = stmt.all();
    console.log(`Retrieved rows from ${tableName}.`);
    return rows;
  } catch (err) {
    console.error(`Error retrieving rows from ${tableName}:`, err.message);
    return [];
  }
}

module.exports = getRows;
=======
const db = require('./db');


function getRows(tableName , searchQuery) {
  const query = `SELECT * FROM ${tableName} ${searchQuery}`;

  try {
    const stmt = db.prepare(query);
    const rows = stmt.all();
    console.log(`Retrieved rows from ${tableName}.`);
    return rows;
  } catch (err) {
    console.error(`Error retrieving rows from ${tableName}:`, err.message);
    return [];
  }
}

module.exports = getRows;
>>>>>>> 5cdca4e56534d58dd612fab75eeb15af0a4fd28b
