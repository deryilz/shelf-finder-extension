const SELECTORS = [
    [".dd-book-card, .dd-card-container, .ribbon-card-container, .product-title-details", elem => {
        let container = elem.querySelector(".call-number-container");
        let child = container?.children[1];

        return !child ? null : [container, {
            callNumber: child.innerText,
            name: elem.querySelector("img")?.alt?.trim(),
            sublocation: elem.querySelector(".sublocation-container")?.innerText,
            available: !elem.querySelector(".out"),
        }];
    }],
    [".cdk-dialog-container", elem => {
        let divs = Array.from(elem.querySelectorAll("div"));
        let lines = divs.flatMap(e => e.innerText.split("\n"));

        let find = (prefix) => lines
            .find(l => l.startsWith(prefix))
            ?.substring(prefix.length);

        let callNumber = find("Call Number: ");
        if (!callNumber) return null;

        let sublocation = find("Sublocation: ");
        let name = elem.querySelector(".clickable-book-name, .title-clamp")?.innerText;
        let available = !elem.querySelector(".out");

        return [
            elem.querySelector(".channel-board"),
            { callNumber, sublocation, name, available }
        ];
    }]
];


function addButtons() {
    for (let [query, getData] of SELECTORS) {
        for (let elem of document.querySelectorAll(query)) {
            if (elem.querySelector(".launch-shelf-finder")) continue;

            let [prev, info] = getData(elem) ?? [];
            if (!prev || !info) continue;

            let button = document.createElement("button");
            button.classList.add("launch-shelf-finder");
            button.textContent = "Find book";
            prev.after(button);

            button.addEventListener("click", () => {
                window.top.postMessage({
                    fn: "showBookMap",
                    arg: info
                });
            });
        }
    }
}

let observer = new MutationObserver(addButtons);
observer.observe(document.body, { attributes: true, childList: true, subtree: true });
addButtons();

window.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        window.top.postMessage({
            fn: "hide"
        });
    }
});

/*
function addOldButtons() {
    if (hasButton(document.body)) return;

    let id = document.getElementById("callNumber");
    if (!id) return;

    let rawName = document.querySelector("#titleDetail .TableHeading")?.innerText;

    let summary = document.getElementById("copiesSummary");
    let match = summary?.innerText.match(/([0-9]+) of [0-9]+/);
    let info = {
        callNumber: id.innerText,
        sublocation: document.getElementById("subLocation")?.innerText,
        name: rawName?.replace(/[\t\n]/g, ""),
        available: !match || Number(match[1]) > 0
    };

    console.log(info);

    let prev = document.getElementById("notesSummary");
    insertButton(prev, info);
}
*/
