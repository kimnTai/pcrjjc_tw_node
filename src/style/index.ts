const sheet = new CSSStyleSheet();
sheet.replaceSync(":root {background-color: #242424;}");
document.adoptedStyleSheets.push(sheet);

export {};
