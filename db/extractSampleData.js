/**
 * This file is intended to be run once to create an initial .sql file which contains
 * all the sample data and writes it to the configured file.
 */

const fs = require('fs');
const { JSDOM } = require('jsdom');
const { document, Node } = (new JSDOM(`...`)).window;
const { inferType, parseYoutubeUrlToEmbeded } = require('../app/modules/upload');

const OUTPUT_FILE = './db/insertSampleData.sql'; // Will overwrite insertSampleData.sql on fetch
const BASE_URL = 'http://thirty-seven.org/';
const CATEGORY_URLS = {
	'Amazing': 'http://thirty-seven.org/amazing.html',
	'Historical': 'http://thirty-seven.org/historical.html',
	'Ephemeral': 'http://thirty-seven.org/ephemeral.html',
	'Random': 'http://thirty-seven.org/random.html',
	'Sports': 'http://thirty-seven.org/sports.html',
	'Scientific': 'http://thirty-seven.org/scientific.html',
	'Personal': 'http://thirty-seven.org/personal.html',
	'Numerical': 'http://thirty-seven.org/numerical.html',
	'Movies': 'http://thirty-seven.org/movies.html',
	'Comics': 'http://thirty-seven.org/comics.html',
	'Media': 'http://thirty-seven.org/othermedia.html',
	'37th Things': 'http://thirty-seven.org/37thones.html',
	'Pictures': 'http://thirty-seven.org/pictures.html',
	'Sounds': 'http://thirty-seven.org/sounds.html',
	// 'Links': 'http://thirty-seven.org/links.html',
	'Multiples': 'http://thirty-seven.org/multiples.html'
};

/**
 * Fetches a HTML document and returns the body of the document.
 * @param {string} url to fetch
 */
async function fetchHTMLDocument(url) {
	const response = await fetch(url);
	const html = await response.text();
	const dom = new JSDOM(html);
	const document = dom.window.document;
	return document.body;
}

/**
 * Recursively processess a simplified node tree into text content. Has support
 * for the following tags: p, li, a. 
 * Other tags are ignored and the inner text nodes are simply appended.
 * 
 * @param {Node} node to process
 */
function processNode(node) {
	let content = '';
	switch (node.nodeType) {
		case Node.TEXT_NODE:
			if (node.nodeValue.trim() !== '') content += node.nodeValue;
			break;
		case Node.ELEMENT_NODE:
			if (node.tagName === 'A') {
				if (node.href.startsWith('#')) {
					content += node.textContent;
					break; // Skip on-page element links
				}
				// Append URL to text content
				let url = ''
				if (node.href.startsWith('http') || node.href.startsWith('HTTP')) {
					url = node.href;
				} else {
					url = BASE_URL + node.href;
				}
				content += node.textContent + ` (Link: ${url})`;
			} else if (node.tagName.match(/H\d/) && node.textContent.includes('Note')) {
				break; // Skip note heading
			} else {
				// Recursively process child nodes
				for (let child of node.childNodes) {
					content += processNode(child);
				}
			}

			if (node.tagName === 'P' || node.tagName === 'LI') {
				content += '\n'; // Add newline after <p> and <li>
			}
			break;
	}
	return content;
}

/**
 * Fetches a list of HTML links that return a list and will parse them into objects for further manipulation.
 * 
 * @param {Object} links Object of key value pairs mapping categories to links
 * @returns Array of factoid objects and attachment links
 */
async function fetchAndParseData(links) {
	console.log('Beginning to fetch data from links. This may take a while...');
	const factoids = [];
	for (const category in links) {
		const link = links[category];
		try {
			const body = await fetchHTMLDocument(link);
			// Get all list items from the parsed document
			const listItems = body.querySelectorAll('ul li, ol li');
			for (const item of Array.from(listItems)) {
				const { rawFactoid, note } = await extractNote(item); // Fetch note data
				const { factoid, attachments } = parsefactoid(rawFactoid);
				factoids.push({ factoid, note, attachments, category });
			}
		} catch (error) {
			console.error(`Error fetching data for url ${link}`, error);
		}
	}
	console.log('Fetched data from links.');
	return factoids;
}

/**
 * Parses a list item into a factoid object (strips newlines, img, & anchor tags from factoid) 
 * 
 * @param {HTMLElement} listItem to parse
 * @returns Object of filtered factoid text and attachment links.
 */
