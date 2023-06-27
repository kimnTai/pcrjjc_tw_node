export function parsePlayerXml(xml: string) {
  const xmlDocument = new DOMParser().parseFromString(xml, "text/xml");

  return [...xmlDocument.querySelectorAll("string")].map((item) => {
    const key = item.getAttribute("name") || "";
    const value = item.innerHTML;

    return { key, value };
  });
}
