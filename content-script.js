const MAP_URL = "https://shelf-finder.com/map";

// add esc behavior

console.log("HI FROM EXT");

window.addEventListener("keydown", e => {
    console.log(e.key)
    if (e.key === "Enter") {
        startShelfFinder()
    }
});

function startShelfFinder() {
    console.log("Starting Shelf Finder...");

    let info = getBookInfo();
    if (!info) return null;

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
}

// expects str to have a single {} within it
function format(str, name) {
    if (!name) {
        let uppercase = str.startsWith("{}");
        return str.replace("{}", uppercase ? "Your book" : "your book");
    }

    let nameSize = 70 - str.length; // max size 70
    if (name.length > nameSize) {
        let shortName = name
            .substring(0, nameSize - 3)
            .replace(/[^A-Za-z0-9]+$/, "");
        return str.replace("{}", `"${shortName}..."`);
    } else {
        return str.replace("{}", `"${name}"`);
    }
}

// easy element creation
function make(type, classes, parent = top.document.body) {
    let element = document.createElement(type);
    element.classList.add("shelf-finder", ...classes);
    parent.appendChild(element);
    return element;
}

function show(message, frameUrl = null) {
    let backdrop = make("div", ["backdrop"]);
    let ui = make("div", ["ui"], backdrop);

    let bar = make("div", ["bar"], ui);
    if (frameUrl) {
        make("iframe", ["frame", "border"], ui).src = frameUrl;
    }

    make("div", ["header", "border"], bar).textContent = message;

    let x = make("div", ["x", "border"], bar);
    x.textContent = "x";

    x.addEventListener("click", () => {
        backdrop.remove();
    });
}

// can be null
// returns { callNumber, sublocation, name, available }
function getBookInfo() {
    let manager = document.getElementById("Library Manager");
    if (manager && !manager.hidden) {
        let doc = manager.contentDocument;

        let id = doc.getElementById("callNumber");
        if (!id) return null;

        let rawName = doc.querySelector("#titleDetail .TableHeading")?.innerText;

        let summary = doc.getElementById("copiesSummary");
        let match = summary?.innerText.match(/([0-9]+) of [0-9]+/);

        return {
            callNumber: id.innerText,
            sublocation: doc.getElementById("subLocation")?.innerText,
            name: rawName?.replace(/[\t\n]/g, ""),
            available: !match || Number(match[1]) > 0
        };
    }

    // otherwise, we're on the new ui
    let discover = document.getElementById("Destiny Discover");
    let doc = discover && !discover.hidden ? discover.contentDocument : document;

    let main = doc.querySelector(".cr-channel-main") ?? doc.querySelector(".product-title-details");
    if (!main) return null;

    let divs = Array.from(main.querySelectorAll("div"));
    let lines = divs.flatMap(e => e.innerText.split("\n"));

    let find = (prefix) => lines
        .find(l => l.startsWith(prefix + ": "))
        ?.substring(prefix.length + 2);

    let callNumber = find("Call Number");
    if (!callNumber) return null;

    let sublocation = find("Sublocation");
    let name = main.querySelector(".clickable-book-name, .title-clamp")?.innerText;
    let available = !main.querySelector(".out");
    return { callNumber, sublocation, name, available };
}

// can be null, of course
function getSchoolName() {
    return top.document.getElementById("current-site-name")?.textContent?.trim();
}
