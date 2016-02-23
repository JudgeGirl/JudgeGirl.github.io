var ejs = require('ejs'),
	fs = require('fs-extra'),
	yaml = require('js-yaml'),
	path = require('path'),
	marked = require('marked');

var _config = yaml.safeLoad(fs.readFileSync(path.join(__dirname, './_config.yml'), 'utf8')),
	markdown_content = fs.readFileSync(path.join(__dirname, './source/README.md'), 'utf8'),
	str = fs.readFileSync(path.join(__dirname, './theme/layout/index.ejs'), 'utf8');

/* create toc */

var toc = [];
var renderer = (function() {
var renderer = new marked.Renderer();
renderer.heading = function(text, level, raw) {
	console.log(raw);
	  var anchor = this.options.headerPrefix + raw.toLowerCase().replace(/\s+/g, '-');
	  toc.push({anchor: anchor, level: level, text: text});
	  return '<h' + level + ' id="' + anchor + '">' + text + '</h' + level + '>\n';
	};
	return renderer;
})();

marked.setOptions({
	renderer: renderer,
	gfm: true,
	tables: true,
	breaks: false,
	pedantic: false,
	sanitize: true,
	smartLists: true,
	smartypants: false
});

var html_content = marked(markdown_content);
var tocHTML = '<h1 id="table-of-contents">Table of Contents</h1>\n<ul>';
toc.forEach(function(entry) {
	tocHTML += '<li><a href="#'+entry.anchor+'">'+entry.text+'<a></li>\n';
});
tocHTML += '</ul>\n';

var ret = ejs.render(str, {
	config: _config,
	tocHTML: tocHTML,
	content: html_content,
});

fs.writeFileSync(path.join(__dirname, './../index.html'), ret);

fs.copy(path.join(__dirname, './theme/source'), path.join(__dirname, './../'), function (err) {
  if (err) {
    console.error(err);
  } else {
    console.log("success!");
  }
})
