// MyAppointmentPage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../store/cartStore";
import { useSnackbar } from "notistack";
import ConfirmDialog from "../components/ConfirmDialog";
import { useAppContext } from "../context/AppContext";

const API_BASE = "https://itp-backend-waw1.onrender.com";

/* ------------------- labels & edit routes ------------------- */
const SERVICE_LABEL = { vet: "Veterinary Care", grooming: "Grooming", daycare: "Daycare" };
const EDIT_PATH = { vet: "/vet-edit", grooming: "/grooming-edit", daycare: "/daycare-edit" };

/** Broadcast so other pages/widgets can refresh after payment/CRUD */
function broadcastAppointmentsChanged(detail = {}) {
  window.dispatchEvent(new CustomEvent("appointments:changed", { detail }));
}

/* ------------------- demo pricing ------------------- */
const PRICE_TABLE = {
  grooming: {
    "basic-bath-brush": 2500,
    "full-grooming": 6500,
    "nail-trim": 1500,
    "deshedding": 4500,
    "flea-tick": 5500,
    "premium-spa": 9500,
  },
  daycare: { "half-day": 3000, "full-day": 5500, "extended-day": 7000 },
  vet: { "general-health-checkup": 7500, vaccination: 4500, "emergency-care": 15000 },
};

/* ------------------- time helpers ------------------- */
const DURATION_DEFAULT = { vet: 30, grooming: 90, daycare: 480 };

function minutesToHHMM(m) {
  if (m == null) return null;
  const h = Math.floor(m / 60);
  const min = m % 60;
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}
function getTitle(a) {
  const cands = [a?.title, a?.packageName, a?.selectedService, a?.packageId, a?.planName, a?.serviceTitle].filter(Boolean);
  return cands[0] || "—";
}
function getDateYMD(a) {
  return a?.dateISO || a?.date || null;
}
function getTimeRange(a) {
  if (a?.start || a?.end) {
    const s = a?.start ?? "";
    const e = a?.end ?? "";
    const sep = s && e ? "–" : "";
    return `${s}${sep}${e}` || "—";
  }
  if (Number.isFinite(a?.timeSlotMinutes)) {
    const startMin = a.timeSlotMinutes;
    const dur = Number.isFinite(a?.durationMinutes)
      ? a.durationMinutes
      : DURATION_DEFAULT[(a?.service || "").toLowerCase()] ?? 30;
    return `${minutesToHHMM(startMin)}–${minutesToHHMM(startMin + dur)}`;
  }
  if (Number.isFinite(a?.dropOffMinutes)) {
    const s = minutesToHHMM(a.dropOffMinutes);
    return Number.isFinite(a?.pickUpMinutes) ? `${s}–${minutesToHHMM(a.pickUpMinutes)}` : s || "—";
  }
  if (Number.isFinite(a?.startMinutes) || Number.isFinite(a?.endMinutes)) {
    const s = Number.isFinite(a?.startMinutes) ? minutesToHHMM(a.startMinutes) : "";
    const e = Number.isFinite(a?.endMinutes) ? minutesToHHMM(a.endMinutes) : "";
    const sep = s && e ? "–" : "";
    return `${s}${sep}${e}` || "—";
  }
  return "—";
}

/* ------------------- paid-status helpers ------------------- */
function isPaid(appt) {
  const val = appt?.paymentStatus ?? appt?.payment?.status ?? (appt?.isPaid ? "paid" : "");
  const s = String(val).toLowerCase().trim();
  return (
    s === "paid" ||
    s === "complete" ||
    s === "completed" ||
    s === "success" ||
    s === "successful" ||
    s === "yes" ||
    appt?.isPaid === true
  );
}

/* -------------------  helpers ------------------- */
function keyify(s) {
  return String(s || "").toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}
function getPrice(a) {
  const service = String(a?.service || "").toLowerCase();
  const pkgKey =
    keyify(a?.packageId) ||
    keyify(a?.packageName) ||
    keyify(a?.selectedService) ||
    keyify(a?.title);
  const table = PRICE_TABLE[service] || {};
  const fromTable = table[pkgKey];
  return Number.isFinite(Number(fromTable)) ? Number(fromTable) : 0;
}
function calcExtrasTotal(extras = []) {
  return extras.reduce((sum, e) => sum + Number(e?.price || 0), 0);
}
function calcLineTotal(a) {
  return getPrice(a) + calcExtrasTotal(a?.extras);
}
function fmtDate(ymd) {
  if (!ymd) return "—";
  try {
    const [Y, M, D] = String(ymd).split("-").map((n) => parseInt(n || "0", 10));
    const d = new Date(Y, (M || 1) - 1, D || 1);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return ymd;
  }
}
function isActionLocked(a, loading) {
  return a?.status === "rejected" || a?.status === "cancelled" || loading;
}

