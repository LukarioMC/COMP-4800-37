const db = require('../modules/db');
const { SqliteError } = require("better-sqlite3");

/**
 * Returns all categories in the database with primary categories listed first.
 * @returns A list of categories.
 */
function getTags() {
  let getTagsStmt = db.prepare(
    "SELECT * FROM category ORDER BY is_primary DESC, name ASC"
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
  // /(A-Za-z0-9\s_-)/.test(req.body.tagName) - Might use this instead
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

/**
 * Deletes a tag associated with a factoid based on the factoid ID and category ID.
 * @param {number} factoidID The ID of the factoid from which to delete the tag.
 * @param {number} categoryID The ID of the category of the tag to be deleted.
 * @returns {boolean} True if the tag is deleted successfully, false otherwise.
 */
function deleteTagforFactoid(factoidID, categoryID){
  try {
      const deleteTagStatement = db.prepare('DELETE FROM Tag WHERE factoid_id = ? AND category_id = ?');
      const result = deleteTagStatement.run(factoidID, categoryID);
      return result.changes > 0;
  } catch (e) {
      console.log('Error deleting tag:', e);
      return false;
  }
}

/**
 * Deletes all tags associated with a factoid.
 * @param {number} factoidID The ID of the factoid from which to delete all tags.
 * @returns {boolean} True if all tags are deleted successfully, true if no tags are found, false otherwise.
 */
function deleteAllTagsforFactoid(factoidID) {
  try {
      const getAllTagsStatement = db.prepare('SELECT * FROM Tag WHERE factoid_id = ?');
      const tags = getAllTagsStatement.all(factoidID);

      if (tags.length === 0) {
          return true;
      }

      tags.forEach(tag => {
        let result = deleteTagforFactoid(tag.factoid_id, tag.category_id);
          if (!result) {
            throw new Error(`Error deleting ${tag.category_id} tag for ${tag.factoid_id}`);
        }
      });

      return true; 
  } catch (e) {
      console.log('Error deleting all tags for factoid:', e);
      return false;
  }
}

/**
 * Fetches all primary tags from the database.
 * @returns {Array<Object>} An array of primary tags, or an empty array if an error occurs.
 */
function getPrimaryTags() {
    try {
        const stmt = db.prepare('SELECT * FROM category WHERE is_primary = 1 ORDER BY name');
        return stmt.all();
    } catch (err) {
        console.error(err);
        return [];
    }
}

/**
 * Deletes the category with the given ID.
 * @param {Integer} tagID ID of the tag category to be deleted.
 */
function deleteTag(tagID) {
  try {
    const deleteTagStmt = db.prepare(`DELETE FROM category WHERE id = ?`)
    const info = deleteTagStmt.run(tagID)
    if (info.changes === 0) {
      throw new Error(`Tag ${tagID} does not exist.`)
    }
  } catch (err) {
    throw new Error(`Failed to delete tag. Reason -> ${err.message}`)
  }
}

/**
 * Updates the tag category specified by the given ID. As of now, only changes the name.
 * @param {*} tagID tag category ID
 * @param {*} newTagName new tag name
 */
function updateTag(tagID, newTagName, isPrimary) {
  try {
    if (newTagName === '') throw new Error('New tag name cannot be empty.')
    const updateTagStmt = db.prepare(`
      UPDATE category
      SET 
        name = ?,
        is_primary = ?
      WHERE id = ?
    `)
    const info = updateTagStmt.run(newTagName.trim(), isPrimary ? 1 : 0,tagID)
    if (info.changes === 0) throw new Error(`Tag ${tagID} not found.`)
  } catch (err) {
    throw new Error(`Unable to update tag ${tagID}. Reason -> ${err.message}`)
  }
}

module.exports = {
  getTags,
  defineTag,
  deleteTagforFactoid,
  deleteAllTagsforFactoid,
  getPrimaryTags,
  deleteTag,
  updateTag
}