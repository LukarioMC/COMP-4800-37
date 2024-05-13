const db = require("better-sqlite3")("app.db");
const { SqliteError } = require("better-sqlite3");

/**
 * Returns all categories in the database with primary categories listed first.
 * @returns A list of categories.
 */
function getTags() {
  let getTagsStmt = db.prepare(
    "SELECT * FROM category ORDER BY is_primary DESC"
  );
  return getTagsStmt.all();
}

/**
 * Adds a new category to the database with the given name and optional isPrimary flag.
 * @param {string} name Category name.
 * @param {boolean} isPrimary Whether the category is primary or not.
 * @returns Object with successful property. If tag addition occured without error, successful is true.
 *  Otherwise, successful is false and message property will be set.
 */
function defineTag(name, isPrimary = false) {
  try {
    if (!isValidTagName(name)) return {successful: false, message: 'Tag name can be alphanumeric and include hyphens, underscores and spaces.'}
    let addTagStmt = db.prepare(
      "INSERT INTO category (name, is_primary) VALUES (?, ?)"
    );
    addTagStmt.run(name, isPrimary ? 1 : 0);
    return { successful: true };
  } catch (err) {
    if (err instanceof SqliteError && err.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return { successful: false, message: "Category name already in use." };
    } else {
      return { successful: false, message: err.message };
    }
  }
}

/**
 * Returns true if the given string only has alphanumeric and/or spaces, hyphens and underscores.
 * Code adapted from: https://stackoverflow.com/questions/4434076/best-way-to-alphanumeric-check-in-javascript
 * @param {string} str the name to be validated.
 * @returns true if string is valid, false otherwise.
 */
function isValidTagName(str) {
  var code, i, len;

  for (i = 0, len = str.length; i < len; i++) {
    code = str.charCodeAt(i);
    if (
      !(code > 47 && code < 58) && 
      !(code > 64 && code < 91) && 
      !(code > 96 && code < 123) &&
      code != 45 &&
      code != 95 &&
      code != 32
    ) {
      return false;
    }
  }
  return true;
}

module.exports = {
  getTags,
  defineTag,
};
