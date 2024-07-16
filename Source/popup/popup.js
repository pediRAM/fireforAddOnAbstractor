/**********************************************************
 * Project: Firefox add-on "Abstractor"                   *
 * File: popup.js                                    *
 * Author: Pedram GANJEH-HADIDI                           *
 * Copyright (C)2024 by Pedram GANJEH-HADIDI              *
 * Web: https://github.com/pediRAM/FirefoxAddOnAbstractor *
 **********************************************************/
const DEBUG = false;
const MIN_FONT_SIZE     = 8;
const MAX_FONT_SIZE     = 128;
const DEF_MIN_FONT_SIZE = 12;
const DEF_MAX_FONT_SIZE = 16;
const DEF_FONT_FMAILY   = "Arial, Helvetica, sans-serif";
const DEF_BG_COLOR      = "white";
const DEF_TEXT_COLOR    = "black";
const COLORS_ARRAY      = ["black", "white", "antiquewhite", "floralwhite", "ghostwhite", "whitesmoke", "brown", "red", "orangered", "orange", "yellow", "green", "blue", "purple", "violet", "gray", "lightgray", "lightslategray", "slategray", "darkgray", "darkslategray", "dimgray", "navajowhite", "aliceblue", "aqua", "aquamarine", "azure", "beige", "bisque", "blanchedalmond", "blueviolet", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgreen", "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen", "darkslateblue", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dodgerblue", "firebrick", "forestgreen", "fuchsia", "gainsboro", "gold", "goldenrod", "greenyellow", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgreen", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue", "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin", "navy", "oldlace", "olive", "olivedrab", "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver", "skyblue", "slateblue", "snow", "springgreen", "steelblue", "tan", "teal", "thistle", "tomato", "turquoise", "wheat", "yellowgreen"];
const DEF_UNIFY_TEXT      = true;
const DEF_REMOVE_CONTROLS = true;
const DEF_REMOVE_IMAGES   = true;
const DEF_REMOVE_TABLES   = true;
const DEF_REMOVE_SCRIPTS  = false;
const DEF_REMOVE_STYLES   = false;

document.addEventListener("DOMContentLoaded", function () {
    browser.storage.local.get("firstRun").then(function (data) {
        if (!data.firstRun) {
            browser.storage.local.set({ "firstRun": true });
            const settings = createDefaultSettings();
            saveSettings(settings);
            updateView(settings);
        } else {
            loadSettingsThenUpdateView();
        }
    }).catch(function (error) {
        console.error("Error retrieving firstRun status:", error);
    });

    const settingsForm   = getElem("settingsForm");
    const unifyText      = getElem("unifyText");
    const fontFamily     = getElem("fontFamily");
    const minFontSize    = getElem("minFontSize");
    const maxFontSize    = getElem("maxFontSize");
    const removeControls = getElem("removeControls");
    const removeImages   = getElem("removeImages");
    const removeTables   = getElem("removeTables");
    const removeScripts  = getElem("removeScripts");
    const removeStyles   = getElem("removeStyles");

    regCheckBox(unifyText);
    regCheckBox(removeControls);
    regCheckBox(removeImages);
    regCheckBox(removeTables);
    regCheckBox(removeScripts);
    regCheckBox(removeStyles);

    const selectBgColor = fillSelect("backgroundColorSelect");
    const selectFgColor = fillSelect("foregroundColorSelect");
    const viewerBgColor = getElem("backgroundColorViewer");
    const viewerFgColor = getElem("foregroundColorViewer");

    regColorViewer(selectBgColor, viewerBgColor);
    regColorViewer(selectFgColor, viewerFgColor);
    regNormalizedFontSizes(minFontSize, maxFontSize);

    getElem("applyButton").addEventListener("click", function() {
        applySettings();
    });
});

function regCheckBox(checkbox) {
    checkbox.addEventListener("change", function (event) {
        autoSaveSettings();
        if (checkbox.id === "unifyText")
            disableLookAndFeel(checkbox.checked !== true);
    });
}

function disableLookAndFeel(isDisabled) {
    getElem("lookAndFeel").disabled = isDisabled;
}

function loadSettingsThenUpdateView() {
    browser.storage.local.get().then(function (result) {
        updateView(result);
    });
}

function getElem(id) {
    return document.getElementById(id);
}

function getIndexByValue(selectElement, value) {
    for (var i = 0; i < selectElement.options.length; i++) {
        if (selectElement.options[i].value === value) {
            return i;
        }
    }
    return -1;
}

function updateView(settings) {
    logSettings("Updating views", settings);
    const selectFontFamily = getElem("fontFamily");
    const inputMinFontSize = getElem("minFontSize");
    const inputMaxFontSize = getElem("maxFontSize");

    const checkboxUnifyText = getElem("unifyText");
    const checkboxRemoveControls = getElem("removeControls");
    const checkboxRemoveImages = getElem("removeImages");
    const checkboxRemoveTables = getElem("removeTables");

    const checkboxRemoveScripts = getElem("removeScripts");
    const checkboxRemoveStyles = getElem("removeStyles");
    const selectBackgroundColor = getElem("backgroundColorSelect");
    const selectForegroundColor = getElem("foregroundColorSelect");

    inputMinFontSize.value = settings.minFontSize;
    inputMaxFontSize.value = settings.maxFontSize;

    var fontIndex = getIndexByValue(selectFontFamily, settings.fontFamily);
    if (fontIndex === -1) fontIndex = 0;
    selectFontFamily.value = selectFontFamily.options[fontIndex].value;

    checkboxUnifyText.checked = settings.unifyText;
    checkboxRemoveControls.checked = settings.removeControls;
    checkboxRemoveImages.checked = settings.removeImages;
    checkboxRemoveTables.checked = settings.removeTables;
    checkboxRemoveScripts.checked = settings.removeScripts;
    checkboxRemoveStyles.checked = settings.removeStyles;
    selectBackgroundColor.value = settings.bgColor;
    selectForegroundColor.value = settings.color;
    updateColorSelect(selectBackgroundColor, settings.bgColor);
    updateColorSelect(selectForegroundColor, settings.color);
    disableLookAndFeel(checkboxUnifyText.checked !== true);
}


