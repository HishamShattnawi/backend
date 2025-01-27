const db = require("./db");

function addRow(tableName, rowData) {
  const columns = Object.keys(rowData).join(", ");
  const placeholders = Object.keys(rowData)
    .map(() => "?")
    .join(", ");
  const values = Object.values(rowData);

  const query = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;

  try {
    const stmt = db.prepare(query);
    stmt.run(...values);
    console.log(`Row added successfully to ${tableName}.`);
    return { state: true, msg: "Create User Successfully" };
  } catch (err) {
    var msg = handleDatabaseError(err);
    return { state: false, msg: msg };
  }
}
function handleDatabaseError(error) {
  if (!error) {
    console.log("No error occurred.");
    return;
  }

  if (error.message.includes("UNIQUE constraint failed")) {
    // Extract the column name from the error message
    const column = error.message.split(": ")[1];
    return `Error: The value in the field '${column}' must be unique.`;
  } else if (error.message.includes("FOREIGN KEY constraint failed")) {
    return ("Error: There is an issue with the foreign key relationships.");
  } else if (error.message.includes("NOT NULL constraint failed")) {
    // Extract the column name
    const column = error.message.split(": ")[1];
    return(`Error: The field '${column}' cannot be null.`);
  } else {
    return(`Unknown error: ${error.message}`);
  }
}
module.exports = addRow;
