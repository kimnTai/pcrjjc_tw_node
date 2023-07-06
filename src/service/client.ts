import { createKey, encrypt, getHeaders, getIV, getSID } from "@/util";
import CryptoJS from "crypto-js";
import msgpack from "msgpack-lite";
import { Base64 } from "js-base64";

export default class Client {
  rootUrl = "/game";

  constructor(
    public param?: {
      UDID: string;
      SHORT_UDID_lowBits: string;
      VIEWER_ID_lowBits: string;
      TW_SERVER_ID: string;
    }
  ) {
    if (param?.TW_SERVER_ID !== "1") {
      this.rootUrl = "https://api5-pc.so-net.tw";
    }

    this.callApi();
  }

  packData(data: any, key: CryptoJS.lib.WordArray) {
    const encrypted = CryptoJS.AES.encrypt(
      msgpack.encode(data).toString("hex"),
      key,
      {
        iv: getIV(`${this.param?.UDID}`),
        padding: CryptoJS.pad.Pkcs7,
        mode: CryptoJS.mode.CBC,
      }
    );
    const packed = msgpack.encode(data);
    return [packed, encrypted.toString()];
  }

  async callApi(
    url: string = "/load/index",
    request: any = { carrier: "Android" }
  ) {
    const key = createKey();

    request = {
      ...request,
      tw_server_id: this.param?.TW_SERVER_ID,
      viewer_id: encrypt({
        key,
        data: `${this.param?.VIEWER_ID_lowBits}`,
        UDID: `${this.param?.UDID}`,
      }),
    };

    const [packed] = this.packData(request, key);

    // const headers = {
    //   ...(await getHeaders()),
    //   "SHORT-UDID": `${this.param?.SHORT_UDID_lowBits}`,
    //   SID: getSID(`${this.param?.VIEWER_ID_lowBits}${this.param?.UDID}`),
    //   PARAM: CryptoJS.SHA1(
    //     this.param?.UDID + url + packed + this.param?.VIEWER_ID_lowBits
    //   ).toString(),
    // };

    // const res = await fetch(`${this.rootUrl}${url}`, {
    //   method: "POST",
    //   headers,
    //   body: crypto,
    // }).then((_res) => _res.arrayBuffer());

    const res =
      "L/hqd19MPSwywpi5yLW9h21MOFEFrqsTFqJqddHLpo97xwkdvoOEY9KCFsf55f53iJgtCixQvBtheuRypJ9yKNEoSvj4xjr7SrQ/6CkiFEI2YmY0NDk1N2QwMjc2NTJkNDU3MjJlZjU0OGVmNTFkNw==";

    this.unpack(res);
  }

  //TODO res 解不出來
  unpack(data: string) {
    const decodedData = Base64.decode(data);
    console.log(decodedData, decodedData.slice(-32));

    const key = CryptoJS.enc.Hex.parse(decodedData.slice(-32));

    const encryptedData = CryptoJS.enc.Hex.parse(decodedData.slice(0, -32));
    const decrypted = CryptoJS.AES.decrypt({ ciphertext: encryptedData }, key, {
      iv: getIV(`${this.param?.UDID}`),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    //return msgpack.decode(Buffer.from(unpaddedBytes.toString(), "hex"));
  }
}