/* >>> service chip color helper <<< */
function serviceChipClasses(service) {
  switch ((service || "").toLowerCase()) {
    case "vet":       // Veterinary Care → blue
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "grooming":  // Grooming → fuchsia
      return "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-200";
    case "daycare":   // Daycare → emerald
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    default:
      return "bg-slate-100 text-slate-700 ring-slate-200";
  }
}

/* ============================================================= */
export default function MyAppointmentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const { token } = useAppContext();

  // optional; kept if you use a Cart elsewhere
  const { addItem, addMany } = useCart?.() || { addItem: null, addMany: null };

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // delete state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAppt, setPendingAppt] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // payment flow state
  const [selected, setSelected] = useState(null);
  const [showAddMore, setShowAddMore] = useState(false);

  const processedSuccessRef = useRef(false);

  useEffect(() => {
    loadAllAppointments();
  }, []);
  useEffect(() => {
    const handler = () => loadAllAppointments();
    window.addEventListener("appointments:changed", handler);
    return () => window.removeEventListener("appointments:changed", handler);
  }, []);

  async function fetchAllAppointments() {
    try {
      const [groomingRes, daycareRes, vetRes] = await Promise.all([
        fetch(`${API_BASE}/api/grooming`, { headers: { token } }),
        fetch(`${API_BASE}/api/daycare`, { headers: { token } }),
        fetch(`${API_BASE}/api/vet`, { headers: { token } }),
      ]);
      if (!groomingRes.ok) throw new Error(`Grooming fetch failed: ${groomingRes.status}`);
      if (!daycareRes.ok) throw new Error(`Daycare fetch failed: ${daycareRes.status}`);
      if (!vetRes.ok) throw new Error(`Vet fetch failed: ${vetRes.status}`);

      const grooming = await groomingRes.json();
      const daycare = await daycareRes.json();
      const vet = await vetRes.json();

      const canonicalize = (a, service) => {
        const paid = isPaid(a);
        return { ...a, service, paymentStatus: paid ? "paid" : "unpaid" };
      };

      const groomed = (Array.isArray(grooming) ? grooming : []).map((a) => canonicalize(a, "grooming"));
      const daycared = (Array.isArray(daycare) ? daycare : []).map((a) => canonicalize(a, "daycare"));
      const vetened  = (Array.isArray(vet) ? vet : []).map((a) => canonicalize(a, "vet"));

      const merged = [...groomed, ...daycared, ...vetened].sort((a, b) => {
        const dA = new Date(a.dateISO || a.date);
        const dB = new Date(b.dateISO || b.date);
        const tA = a.timeSlotMinutes ?? a.dropOffMinutes ?? a.startMinutes ?? 0;
        const tB = b.timeSlotMinutes ?? b.dropOffMinutes ?? b.startMinutes ?? 0;
        return dA - dB || tA - tB;
      });

      return merged;
    } catch (err) {
      console.error(err);
      enqueueSnackbar(`Failed to load appointments: ${err.message}`, { variant: "error" });
      return [];
    }
  }

  async function loadAllAppointments() {
    setLoading(true);
    const list = await fetchAllAppointments();
    setItems(list);
    setLoading(false);
  }

  const getApptId = (a) => a?._id || a?.id;

  /* ------------------- delete flow ------------------- */
  function openConfirm(appt) {
    setPendingAppt(appt);
    setConfirmOpen(true);
  }
  function closeConfirm() {
    setConfirmOpen(false);
    setPendingAppt(null);
    setDeletingId(null);
  }
  async function confirmDelete() {
    if (!pendingAppt) return;
    const id = getApptId(pendingAppt);
    if (!id) {
      enqueueSnackbar("Missing appointment id.", { variant: "warning" });
      closeConfirm();
      return;
    }
    setDeletingId(id);

    const prevItems = items;
    setItems((cur) => cur.filter((x) => getApptId(x) !== id));

    try {
      const res = await fetch(`${API_BASE}/api/${pendingAppt.service}/${id}`, {
        method: "DELETE",
        headers: { token },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setItems(prevItems);
        enqueueSnackbar(data?.message || "Delete failed", { variant: "error" });
        return;
      }

      enqueueSnackbar("Appointment deleted.", { variant: "success" });
      broadcastAppointmentsChanged({ action: "deleted", service: pendingAppt.service, id });
    } catch {
      setItems(prevItems);
      enqueueSnackbar("Network error while deleting.", { variant: "error" });
    } finally {
      closeConfirm();
    }
  }

  /* ------------------- edit & pay ------------------- */
  function edit(appt) {
    if (isActionLocked(appt, false)) return;
    const apptId = appt?.id || appt?._id;
    if (!apptId) return alert("Missing appointment id.");
    if (!EDIT_PATH[appt.service]) return alert("Unknown service type.");
    navigate(`${EDIT_PATH[appt.service]}?editId=${apptId}`, { state: { appointment: appt } });
  }

  function pay(appt) {
    if (isPaid(appt)) return;
    if (isActionLocked(appt, false)) return;
    setSelected(appt);
  }

  function proceedToCheckoutFromSummary() {
    if (!selected) return;
    addItem?.({
      id: selected._id || selected.id,
      service: selected.service,
      title: getTitle(selected),
      price: getPrice(selected),
      extras: selected.extras || [],
    });
    setShowAddMore(true);
  }

  function buildOrderPayload(orderItems) {
    const itemsPayload = orderItems.map((a) => ({
      id: a._id || a.id,
      service: a.service,
      title: getTitle(a),
      date: getDateYMD(a),
      time: getTimeRange(a),
      basePrice: getPrice(a),
      extras: (a.extras || []).map((e) => ({ name: e.name, price: Number(e.price || 0) })),
      lineTotal: calcLineTotal(a),
    }));
    const subtotal = itemsPayload.reduce((s, it) => s + Number(it.lineTotal || 0), 0);
    return {
      currency: "LKR",
      subtotal,
      items: itemsPayload,
      note: "Please upload a clear image/PDF of your bank transfer slip.",
    };
  }

  function addMoreAndGo(extraIds) {
    const extra = items.filter((a) => extraIds.includes(a.id || a._id));
    addMany?.(
      extra.map((a) => ({
        id: a._id || a.id,
        title: getTitle(a),
        price: getPrice(a),
        extras: a.extras || [],
      }))
    );
    const order = buildOrderPayload([selected, ...extra]);
    setShowAddMore(false);
    setSelected(null);
    navigate("/payments/upload-slip", { state: { order } });
  }

  function skipAddMore() {
    if (!selected) return;
    const order = buildOrderPayload([selected]);
    setShowAddMore(false);
    setSelected(null);
    navigate("/payments/upload-slip", { state: { order } });
  }

  /* ------------------- payment success listeners ------------------- */
  useEffect(() => {
    function onSuccess(evt) {
      const detail = evt?.detail;
      const itemsToMark = Array.isArray(detail?.items) ? detail.items : [];
      if (!itemsToMark.length) return;
      markPaidAndSync(itemsToMark);
    }
    window.addEventListener("payment:success", onSuccess);
    return () => window.removeEventListener("payment:success", onSuccess);
  }, []);

  useEffect(() => {
    if (processedSuccessRef.current) return;
    const raw = sessionStorage.getItem("payment:lastSuccess");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      const itemsToMark = Array.isArray(parsed?.items) ? parsed.items : [];
      if (itemsToMark.length) {
        processedSuccessRef.current = true;
        sessionStorage.removeItem("payment:lastSuccess");
        markPaidAndSync(itemsToMark);
      }
    } catch {}
  }, [location?.pathname]);

  async function markPaidAndSync(itemsToMark) {
    try {
      await fetch(`${API_BASE}/api/payments/mark-paid`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", token },
        body: JSON.stringify({ items: itemsToMark }),
      }).catch(() => ({}));

      const idSet = new Set(itemsToMark.map((x) => String(x.id)));
      setItems((cur) =>
        cur.map((a) => {
          const aid = String(a._id || a.id);
          return idSet.has(aid) ? { ...a, paymentStatus: "paid" } : a;
        })
      );

      enqueueSnackbar("Payment recorded. Appointments marked as paid.", { variant: "success" });

      const touchedServices = Array.from(new Set(itemsToMark.map((x) => x.service)));
      touchedServices.forEach((svc) =>
        broadcastAppointmentsChanged({ action: "payment-updated", service: svc })
      );
    } catch (e) {
      console.error(e);
      enqueueSnackbar("Could not mark as paid. Please refresh.", { variant: "error" });
    }
  }

  /* ------------------- VIEW  ------------------- */

  //  Dynamic delete message based on paid status
  const deleteMessage =
    pendingAppt && isPaid(pendingAppt)
      ? "This action cannot be undone. You have already paid for this appointment, and your payment is non-refundable. Are you sure you want to continue?"
      : "This action cannot be undone. Are you sure you want to delete this appointment?";

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Appointments</h1>
        <p className="text-slate-600 mt-1 text-sm">
          View, edit, cancel, and pay for your upcoming bookings.
        </p>
      </div>

      {/* Loading / Empty */}
      {loading ? (
        <div className="space-y-3">
          <SkeletonLine />
          <SkeletonLine />
          <SkeletonLine />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center">
          <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-emerald-50 grid place-items-center">
            <span className="text-2xl">📅</span>
          </div>
          <h3 className="font-semibold text-slate-900">No appointments yet</h3>
          <p className="text-slate-600 text-sm">When you book, they’ll appear here.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((a) => (
            <li
              key={`${a.service}-${a._id || a.id}`}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Left block */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    {/* >>> colored service chip here <<< */}
                    <span
                      className={
                        "inline-flex items-center rounded-full ring-1 px-2 py-0.5 " +
                        serviceChipClasses(a.service)
                      }
                    >
                      {SERVICE_LABEL[a.service] || a.service}
                    </span>
                    <Dot />
                    <span className="text-slate-500">{fmtDate(getDateYMD(a))}</span>
                    <Dot />
                    <span className="text-slate-500">{getTimeRange(a)}</span>
                  </div>

                  <h3 className="mt-1 text-base md:text-lg font-semibold text-slate-900 truncate">
                    {getTitle(a)}
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge label={`Status: ${a.status || "pending"}`} tone={statusTone(a.status)} />
                    <Badge
                      label={`Payment: ${isPaid(a) ? "paid" : "unpaid"}`}
                      tone={isPaid(a) ? "green" : "slate"}
                    />
                    <span className="inline-flex items-center rounded-md bg-slate-50 ring-1 ring-slate-200 text-slate-700 text-[12px] px-2.5 py-1">
                      Rs. {getPrice(a).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 md:justify-end">
                  <Button
                    variant="ghost"
                    onClick={() => edit(a)}
                    disabled={isActionLocked(a, loading)}
                    label="Edit"
                  />
                  <Button
                    variant="danger"
                    onClick={() => openConfirm(a)}
                    disabled={isActionLocked(a, loading)}
                    label="Cancel"
                  />
                  <Button
                    variant={isPaid(a) ? "done" : "primary"}
                    onClick={() => pay(a)}
                    disabled={isPaid(a) || isActionLocked(a, loading)}
                    label={isPaid(a) ? "Paid" : "Pay Online"}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* 1) Order summary for the first picked appointment */}
      {selected && !showAddMore && (
        <MiniOrderSummaryModal
          selected={selected}
          onCancel={() => setSelected(null)}
          onConfirm={proceedToCheckoutFromSummary}
        />
      )}

      {/* 2) Add more unpaid */}
      {showAddMore && (
        <AddMoreModal
          appts={items.filter(
            (a) =>
              (a.id || a._id) !== (selected?._id || selected?.id) &&
              a.status !== "cancelled" &&
              a.status !== "rejected" &&
              !isPaid(a)
          )}
          onSkip={skipAddMore}
          onConfirm={addMoreAndGo}
          onClose={() => setShowAddMore(false)}
        />
      )}

      {/* delete confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        title="Delete appointment?"
        message={deleteMessage}   
        confirmLabel="Delete"
        cancelLabel="Keep"
        loading={Boolean(deletingId)}
        onConfirm={confirmDelete}
        onClose={closeConfirm}
      />
    </section>
  );
}

/* ------------------- UI bits (polished) ------------------- */
function Dot() {
  return <span className="mx-1 h-1 w-1 rounded-full bg-slate-300 inline-block align-middle" />;
}

function SkeletonLine() {
  return <div className="h-16 rounded-xl bg-slate-100 animate-pulse" />;
}

function Button({ variant = "primary", label, ...props }) {
  const styles = {
    primary:
      "bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:outline-2 focus-visible:outline-emerald-600",
    danger:
      "bg-red-600 text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-red-600",
    ghost:
      "border border-slate-300 bg-white hover:bg-slate-50 text-slate-800",
    done:
      "bg-slate-200 text-slate-700 cursor-default",
  };
  const base =
    "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  return (
    <button className={`${base} ${styles[variant]}`} {...props}>
      {label}
    </button>
  );
}

function Badge({ label, tone = "slate" }) {
  const tones = {
    green: "text-emerald-700 bg-emerald-50 ring-emerald-200",
    red: "text-red-700 bg-red-50 ring-red-200",
    amber: "text-amber-800 bg-amber-50 ring-amber-200",
    slate: "text-slate-700 bg-slate-100 ring-slate-200",
    blue: "text-blue-700 bg-blue-50 ring-blue-200",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md ring-1 text-[12px] ${tones[tone]}`}>
      {label}
    </span>
  );
}

function statusTone(s) {
  switch ((s || "pending").toLowerCase()) {
    case "accepted":
      return "green";
    case "rejected":
      return "red";
    case "cancelled":
      return "amber";
    default:
      return "blue";
  }
}

function MiniOrderSummaryModal({ selected, onCancel, onConfirm }) {
  const base = getPrice(selected);
  const extras = calcExtrasTotal(selected?.extras || []);
  const total = base + extras;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div className="relative bg-white w-[94%] sm:w-[480px] rounded-2xl shadow-xl p-6">
        <h2 className="text-lg font-semibold text-slate-900">Order Summary</h2>

        <div className="mt-1">
          <p className="text-slate-800 font-medium">{getTitle(selected)}</p>
          <p className="text-slate-600 text-sm">
            {fmtDate(getDateYMD(selected))} • {getTimeRange(selected)}
          </p>
        </div>

        <ul className="mt-4 text-sm text-slate-700 space-y-1">
          <li className="flex justify-between">
            <span>Base</span>
            <span>Rs. {base.toFixed(2)}</span>
          </li>
          {(selected.extras || []).map((e, i) => (
            <li key={i} className="flex justify-between">
              <span>Extra · {e.name}</span>
              <span>+ Rs. {Number(e.price || 0).toFixed(2)}</span>
            </li>
          ))}
          <li className="flex justify-between font-semibold pt-2 border-t">
            <span>Total</span>
            <span>Rs. {total.toFixed(2)}</span>
          </li>
        </ul>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onCancel} label="Cancel" />
          <Button variant="primary" onClick={onConfirm} label="Proceed to checkout" />
        </div>
      </div>
    </div>
  );
}

function AddMoreModal({ appts, onSkip, onConfirm, onClose }) {
  const [picked, setPicked] = useState([]);
  const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div className="relative bg-white w-[94%] max-w-[600px] rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Add anything else?</h3>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-full grid place-items-center text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 max-h-72 overflow-auto divide-y rounded-xl border border-slate-200">
          {appts.length === 0 && (
            <div className="text-slate-500 py-6 text-center">No other pending unpaid appointments.</div>
          )}
          {appts.map((a) => {
            const id = a.id || a._id;
            return (
              <label key={id} className="flex items-start gap-3 p-3 hover:bg-slate-50">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  checked={picked.includes(id)}
                  onChange={() => toggle(id)}
                />
                <div className="min-w-0">
                  <div className="font-medium text-slate-900 truncate">
                    {SERVICE_LABEL[a.service] || a.service} — {getTitle(a)}
                  </div>
                  <div className="text-sm text-slate-600">
                    {fmtDate(getDateYMD(a))} • {getTimeRange(a)}
                  </div>
                  <div className="text-sm text-slate-800 mt-1">Rs. {getPrice(a).toFixed(2)}</div>
                </div>
              </label>
            );
          })}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <Button variant="ghost" onClick={onSkip} label="Skip" />
          <Button
            variant="primary"
            onClick={() => onConfirm(picked)}
            disabled={appts.length === 0}
            label="Continue to Upload Slip"
          />
        </div>

        <p className="text-[12px] text-slate-500 mt-3">
          You’ll be taken to the <strong>Upload Bank Transfer Slip</strong> page to attach your receipt.
        </p>
      </div>
    </div>
  );
}
