(function (){
	function missing (val) {
		return (val === undefined || val === null || val === '');
	}
	
	function headersAndAnchorsOnly (elem) {
		switch (elem.nodeName) {
		case 'A':
			if (missing(getName(elem)) || !missing(elem.getAttribute('href')) || elem.childNodes.length == 0) {
				return NodeFilter.FILTER_REJECT;
			} else {
				return NodeFilter.FILTER_ACCEPT;
			}
		case 'H1':
		case 'H2':
		case 'H3':
		case 'H4':
		case 'H5':
		case 'H6':
			if (hasLinkChild(elem)) {
				return NodeFilter.FILTER_SKIP;				
			} else {
				return NodeFilter.FILTER_ACCEPT;
			}
		case 'P':
			return NodeFilter.FILTER_REJECT;
		default:
			return NodeFilter.FILTER_SKIP;
		}
	}

	function hasLinkChild (elem) {
		for (var i = 0; i < elem.childNodes.length; ++i) {
			var child = elem.childNodes[i];
			if (child.nodeType != Node.ELEMENT_NODE) continue;
			if (child.nodeName != 'A') continue;
			if (missing(child.getAttribute('href'))) continue;
			return true;
		}
		return false;
	}
	
	function getSibling (elem, neighbor) {
		var result = elem;
		do {
			result = neighbor(result);
		} while (result && result.nodeType == Node.TEXT_NODE && result.nodeValue.trim() == '');
		return result;
	}

	function getName (elem) {
		if (missing(elem)) return null;
		if (elem.nodeName == 'A') {
			var name = elem.getAttribute('name');
			if (!missing(name)) return name;
		}
		return elem.getAttribute('id');
	}
	
	function addLink (elem, name) {
		if (elem.nodeName == 'A') {
			elem.setAttribute('href', '#' + name);
			elem.className += ' com-belkadan-headeranchors-link';
		} else {
			var link = document.createElement('A');
			addLink(link, name);
			// Not particularly efficient, but...
			while (elem.childNodes.length) {
				link.appendChild(elem.childNodes[0]);
			}
			elem.appendChild(link);
		}
	}
	
	var iter = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, headersAndAnchorsOnly, false);
	var header;
	while ((header = iter.nextNode())) {
		var name = header.getAttribute('id');
		if (missing(name)) {
			// See if the header contains an anchor.
			for (var i = 0; i < header.childNodes.length; ++i) {
				var child = header.childNodes[i];
				if (child.nodeType != Node.ELEMENT_NODE) continue;

				name = getName(child);
				if (!missing(name)) break;
			}
		}
		if (missing(name)) {
			// See if the header follows an anchor.
			var previous = getSibling(header, function (x) { return x.previousSibling });
			name = getName(previous);
		}
		if (missing(name)) {
			// See if the header precedes an anchor.
			var next = getSibling(header, function (x) { return x.nextSibling });
			name = getName(next);
		}
		if (name) {
			addLink(header, name);
		}
	}
})();
