/**
 * This file is intended to be run once to create an initial .sql file which contains
 * all the sample data and writes it to the configured file.
 */

const fs = require('fs');
const { JSDOM } = require('jsdom');
const { document, Node, HTMLHeadingElement } = (new JSDOM(`...`)).window;

const OUTPUT_FILE = './extractedSampleData.sql';
const BASE_URL = 'http://thirty-seven.org/';
const URLS = [
	'http://thirty-seven.org/amazing.html',
	'http://thirty-seven.org/historical.html',
	'http://thirty-seven.org/ephemeral.html',
	'http://thirty-seven.org/random.html',
	'http://thirty-seven.org/sports.html',
	'http://thirty-seven.org/scientific.html',
	'http://thirty-seven.org/personal.html',
	'http://thirty-seven.org/numerical.html',
	'http://thirty-seven.org/movies.html',
	'http://thirty-seven.org/comics.html',
	'http://thirty-seven.org/othermedia.html',
	'http://thirty-seven.org/37thones.html',
	'http://thirty-seven.org/pictures.html',
	'http://thirty-seven.org/sounds.html',
	// 'http://thirty-seven.org/links.html',
	'http://thirty-seven.org/multiples.html'
];

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
 * Fetches a list of HTML links that return a list and will parse them into objects for further manipulation.
 * 
 * @param {string[]} links 
 * @returns Array of factoid objects and attachment links
 */
async function fetchAndParseData(links) {
	const factoids = [];
	for (const link of links) {
		const items = await fetchListItems(link);
		for (const item of items) {
			const { rawFactoid, note } = await getNote(item); // Fetch note data
			const { factoid, attachments } = parsefactoid(rawFactoid);
			factoids.push({ factoid, note, attachments });
		}
	}
	return factoids;
}

/**
 * Given a URL that returns a HTML document, fetch it's contents and return the
 * items on the page as an array.
 * 
 * Example usage:
 * fetchListItems('https://example.com/page-with-list').then(array => console.log(array));
 * @param {string} url to fetch from
 * @returns HTMLElement[] of unparsed list items.
 */
async function fetchListItems(url) {
  try {
    const body = await fetchHTMLDocument(url);
		// Get all list items from the parsed document
    const listItems = body.querySelectorAll('ul li, ol li');
    return Array.from(listItems);
  } catch (error) {
    console.error('Error fetching the list items:', error);
    return [];
  }
}

/**
 * Parses a note from a passed list item and returns the modified HTML. Assumes
 * the note matches the pattern `(<a href="*">Note</a>)`.
 * 
 * @param {HTMLElement} listItem to extract the note from
 * @returns Object of the (possibly modified) raw fact HTML and retrieved note text
 */
async function getNote(listItem) {
	// Pattern to match the end of the HTML with a "(Note)." w/ an anchor tag. Contains two capture groups.
	const pattern = /\((<a href="([^"]+)">Note<\/a>)\)\.\n?$/;
	const match = listItem.innerHTML.match(pattern);
	if (!match) return { rawFactoid: listItem }; // No note was found, return early.
	const url = BASE_URL + match[2];
	const body = await fetchHTMLDocument(url);
	// Parse fetched body into note text
	const note = processNode(body)?.trim();
	listItem.innerHTML = listItem.innerHTML.replace(pattern, '');
	return { rawFactoid: listItem, note }
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
			content += node.nodeValue;
			break;
		case Node.ELEMENT_NODE:
			if (node.tagName === 'A') {
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
  // Extract the remaining text content (Removing whitespace)
  const factoid = listItem.textContent.replace(/\n/g, ' ').trim() || null;
  return { factoid, attachments };
}

// fetchAndParseData(URLS);
fetchAndParseData(['http://thirty-seven.org/multiples.html']);
