/**********************************************************
 * Project: Firefox add-on "Abstractor"                   *
 * File: abstractor.js                                    *
 * Author: Pedram GANJEH-HADIDI                           *
 * Copyright (C)2024 by Pedram GANJEH-HADIDI              *
 * Web: https://github.com/pediRAM/FirefoxAddOnAbstractor *
 **********************************************************/

const HTML_INPUTS = ["input","label","select","textarea","button","fieldset","legend","datalist","output","option","optgroup"];
const HTML_TABLES = ["table", "caption", "col", "colgroup", "thead", "tfoot", "tbody", "tr", "td", "th"];
const HTML_MEDIAS = ["img", "video", "audio", "picture", "source", "track", "canvas", "map", "area", "svg", "path", "circle", "ellipse", "line", "polygon", "polyline", "rect", "g", "defs", "marker", "symbol", "use", "view", "desc", "title", "figure", "figcaption"];
//const HTML_MEDIAS = ["img", "video", "path", "svg", "figure", "figcaption", "picture", "canvas", "area", "map"];
const HTML_CAPTIONS = ["h1", "h2", "h3", "h4", "h5", "h6"];
const HTML_TEXTS = ["a", "address", "article", "aside", "bdi", "bdo", "data", "dd", "div", "dl", "dt", "figcaption", "figure", "footer", "header", "kbd", "label", "li", "main", "nav", "noscript", "p", "pre", "rp", "samp", "section", "span", "summary", "time", "wbr"];

const ABS_CLASS_NAME = "abstractor-hide";
const ABS_CLASS_ID = "abstractor_hide";
const ABS_CLASS = `
.${ABS_CLASS_NAME} {
    display: none;
    width: 1px;
    height: 1px;
}

`;

function createCssContent(settings) {
    return `
h1, h2, h3, h4, h5, h6 {
    font-family: ${settings.fontFamily};
    font-size: ${settings.maxFontSize}px;
    font-style: normal;
    font-weight: bold;
    line-height: 1.6em;
}

body, address, article, aside, footer, header, hgroup, main, nav, p, section, search, ul, ol, li {
    font-family: ${settings.fontFamily};
    font-size: ${settings.minFontSize}px;
    font-style: normal;
    font-weight: normal;
    padding: 15px;
    line-height: 1.6em;
}

`;
}

browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'applySettings') {
        applySettings(message.settings);
    }
});

function applySettings(settings) {
    if (settings.removeStyles === true && settings.removeScripts === true)
        document.head.innerHTML = "";
    
    var elementsToRemove = getIgnoredElements(settings);
    if (settings.unifyText === true)
        document.body.style.backgroundColor = settings.bgColor;

    if (settings.removeScripts === true)
        removeScripts(settings);

    if (settings.removeStyles === true)
        removeStyles(settings);

    if (settings.unifyText === true) {
        document.querySelectorAll("*:not(script):not(style)").forEach(function (element) {
            element.style.color = settings.color;
            element.style.backgroundColor = settings.bgColor;
            if (window.getComputedStyle(element).fontFamily !== settings.fontFamily) {
                element.style.fontFamily = settings.fontFamily;
            }

            var currentFontSize = parseInt(window.getComputedStyle(element).fontSize);
            if (currentFontSize < settings.minFontSize) {
                element.style.fontSize = settings.minFontSize + "px";
            }
            else if (currentFontSize > settings.maxFontSize) {
                element.style.fontSize = settings.maxFontSize + "px";
            }
        });
    }

    if (elementsToRemove.length > 0)
        removeElements(elementsToRemove)
}

function removeElements(elementsToRemove) {
    document.querySelectorAll(elementsToRemove).forEach(function (element) {
        element.remove();
    });
}

function removeScripts(settings) {
    document.querySelectorAll("*:is(script)").forEach(function (element) {
        var tagName = element.tagName.toLowerCase();
        element.remove();
    });
}

function removeStyles(settings) {
    document.querySelectorAll("*:is(style)").forEach(function (element) {
        var tagName = element.tagName.toLowerCase();
        element.remove();
    });

    var myStyle = document.getElementById(ABS_CLASS_ID);
    if (myStyle == null)
        addAbstractorStyleClass(settings);
}

function getIgnoredElements(settings) {
    var result = [];

    if (settings.removeImages === true)
        HTML_MEDIAS.forEach(function (item) { result.push(item); });

    if (settings.removeControls === true)
        HTML_INPUTS.forEach(function (item) { result.push(item); });

    if (settings.removeTables === true)
        HTML_TABLES.forEach(function (item) { result.push(item); });

    return result;
}

function addAbstractorStyleClass(settings) {
    var styleElement = document.createElement('style');
    styleElement.id = ABS_CLASS_ID;
    styleElement.textContent = ABS_CLASS + createCssContent(settings);
    document.head.appendChild(styleElement);
}
