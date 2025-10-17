import React, { useMemo, useState } from "react";
import { useCart } from "../store/cartStore";
import { useNavigate } from "react-router-dom";

/* ---------------- Card brand icons (inline SVG) ---------------- */
function VisaIcon(props) {
  return (
    <svg viewBox="0 0 48 32" aria-label="Visa" {...props}>
      <rect width="48" height="32" rx="6" />
      <text x="50%" y="55%" textAnchor="middle" fontFamily="sans-serif" fontWeight="800" fontSize="14" fill="white">
        VISA
      </text>
    </svg>
  );
}
function MasterIcon(props) {
  return (
    <svg viewBox="0 0 48 32" aria-label="Mastercard" {...props}>
      <rect width="48" height="32" rx="6" fill="black" />
      <circle cx="20" cy="16" r="9" fill="#EB001B" />
      <circle cx="28" cy="16" r="9" fill="#F79E1B" style={{ mixBlendMode: "screen" }} />
    </svg>
  );
}
function AmexIcon(props) {
  return (
    <svg viewBox="0 0 48 32" aria-label="American Express" {...props}>
      <rect width="48" height="32" rx="6" />
      <text x="50%" y="55%" textAnchor="middle" fontFamily="sans-serif" fontWeight="800" fontSize="10" fill="white">
        AMERICAN
      </text>
      <text x="50%" y="80%" textAnchor="middle" fontFamily="sans-serif" fontWeight="800" fontSize="10" fill="white">
        EXPRESS
      </text>
    </svg>
  );
}
function DiscoverIcon(props) {
  return (
    <svg viewBox="0 0 48 32" aria-label="Discover" {...props}>
      <rect width="48" height="32" rx="6" />
      <text x="50%" y="55%" textAnchor="middle" fontFamily="sans-serif" fontWeight="800" fontSize="11" fill="white">
        DISCOVER
      </text>
    </svg>
  );
}

/* ---------------- Helpers ---------------- */
const onlyDigits = (s) => (s || "").replace(/\D+/g, "");
const luhnCheck = (num) => {
  const s = onlyDigits(num);
  let sum = 0;
  let dbl = false;
  for (let i = s.length - 1; i >= 0; i--) {
    let d = parseInt(s[i], 10);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return s.length >= 12 && sum % 10 === 0;
};
const detectBrand = (num) => {
  const s = onlyDigits(num);
  if (/^4\d{0,15}$/.test(s)) return "visa";
  if (/^5[1-5]\d{0,14}$/.test(s) || /^2(2[2-9]|[3-6]\d|7[01]|720)\d{0,12}$/.test(s)) return "master";
  if (/^3[47]\d{0,13}$/.test(s)) return "amex";
  if (/^6(011|5\d{2})\d{0,12}$/.test(s)) return "discover";
  return "unknown";
};
const formatCardNumber = (num) => {
  const s = onlyDigits(num);
  const brand = detectBrand(s);
  if (brand === "amex") {
    // 4-6-5
    return s.replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join(" ")
    );
  }
  // 4-4-4-4
  return s.replace(/(\d{1,4})/g, "$1 ").trim();
};
const validExpiry = (mmYY) => {
  const m = mmYY.trim();
  const m2 = m.includes("/") ? m : (m.length >= 3 ? m.slice(0, 2) + "/" + m.slice(2) : m);
  const match = /^(\d{2})\/(\d{2}|\d{4})$/.exec(m2);
  if (!match) return false;
  let [_, mmStr, yyStr] = match;
  const mm = parseInt(mmStr, 10);
  if (mm < 1 || mm > 12) return false;
  const now = new Date();
  const yy = yyStr.length === 2 ? 2000 + parseInt(yyStr, 10) : parseInt(yyStr, 10);
  // set to end of month
  const exp = new Date(yy, mm, 0, 23, 59, 59, 999);
  return exp >= new Date(now.getFullYear(), now.getMonth(), 1);
};
const cvvLengthFor = (brand) => (brand === "amex" ? 4 : 3);

