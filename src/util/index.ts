import * as cheerio from "cheerio";

export function parsePlayerXml(xml: string) {
  const xmlDocument = new DOMParser().parseFromString(xml, "text/xml");

  return [...xmlDocument.querySelectorAll("string")].map((item) => {
    const key = item.getAttribute("name") || "";
    const value = item.innerHTML;

    return { key, value };
  });
}

export async function getVersion() {
  const url = "/apk/超異域公主連結！redive/tw.sonet.princessconnect";
  const res = await fetch(url).then((_res) => _res.text());

  return cheerio.load(res)("span.version").text();
}
