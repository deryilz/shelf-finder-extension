const MAP_URL = "https://shelf-finder.com/map";

let container = null;

// can be intercepted by the site but that's fine
window.addEventListener("message", (event) => {
    let { fn, arg } = event.data;
    if (fn === "showBookMap" && !container) {
        showBookMap(arg);
    } else if (fn === "hide" && container) {
        hide();
    }
});

// can be null
function getSchoolName() {
    return document.getElementById("current-site-name")?.innerText;
}

function showBookMap(info) {
    let schoolName = getSchoolName();
    if (!schoolName) {
        return show("Couldn't find school name on page.");
    }

    if (!info.available) {
        let message = format("No copies of {} are currently available.", info.name);
        return show(message);
    }

    let params = new URLSearchParams();
    params.append("schoolName", schoolName);
    params.append("callNumber", info.callNumber);
    if (info.sublocation) params.append("sublocation", info.sublocation);

    let rawMessage = "{} is labeled " + info.callNumber;
    if (info.sublocation) rawMessage += " [" + info.sublocation + "]";
    let message = format(rawMessage, info.name);

    let url = MAP_URL + "?" + params.toString();
    show(message, url);
};

// expects str to have a single {} within it
function format(str, name) {
    if (!name) {
        let uppercase = str.startsWith("{}");
        return str.replace("{}", uppercase ? "Your book" : "your book");
    }

    let nameSize = 70 - str.length; // max size 70
    if (name.length > nameSize) {
        let shortName = name
            .substring(0, nameSize - 1)
            .replace(/[^A-Za-z0-9]+$/, "");
        return str.replace("{}", `"${shortName}…"`);
    } else {
        return str.replace("{}", `"${name}"`);
    }
}

function show(message, frameUrl = null) {
    // easy element creation
    let make = (type, classes, parent = document.body) => {
        let element = document.createElement(type);
        element.classList.add("shelf-finder", ...classes);
        parent.appendChild(element);
        return element;
    };

    container = make("div", ["backdrop"]);
    let ui = make("div", ["ui"], container);

    let bar = make("div", ["bar"], ui);
    if (frameUrl) {
        make("iframe", ["frame", "border"], ui).src = frameUrl;
    }

    make("div", ["header", "border"], bar).textContent = message;

    let x = make("div", ["x", "border"], bar);
    x.textContent = "x";
    x.addEventListener("click", hide);
}

function hide() {
    container?.remove();
    container = null;
}
