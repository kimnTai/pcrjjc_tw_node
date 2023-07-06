import { createKey, encode, encrypt, getHeaders, getIV, getSID } from "@/util";
import CryptoJS from "crypto-js";
import msgpack from "msgpack-lite";
import { Buffer } from "buffer";
import base64 from "base64-js";

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
      "SHORT-UDID": encode(`${this.param?.SHORT_UDID_lowBits}`),
      SID: getSID(`${this.param?.VIEWER_ID_lowBits}${this.param?.UDID}`),
      PARAM: CryptoJS.SHA1(
        this.param?.UDID + url + packed + this.param?.VIEWER_ID_lowBits
      ).toString(),
    };

    // const res = await fetch(`${this.rootUrl}${url}`, {
    //   method: "POST",
    //   headers,
    //   body: crypto,
    // }).then((_res) => _res.text());

    const _res =
      "tX+JLJfOkV8Flzy0c7VUdF8nYep5WqMy1piAT5EcmvJQ0SQhMEOUibcfE1gMaCoF2r2W1FNQqESwDBTOZDgojezhdK+9tHrxmwRFC+0NxYM5NmExMjRiMTQ3NTBiM2E4ZjUzNGRhMjAxODdiMjIwYQ==";

    this.unpack(_res);
  }

  //TODO res 解不出來
  unpack(data: string) {
    data = window.atob(data);

    const key = data.slice(-32);

    const encryptedData = data.slice(0, -32);

    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      iv: getIV(`${this.param?.UDID}`),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    console.log(decrypted.toString(CryptoJS.enc.Utf8));
  }
}
