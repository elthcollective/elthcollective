const crypto = require("crypto");

function payfastProcessUrl() {
  return  import.meta.env.PAYFAST_SANDBOX === "true"
    ? "https://sandbox.payfast.co.za/eng/process"
    : "https://www.payfast.co.za/eng/process";
}

function buildSignature(data, passphrase = "") {
  const filtered = Object.entries(data)
    .filter(([key, value]) => key !== "signature" && value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b));

  const query = filtered
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value)).replace(/%20/g, "+")}`)
    .join("&");

  const finalString = passphrase
    ? `${query}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`
    : query;

  return crypto.createHash("md5").update(finalString).digest("hex");
}

function formFields(fields) {
  const signature = buildSignature(fields,  import.meta.env.PAYFAST_PASSPHRASE || "");
  return {
    ...fields,
    signature,
  };
}

function parseFormEncoded(text) {
  const params = new URLSearchParams(text);
  const data = {};
  for (const [key, value] of params.entries()) {
    data[key] = value;
  }
  return data;
}

function toUrlEncoded(data) {
  return Object.entries(data)
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value)).replace(/%20/g, "+")}`)
    .join("&");
}

module.exports = {
  payfastProcessUrl,
  buildSignature,
  formFields,
  parseFormEncoded,
  toUrlEncoded,
};