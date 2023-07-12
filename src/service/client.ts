import { createKey, encode, encrypt, getHeaders, getIV, getSID } from "@/util";
import CryptoJS from "crypto-js";
import msgpack from "msgpack-lite";
import { Buffer } from "buffer";
import aesjs from "aes-js";

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

    this.callApi("/check/check_agreement", {});
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

    const [packed, crypto] = this.packData(request, key);

    const headers = {
      ...(await getHeaders()),
      "SHORT-UDID": `${this.param?.SHORT_UDID_lowBits}`,
      SID: getSID(`${this.param?.VIEWER_ID_lowBits}${this.param?.UDID}`),
      PARAM: CryptoJS.SHA1(
        this.param?.UDID + url + packed + this.param?.VIEWER_ID_lowBits
      ).toString(),
    };

    const res = await fetch(`${this.rootUrl}${url}`, {
      method: "POST",
      headers,
      body: crypto,
    }).then((_res) => _res.text());

    this.unpack(res);
  }

  unpack(data: string) {
    const res = Buffer.from(data, "base64");

    const aesBody = res.subarray(0, res.length - 32);
    const aesKey = res.subarray(res.length - 32, res.length);

    const noopIV = [
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
    ];

    const rawBody = new aesjs.ModeOfOperation.cbc(aesKey, noopIV).decrypt(
      aesBody
    );
    const body = rawBody.subarray(
      0,
      rawBody.length - rawBody[rawBody.length - 1]
    );

    const pack = msgpack.decode(body);
    // result code 209
    console.log(pack);

    return pack;
  }
}
