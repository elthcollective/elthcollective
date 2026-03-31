import crypto from "crypto";

export type PayfastFieldMap = Record<string, string>;

export function payfastProcessUrl() {
  return process.env.PAYFAST_SANDBOX === "true"
    ? "https://sandbox.payfast.co.za/eng/process"
    : "https://www.payfast.co.za/eng/process";
}

export function payfastValidateUrl() {
  return process.env.PAYFAST_SANDBOX === "true"
    ? "https://sandbox.payfast.co.za/eng/query/validate"
    : "https://www.payfast.co.za/eng/query/validate";
}

export function toPayfastAmount(value: number) {
  return value.toFixed(2);
}

export function buildPayfastSignature(data: PayfastFieldMap, passphrase?: string) {
  const filtered = Object.entries(data)
    .filter(([_, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b));

  const queryString = filtered
    .map(([key, value]) => {
      return `${key}=${encodeURIComponent(value).replace(/%20/g, "+")}`;
    })
    .join("&");

  const withPassphrase = passphrase
    ? `${queryString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`
    : queryString;

  return crypto.createHash("md5").update(withPassphrase).digest("hex");
}

export function buildPayfastFormPayload(data: PayfastFieldMap, passphrase?: string) {
  const signature = buildPayfastSignature(data, passphrase);

  return {
    ...data,
    signature,
  };
}

export function buildUrlEncodedBody(data: Record<string, string>) {
  return Object.entries(data)
    .map(([key, value]) => `${key}=${encodeURIComponent(value).replace(/%20/g, "+")}`)
    .join("&");
}