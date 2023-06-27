import fs from "vite-plugin-fs/browser";
import { parsePlayerXml } from "./util";
import { decodeHelper } from "./util/decodeHelper";

export async function App() {
  const path = "/public/tw.sonet.princessconnect.v2.playerprefs.xml";

  const xml = await fs.readFile(path);

  const list = parsePlayerXml(xml).map((item) => {
    return decodeHelper(item);
  });

  await fs.writeFile("/public/data.json", JSON.stringify(list));
}
