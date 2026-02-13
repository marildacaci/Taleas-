const messages = require("../i18n/messages");

const supported = ["en", "al", "es"];

function pickLang(req) {
  const q = (req.query.lang || "").toLowerCase();
  if (supported.includes(q)) return q;

  const header = (req.headers["accept-language"] || "")
    .toLowerCase()
    .trim()
    .slice(0, 2);

  if (supported.includes(header)) return header;

  return "en";
}

module.exports = (req, res, next) => {
  const lang = pickLang(req);
  req.lang = lang;

  req.t = (key, ...params) => {
    const dict = messages[lang] || messages.en;
    const fallback = messages.en;

    const value = dict[key] || fallback[key];
    if (!value) return key;

    return typeof value === "function"
      ? value(...params)
      : value;
  };

  next();
};