/* ---------------- Main ---------------- */
export default function Checkout() {
  const { items, total, clear } = useCart();
  const navigate = useNavigate();

  const [holder, setHolder] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  const brand = useMemo(() => detectBrand(cardNum), [cardNum]);
  const grandTotal = useMemo(() => total(), [total]);

  const errors = {
    holder: holder.trim().length < 2 ? "Enter the name as it appears on the card." : "",
    card: !luhnCheck(cardNum) ? "Invalid card number." : "",
    expiry: !validExpiry(expiry) ? "Invalid expiry (MM/YY)." : "",
    cvv:
      onlyDigits(cvv).length !== cvvLengthFor(brand)
        ? `CVV must be ${cvvLengthFor(brand)} digits.`
        : "",
  };
  const hasErrors = Object.values(errors).some(Boolean);

  const payNow = async () => {
    if (items.length === 0) return;
    if (hasErrors) return;

    setLoading(true);
    // Simulate processing
    setTimeout(() => {
      setLoading(false);
      clear();
      navigate("/payment-success");
    }, 1200);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto p-4">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <p className="mt-2 text-gray-600">Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-2xl font-semibold">Payment</h1>

      {/* Card brand strip */}
      <div className="mt-4 flex items-center gap-3">
        <div className="w-12 h-8 rounded-lg overflow-hidden bg-blue-700">
          <VisaIcon className="w-full h-full fill-blue-700" />
        </div>
        <div className="w-12 h-8 rounded-lg overflow-hidden bg-gray-900">
          <MasterIcon className="w-full h-full" />
        </div>
        <div className="w-12 h-8 rounded-lg overflow-hidden bg-sky-700">
          <AmexIcon className="w-full h-full fill-sky-700" />
        </div>
        <div className="w-12 h-8 rounded-lg overflow-hidden bg-orange-600">
          <DiscoverIcon className="w-full h-full fill-orange-600" />
        </div>
        <span className="ml-auto text-sm text-gray-500 capitalize">
          {brand !== "unknown" ? brand : "card"} detected
        </span>
      </div>

      {/* Form */}
      <div className="mt-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Card holder name</label>
          <input
            className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="e.g., Aaisha Shahani"
            value={holder}
            onChange={(e) => setHolder(e.target.value)}
          />
          {errors.holder && <p className="mt-1 text-xs text-red-600">{errors.holder}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Card number</label>
          <input
            inputMode="numeric"
            autoComplete="cc-number"
            className="mt-1 w-full border rounded-lg px-3 py-2 tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="1234 5678 9012 3456"
            value={formatCardNumber(cardNum)}
            onChange={(e) => setCardNum(e.target.value)}
            maxLength={brand === "amex" ? 17 : 19} // includes spaces
          />
          {errors.card && <p className="mt-1 text-xs text-red-600">{errors.card}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Expiry (MM/YY)</label>
            <input
              inputMode="numeric"
              autoComplete="cc-exp"
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="MM/YY"
              value={expiry}
              onChange={(e) => {
                // auto-insert slash
                let v = e.target.value.replace(/[^\d]/g, "");
                if (v.length > 4) v = v.slice(0, 4);
                if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2);
                setExpiry(v);
              }}
              maxLength={5}
            />
            {errors.expiry && <p className="mt-1 text-xs text-red-600">{errors.expiry}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">CVV</label>
            <input
              inputMode="numeric"
              autoComplete="cc-csc"
              className="mt-1 w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder={cvvLengthFor(brand) === 4 ? "4 digits" : "3 digits"}
              value={cvv}
              onChange={(e) => setCvv(onlyDigits(e.target.value).slice(0, cvvLengthFor(brand)))}
              maxLength={cvvLengthFor(brand)}
            />
            {errors.cvv && <p className="mt-1 text-xs text-red-600">{errors.cvv}</p>}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="font-bold">
            Total: ${grandTotal.toFixed(2)} USD
          </div>
          <button
            onClick={payNow}
            disabled={loading || hasErrors}
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white disabled:opacity-50"
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </div>

        {hasErrors && (
          <p className="text-xs text-gray-500">
            Please fix the highlighted fields above.
          </p>
        )}
      </div>

      <p className="mt-4 text-xs text-gray-500">
        This is a demo payment screen.
      </p>
    </div>
  );
}
