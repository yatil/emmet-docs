import {extend, sortBy} from '../lib/utils';

var cssSections = [
	{
		title: 'Visual Formatting',
		props: 'position top right bottom left z-index float clear display visibility overflow overflow-x overflow-y overflow-style zoom clip resize cursor'
	}, {
		title: 'Margin & Padding',
		props: 'margin margin-top margin-right margin-bottom margin-left padding padding-top padding-right padding-bottom padding-left'
	}, {
		title: 'Box Sizing',
		props: 'box-sizing box-shadow width height max-width max-height min-width min-height'
	}, {
		title: 'Font',
		props: 'font font-weight font-style font-variant font-size font-size-adjust font-family font-effect font-emphasize font-emphasize-position font-emphasize-style font-smooth font-stretch'
	}, {
		title: 'Text',
		props: 'vertical-align text-align text-align-last text-decoration text-emphasis text-height text-indent text-justify text-outline text-replace text-transform text-wrap text-shadow line-height letter-spacing white-space white-space-collapse word-break word-spacing word-wrap'
	}, {
		title: 'Background',
		props: 'background background-color background-image background-repeat background-attachment background-position background-position-x background-position-y background-break background-clip background-origin background-size border-radius'
	}, {
		title: 'Color',
		props: 'color opacity'
	}, {
		title: 'Generated content',
		props: 'content quotes counter-increment counter-reset'
	}, {
		title: 'Outline',
		props: 'outline outline-offset outline-width outline-style outline-color'
	}, {
		title: 'Tables',
		props: 'table-layout caption-side empty-cells'
	}, {
		title: 'Border',
		props: 'border border-break border-collapse border-color border-image border-top-image border-right-image border-bottom-image border-left-image border-corner-image border-top-left-image border-top-right-image border-bottom-right-image border-bottom-left-image border-fit border-length border-spacing border-style border-width border-top border-top-width border-top-style border-top-color border-right border-right-width border-right-style border-right-color border-bottom border-bottom-width border-bottom-style border-bottom-color border-left border-left-width border-left-style border-left-color border-radius border-top-right-radius border-top-left-radius border-bottom-right-radius border-bottom-left-radius'
	}, {
		title: 'Lists',
		props: 'list-style list-style-position list-style-type list-style-image'
	}, {
		title: 'Print',
		props: 'page-break-before page-break-inside page-break-after orphans widows'
	}
];

var reCSSPropertyName = /^([a-z0-9\-]+)\s*\:/i;

export default function(data) {
	// get plain list of snippets
	var idx = createIndex();
	var lookup = {};

	// group all available CSS snippets
	data.forEach(function(item) {
		var sectionName = 'Others';
		if (item.type === 'snippet') {
			var propertyName = isValidSnippet(item.value) 
				? item.value.match(reCSSPropertyName)[1].toLowerCase()
				: item.name;
			var matchedProperty = idx.properties[propertyName];
			if (matchedProperty) {
				sectionName = matchedProperty.section;
			}

			if (!(sectionName in lookup)) {
				lookup[sectionName] = extend({
					name: sectionName,
					value: [],
					type: 'section'
				}, idx.sections[sectionName]);
			}

			lookup[sectionName].value.push(extend({}, item, matchedProperty || {}));
		}
	});

	var output = Object.keys(lookup).map(key => {
		var section = lookup[key];
		section.value = sortBy(section.value, section.name === 'Others' ? 'name' : 'order');
		return section;
	});

	return sortBy(output, 'order');
}


/**
 * Creates CSS properties index for faster look-ups and grouping
 * @return {Object} Hash of all CSS properties and their sections
 */
function createIndex() {
	var sections = {};
	var properties = {};
	cssSections.forEach((section, i) => {
		sections[section.title] = {
			order: i
		};

		section.props.split(' ').forEach((name, j) => {
			properties[name] = {
				section: section.title,
				order: j
			}
		});
	});
	
	// add ”Others” section
	sections['Others'] = {order: 999};

	return {
		sections: sections,
		properties: properties
	};
}

/**
 * Check if given snippet contains only one CSS property and value.
 * @param {String} snippet
 * @returns {Boolean}
 */
function isValidSnippet(snippet) {
	snippet = snippet.trim(snippet);
	
	// check if it doesn't contain a comment and a newline
	if (~snippet.indexOf('/*') || /[\n\r]/.test(snippet)) {
		return false;
	}
	
	// check if it's a valid snippet definition
	if (!reCSSPropertyName.test(snippet)) {
		return false;
	}
	
	snippet = emmet.tabStops.processText(snippet, {
		replaceCarets: true,
		tabstop: () => 'value'
	});
	
	return snippet.split(':').length === 2;
}