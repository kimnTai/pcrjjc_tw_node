import { Buffer } from "buffer";

const CRYPTO_KEY = "e806f6";

function stringToBytes(str: string) {
  return Buffer.from(decodeURIComponent(str), "base64").toString("binary");
}

function decodeKey(encodedString: string) {
  const decodedBytes = stringToBytes(encodedString);

  let decryptedBytes = "";
  for (let i = 0; i < decodedBytes.length; i++) {
    const code =
      decodedBytes.charCodeAt(i) ^ CRYPTO_KEY.charCodeAt(i % CRYPTO_KEY.length);
    decryptedBytes += String.fromCharCode(code);
  }

  return decryptedBytes;
}

function decodeValue(xmlKey: string, encodedString: string) {
  const decodedBytes = stringToBytes(encodedString);

  const length =
    decodedBytes.length -
    (decodedBytes.charCodeAt(decodedBytes.length - 5) !== 0 ? 11 : 7);

  let decryptedBytes = "";
  for (let i = 0; i < length; i++) {
    const key2 = Buffer.from(xmlKey + CRYPTO_KEY, "utf8");
    const code = key2[i % key2.length] ^ decodedBytes.charCodeAt(i);

    decryptedBytes += String.fromCharCode(code);
  }

  return decryptedBytes;
}

export function decodeHelper({ key, value }: { key: string; value: string }) {
  try {
    const decodedKey = decodeKey(key);

    const decodedValue = (() => {
      const _decodeValue = decodeValue(decodedKey, value);

      if (decodedKey === "UDID") {
        let value = "";
        for (let i = 0; i < 36; i++) {
          value += String.fromCharCode(_decodeValue.charCodeAt(4 * i + 6) - 10);
        }
        return value;
      }

      return Buffer.from(_decodeValue, "binary").readInt32LE(0).toString();
    })();

    return {
      key: decodedKey,
      value: decodedValue,
    };
  } catch (error) {
    return {
      key,
      value,
    };
  }
}