function regColorViewer(select, canvas) {
    select.addEventListener("change", function () {
        var { index, color } = getSelectedIndexAndColor(this);
        select.style.backgroundColor = color;
        updateColorViewer(canvas, color);
        autoSaveSettings();
    });
}

function regNormalizedFontSizes(minFontSize, maxFontSize) {
    minFontSize.addEventListener("change", function () {
        var minVal = parseInt(this.value);
        var maxVal = parseInt(getElem("maxFontSize").value);
        if (minVal >= maxVal) {
            this.value = maxVal - 1;
        }
        autoSaveSettings();
    });

    maxFontSize.addEventListener("change", function () {
        var minVal = parseInt(getElem("minFontSize").value);
        var maxVal = parseInt(this.value);
        if (maxVal <= minVal) {
            this.value = minVal + 1;
        }
        autoSaveSettings();
    });
}


function fillSelect(idOfSelect) {
    const e = getElem(idOfSelect);
    fillColorSelectorOptions(e);
    return e;
}

function fillColorSelectorOptions(select) {
    COLORS_ARRAY.forEach(c => {
        const opt = createColorOption(c);
        select.appendChild(opt);
    });
}
function createColorOption(colorName) {
    // "<option value="red" class="color-red">Red</option>"
    const opt = document.createElement("option");
    opt.setAttribute("value", colorName);
    opt.setAttribute("alt",   colorName);
    opt.setAttribute("title", colorName);
    opt.setAttribute("class", "color-" + colorName);
    opt.innerHTML = `<pre>    ${colorName.charAt(0).toUpperCase() + colorName.slice(1)}</pre>`;
    return opt;
}

function getSelectedIndexAndColor(select) {
    var index = select.options.selectedIndex;
    var color = select.value;
    return { index, color };
}

function updateColorViewer(canvas, color) {
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateColorSelect(select, color) {
    select.style.backgroundColor = color;
}

function autoSaveSettings() { saveSettings(readSettings()); }
function saveSettings(settings) {
    browser.storage.local.set({
        unifyText:      settings.unifyText,
        fontFamily:     settings.fontFamily,
        minFontSize:    settings.minFontSize,
        maxFontSize:    settings.maxFontSize,
        bgColor:        settings.bgColor,
        color:          settings.color,        
        removeControls: settings.removeControls,
        removeImages:   settings.removeImages,
        removeTables:   settings.removeTables,
        removeScripts:  settings.removeScripts,
        removeStyles:   settings.removeStyles
    });
}

function createDefaultSettings() {
    return {
        unifyText:      DEF_UNIFY_TEXT,
        fontFamily:     DEF_FONT_FMAILY,
        minFontSize:    DEF_MIN_FONT_SIZE,
        maxFontSize:    DEF_MAX_FONT_SIZE,
        bgColor:        DEF_BG_COLOR,
        color:          DEF_TEXT_COLOR,        
        removeControls: DEF_REMOVE_CONTROLS,
        removeImages:   DEF_REMOVE_IMAGES,
        removeTables:   DEF_REMOVE_TABLES,
        removeScripts:  DEF_REMOVE_SCRIPTS,
        removeStyles:   DEF_REMOVE_STYLES
    };
}

function readSettings() {
    return {
        unifyText:      getElem("unifyText").checked,
        fontFamily:     getElem("fontFamily").value,
        minFontSize:    parseInt(getElem("minFontSize").value),
        maxFontSize:    parseInt(getElem("maxFontSize").value),
        bgColor:        getElem("backgroundColorSelect").value,
        color:          getElem("foregroundColorSelect").value,        
        removeControls: getElem("removeControls").checked,
        removeImages:   getElem("removeImages").checked,
        removeTables:   getElem("removeTables").checked,
        removeScripts:  getElem("removeScripts").checked,
        removeStyles:   getElem("removeStyles").checked
    };
}

function applySettings() {
    browser.tabs.query({ active: true, currentWindow: true }).then(function (tabs) {
        browser.tabs.sendMessage(tabs[0].id, { action: "applySettings", settings: readSettings() });
    });
}

function logSettings(message, settings) {
    console.log(`${message}:
    unifyText      = ${settings.unifyText},
    fontFamily     = ${settings.fontFamily},
    minFontSize    = ${settings.minFontSize},
    maxFontSize    = ${settings.maxFontSize},
    bgColor        = ${settings.bgColor},
    color          = ${settings.color},    
    removeControls = ${settings.removeControls},
    removeImages   = ${settings.removeImages},
    removeTables   = ${settings.removeTables},
    removeScripts  = ${settings.removeScripts},
    removeStyles   = ${settings.removeStyles}
`);
}