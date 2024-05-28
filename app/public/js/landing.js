/**
 * Adds an event listener for the landing page easter egg to view the original
 * website look and feel.
 * @param {string} elementId ID of the element to attach to
 * @param {string} url to open in a new tab
 */
function addEasterEggListener(elementId, url) {
	const element = document.getElementById(elementId);
	if (!element) return;
	let clicks = 0;
	function handleClick() {
			clicks++;
			if (clicks >= 37) {
					window.open(url, '_blank');
			}
	}
	element.addEventListener('click', handleClick);
}

addEasterEggListener('thirty-seven', 'http://thirty-seven.org/index.html');