function parsefactoid(listItem) {
	const attachments = [];
	// Extract text content and attachments
  // Find and process all <img> and <a> elements
  const elements = listItem.querySelectorAll('img, a');
  elements.forEach(el => {
    if (el.tagName.toLowerCase() === 'img' && el.src) {
      attachments.push(el.src);
    } else if (el.tagName.toLowerCase() === 'a' && el.href) {
      attachments.push(el.href);
    }
    // Remove the element but keep its inner text if it's an anchor tag
    if (el.tagName.toLowerCase() === 'a') {
      const text = document.createTextNode(el.textContent);
      el.parentNode.replaceChild(text, el);
    } else {
      el.remove();
    }
  });
  // Extract the remaining text content (Removing whitespace & excaping single quotes)
  const factoid = listItem.textContent.replace(/\s+/g, ' ').replace(/'/g, "''").trim() || null;
  return { factoid, attachments };
}

/**
 * Parses a note from a passed list item and returns the modified HTML. Assumes
 * the note matches the pattern `(<a href="*">Note</a>)`.
 * 
 * @param {HTMLElement} listItem to extract the note from
 * @returns Object of the (possibly modified) raw fact HTML and retrieved note text
 */
async function extractNote(listItem) {
	// Pattern to match the end of the HTML with a "(Note)." w/ an anchor tag. Contains two capture groups.
	const endNotePattern = /\((<a href="([^"]+)">Note<\/a>)\)\.\n?$/;
	const inlineNotePattern = /<a href="(notes\/[^"]+)">([^<]+)<\/a>/i;
	const matchEndNote = listItem.innerHTML.match(endNotePattern);
	const matchInlineNote = listItem.innerHTML.match(inlineNotePattern);
	
	if (!(matchEndNote || matchInlineNote)) return { rawFactoid: listItem }; // No note was found, return early.
	
	let url = '';
	if (matchEndNote) {
		url = BASE_URL + matchEndNote[2]; // Note at end of fact found, extract
		listItem.innerHTML = listItem.innerHTML.replace(endNotePattern, '');
	} else { 
		url = BASE_URL + matchInlineNote[1]; // Inline note found, extract and replace w/ text
		listItem.innerHTML = listItem.innerHTML.replace(inlineNotePattern, matchInlineNote[2]);
	}
	
	const body = await fetchHTMLDocument(url);
	// Parse fetched body into note text, excape single quotes.
	const note = processNode(body)?.trim()
		.replace(/'/g, "''")
		.replace(/(\r\n|\r|\n){2,}/g, '$1\n'); // Strip multiple newlines
	
	return { rawFactoid: listItem, note }
}

/**
 * Creates a SQL file at the configured ouput location. 
 * @param {Object[]} factoids 
 */
function createSQLFile(factoids) {
	console.log('Creating SQL file...');
	const data = [];
	let id = 373737; // Starting Factoid ID
	// Returns {string: int} for fact ID lookup after creating insertion statements
	const categories = insertCategories(Object.keys(CATEGORY_URLS), data);
	for (const { factoid, note, attachments, category } of factoids) {
		if (!factoid) throw new Error('Invalid factoid data provided!');
		data.push(`-- INSERTING DATA FOR FACT ID ${id}`);
		data.push(
			`INSERT INTO Factoid (id, submitter_id, content, posting_date, discovery_date, note, is_approved, approval_date)
			VALUES (
				${id},
				'mag3737',
				'${factoid}',
				datetime('1997-02-06 00:22:49'),
				datetime('1997-02-06 00:22:49'),
				${!note ? null : `'${note}'`},
				TRUE,
				CURRENT_TIMESTAMP
			);`
		);
		// Create category tag entry
		const categoryId = categories[category];
		data.push(`INSERT INTO Tag (factoid_id, category_id) VALUES (${id}, 373737);`); // Insert "OG Tag"
		data.push(`INSERT INTO Tag (factoid_id, category_id) VALUES (${id}, ${categoryId});`);
		// Insert the factoids attachments and parse it if it's a youtube link.
		for (let url of attachments) {
			const type = inferType(url);
			if (type === 'youtube') {
				url = parseYoutubeUrlToEmbeded(url);
			}
			if (!(url.startsWith("HTTP") || url.startsWith('http'))) {
				url = BASE_URL + url;
			}
			data.push(
				`INSERT INTO Attachment (factoid_id, link, type)
				VALUES (
					${id},
					'${url}',
					'${type}'
				);`
			);
		}
		id++;
	}
	// Make the insert SQL file.
	fs.writeFileSync(OUTPUT_FILE, data.join('\n'));
	console.log(`SQL file created/overwritten at '${OUTPUT_FILE}'!`);
}

/**
 * Appends tag insert statements to the end of the passed in `statements`. Sets
 * each `key` to be a primary tag.
 * 
 * @param {string[]} keys to be used as category names
 * @param {string[]} statements SQL statements to be joined later.
 * @returns Object of category names to inserted category ID.
 */
function insertCategories(keys, statements) {
	let id = 373737; // Starting category id
	let categories = {};
	// Create OG category
	statements.push(`INSERT INTO Category (id, name, is_primary) VALUES (${id++}, 'OG', TRUE);`);
	// Create rest of the categories
	for(const key of keys) {
		categories[key] = id;
		statements.push(`INSERT INTO Category (id, name, is_primary) VALUES (${id++}, '${key}', TRUE);`);
	}
	return categories;
}

fetchAndParseData(CATEGORY_URLS)
.then(createSQLFile);
