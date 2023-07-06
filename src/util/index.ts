import * as cheerio from "cheerio";
import CryptoJS from "crypto-js";

export function parsePlayerXml(xml: string) {
  const xmlDocument = new DOMParser().parseFromString(xml, "text/xml");

  return [...xmlDocument.querySelectorAll("string")].map((item) => {
    const key = item.getAttribute("name") || "";
    const value = item.innerHTML;

    return { key, value };
  });
}

async function getApkVersion() {
  const url = "/apk/超異域公主連結！redive/tw.sonet.princessconnect";
  const res = await fetch(url).then((_res) => _res.text());

  return cheerio.load(res)("span.version").text();
}

export async function getHeaders() {
  const apkVersion = "4.0.1";
  const headers = {
    "Accept-Encoding": "deflate, gzip",
    "User-Agent":
      "UnityPlayer/2021.3.20f1 (UnityWebRequest/1.0, libcurl/7.84.0-DEV)",
    "Content-Type": "application/octet-stream",
    Expect: "100-continue",
    "X-Unity-Version": "2021.3.20f1",
    "APP-VER": apkVersion,
    "BATTLE-LOGIC-VERSION": "4",
    "BUNDLE-VER": "",
    DEVICE: "2",
    "DEVICE-ID": "7b1703a5d9b394e24051d7a5d4818f17",
    "DEVICE-NAME": "OPPO PCRM00",
    "GRAPHICS-DEVICE-NAME": "Adreno (TM) 640",
    "IP-ADDRESS": "10.0.2.15",
    KEYCHAIN: "",
    LOCALE: "Jpn",
    "PLATFORM-OS-VERSION":
      "Android OS 5.1.1 / API-22 (LMY48Z/rel.se.infra.20200612.100533)",
    "REGION-CODE": "",
    "RES-VER": "00150001",
    // 手機類型，蘋果/安卓
    platform: "2",
  };
  return headers;
}

export function getSID(data: string) {
  const combinedData = `${data}r!I@nt8e5i=`;
  const hashedData = CryptoJS.MD5(combinedData).toString();
  return hashedData;
}

export function getIV(UDID: string = "b66ffd86-93f6-4681-9f37-36b61091b6ce") {
  return CryptoJS.enc.Utf8.parse(UDID.replace(/-/g, "").slice(0, 16));
}

export function createKey() {
  const characters = "0123456789abcdef";
  let key = "";
  for (let i = 0; i < 32; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    key += characters.charAt(randomIndex);
  }
  return CryptoJS.enc.Hex.parse(key);
}

export function encrypt(param: {
  data: string;
  key: CryptoJS.lib.WordArray;
  UDID: string;
}) {
  const encrypted = CryptoJS.AES.encrypt(param.data, param.key, {
    iv: getIV(`${param?.UDID}`),
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });
  const encryptedBytes = CryptoJS.enc.Hex.parse(
    encrypted.ciphertext.toString()
  );
  const keyBytes = CryptoJS.enc.Hex.parse(param.key.toString());
  const encryptedData = encryptedBytes.concat(keyBytes);
  return CryptoJS.enc.Base64.stringify(encryptedData);
}

export function encode(dat: string) {
  const alphabet = "0123456789";
  const len = dat.length.toString(16).padStart(4, "0");
  let encodedString = len;
  for (let i = 0; i < dat.length; i++) {
    if (i % 4 === 2) {
      encodedString += String.fromCharCode(dat.charCodeAt(i) + 10);
    } else {
      encodedString += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
  }
  function ivString() {
    const alphabet = "0123456789";
    let result = "";
    for (let i = 0; i < 32; i++) {
      result += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    return result;
  }

  encodedString += ivString();
  return encodedString;
}
