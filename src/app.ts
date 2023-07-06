import fs from "vite-plugin-fs/browser";
import Client from "./service/client";
import { parsePlayerXml } from "./util";
import { decodeHelper } from "./util/decodeHelper";

export async function App() {
  const path = "/public/tw.sonet.princessconnect.v2.playerprefs.xml";

  const xml = await fs.readFile(path);

  const list = parsePlayerXml(xml).map((item) => {
    return decodeHelper(item);
  });

  const aa = list.filter((a) =>
    [
      "UDID",
      "SHORT_UDID_lowBits",
      "VIEWER_ID_lowBits",
      "TW_SERVER_ID",
    ].includes(a.key)
  );

  const param = aa.reduce((pre, value) => {
    pre[value.key] = value.value;
    return pre;
  }, {} as any);

  console.log(param);

  new Client(param);

  //await fs.writeFile("/public/data.json", JSON.stringify(list));
}
