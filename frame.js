const SELECTORS = [
    [".dd-book-card, .dd-card-container, .ribbon-card-container, .product-title-details", elem => {
        let container = elem.querySelector(".call-number-container");
        let child = container?.children[1];

        return !child ? null : [container, {
            callNumber: child.innerText,
            name: elem.querySelector("img")?.alt?.trim(),
            sublocation: elem.querySelector(".sublocation-container")?.innerText,
            available: !elem.querySelector(".out"),
            author: elem.querySelector(".author-name-set, .author-sec")?.innerText,
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
        let author = elem.querySelector(".author-name-set, .author-sec")?.innerText;

        return [
            elem.querySelector(".channel-board"),
            { callNumber, sublocation, name, available, author }
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
