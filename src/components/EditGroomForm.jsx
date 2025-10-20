// src/pages/GroomingEditForm.jsx
import React, { useEffect } from "react";
import { useSnackbar } from "notistack";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAppContext } from "../context/AppContext";

/* ---------------- time helpers: local date (no UTC shift) ---------------- */
function toLocalYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function normalizeToLocalNoon(d) {
  const c = new Date(d);
  c.setHours(12, 0, 0, 0);
  return c;
}
function fromYMDToLocalDate(ymd) {
  if (!ymd) return null;
  const [Y, M, D] = String(ymd).split("-").map((n) => parseInt(n || "0", 10));
  const d = new Date(Y, (M || 1) - 1, D || 1);
  d.setHours(12, 0, 0, 0);
  return d;
}

/* ---------------- constants ---------------- */
const PET_TYPES = ["Dog", "Cat", "Rabbit", "Bird", "Other"];

const PACKAGES = [
  { id: "basic-bath-brush", name: "Basic Bath & Brush", price: 2500 },
  { id: "full-grooming", name: "Full Grooming Package", price: 6500 },
  { id: "nail-trim", name: "Nail Trim Only", price: 1500 },
  { id: "deshedding", name: "De-shedding Treatment", price: 4500 },
  { id: "flea-tick", name: "Flea & Tick Treatment", price: 5500 },
  { id: "premium-spa", name: "Premium Spa Package", price: 9500 },
];

const buildSlots = () => {
  const out = [];
  for (let m = 8 * 60; m <= 20 * 60; m += 30) {
    const h24 = Math.floor(m / 60);
    const mm = m % 60;
    const h12 = ((h24 + 11) % 12) + 1;
    const ampm = h24 >= 12 ? "PM" : "AM";
    out.push({ value: m, label: `${String(h12).padStart(2, "0")}:${String(mm).padStart(2, "0")} ${ampm}` });
  }
  return out;
};
const TIME_SLOTS = buildSlots();

/* ---------------- phone helpers (+94 | 9 digits UI) ---------------- */
// 9 digits after +94 must begin with 11/70/71/72/75/76/77/78
const LK_AFTER_CC_REGEX = /^(11|70|71|72|75|76|77|78)\d{7}$/;

/** Convert stored number to the 9 digits UI:
 *  "+94711234567" -> "711234567"
 *  "0711234567"   -> "711234567"
 *  "0112345678"   -> "112345678"
 */
function toNineAfter94(input = "") {
  const s = String(input);
  const m = s.match(/^\+94(\d{9})$/);
  if (m) return m[1];
  const digits = s.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("0")) return digits.slice(1);
  if (digits.length === 9) return digits;
  // Fallback: take last 9 digits if present
  return digits.slice(-9);
}

/** Build E.164 from the 9-digit field */
function toE164FromNine(nine = "") {
  const v = String(nine || "").replace(/\D/g, "").slice(0, 9);
  return v ? `+94${v}` : "";
}

/* ---------------- validation ---------------- */
const NAME_REGEX = /^[A-Za-z\s]+$/;

const schema = yup.object({
  ownerName: yup
    .string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .required("Owner name is required.")
    .matches(NAME_REGEX, "Only letters and spaces are allowed.")
    .min(2, "Too short.")
    .max(60, "Too long."),
  // Store only the 9 digits AFTER +94 in the form state
  phone: yup
    .string()
    .required("Contact number is required.")
    .matches(LK_AFTER_CC_REGEX, "Enter 9 digits after +94 (e.g., 711234567 or 112345678)"),
  email: yup.string().email("Enter a valid email").required("Email is required."),
  petType: yup.string().oneOf(PET_TYPES, "Select a valid pet type").required("Select pet type."),
  packageId: yup.string().oneOf(PACKAGES.map((p) => p.id), "Select a valid package").required("Select a package."),
  date: yup
    .date()
    .typeError("Choose a valid date.")
    .required("Preferred date is required.")
    .min(new Date(new Date().setHours(0, 0, 0, 0)), "Date cannot be in the past."),
  timeSlot: yup.number().typeError("Select a time slot.").required("Time slot is required.").min(480).max(1200),
  notes: yup.string().max(400, "Keep notes under 400 characters."),
});

export default function EditGroomForm() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { id: idFromParams } = useParams();
  const [params] = useSearchParams();
  const location = useLocation();
  const { backendUrl } = useAppContext();

  // Accept id from /grooming-edit/:id OR ?editId= OR location.state.appointment
  const editId =
    idFromParams ||
    params.get("editId") ||
    location.state?.appointment?._id ||
    location.state?.appointment?.id;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ownerName: "",
      phone: "",     // 9 digits only (UI)
      email: "",
      petType: "",
      packageId: "",
      date: null,
      timeSlot: "",
      notes: "",
    },
  });

  /* ---------------- load existing appointment ---------------- */
  useEffect(() => {
    let ignore = false;
    if (!editId) return;

    (async () => {
      try {
        const r = await fetch(`https://itp-backend-waw1.onrender.com/api/grooming/${editId}`);
        const ct = r.headers.get("content-type") || "";
        const data = ct.includes("application/json") ? await r.json() : await r.text();

        if (!r.ok) {
          enqueueSnackbar("Failed to load grooming appointment", { variant: "error" });
          return;
        }

        const appt = data?.data || data;
        if (!appt || ignore) return;

        reset({
          ownerName: appt.ownerName || "",
          // convert stored E.164 or local to 9-digit UI
          phone: toNineAfter94(appt.phone || ""),
          email: appt.email || "",
          petType: appt.petType || "",
          packageId: appt.packageId || "",
          date: fromYMDToLocalDate(appt.dateISO) || null,
          timeSlot: appt.timeSlotMinutes ?? "",
          notes: appt.notes || "",
        });
      } catch (e) {
        console.error(e);
        enqueueSnackbar("Error loading appointment", { variant: "error" });
      }
    })();

    return () => {
      ignore = true;
    };
  }, [editId, reset, enqueueSnackbar]);

  /* ---------------- submit update ---------------- */
  const onSubmit = async (vals) => {
    try {
      const dateISO = toLocalYMD(normalizeToLocalNoon(vals.date));
      const payload = {
        ownerName: vals.ownerName.trim(),
        // send E.164 to backend
        phone: toE164FromNine(vals.phone),
        email: vals.email.trim(),
        petType: vals.petType,
        packageId: vals.packageId,
        dateISO,
        timeSlotMinutes: Number(vals.timeSlot),
        notes: vals.notes?.trim() || "",
      };

<<<<<<< HEAD
      const r = await fetch(`${backendUrl}/api/grooming/${editId}`, {
=======
      const r = await fetch(`https://itp-backend-waw1.onrender.com/api/grooming/${editId}`, {
>>>>>>> 5f708ba (added backendUrl)
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const ct = r.headers.get("content-type") || "";
      const result = ct.includes("application/json") ? await r.json() : await r.text();

      if (!r.ok) {
        const msg =
          (typeof result === "string" && result) ||
          result?.message ||
          result?.error ||
          "Update failed";
        enqueueSnackbar("❌ " + msg, { variant: "error" });
        return;
      }

      enqueueSnackbar("Grooming appointment updated!", { variant: "success" });

      // Tell the list to refetch, then go back to the list with email prefilled
      window.dispatchEvent(
        new CustomEvent("appointments:changed", {
          detail: { service: "grooming", id: editId, action: "updated" },
        })
      );
      navigate(`/myCareappointments?email=${encodeURIComponent(vals.email)}`);
    } catch (err) {
      console.error(err);
      enqueueSnackbar("❌ Network error. Is the API running on http://localhost:3000 ?", {
        variant: "error",
      });
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <section className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-gray-50 rounded-2xl p-6 ring-1 ring-black/5">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
            Edit Grooming Appointment
          </h2>
          <p className="text-slate-600 mb-4">Update the details and save your changes.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Owner info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Owner Name</label>
                <input
                  type="text"
                  placeholder="e.g., Aaisha Shahani"
                  {...register("ownerName")}
                  onInput={(e) => {
                    const v = e.currentTarget.value.replace(/[^A-Za-z\s]/g, "");
                    if (v !== e.currentTarget.value) e.currentTarget.value = v;
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                {errors.ownerName && <p className="mt-1 text-sm text-red-600">{errors.ownerName.message}</p>}
              </div>

              {/* ✅ Phone: +94 chip + 9 digits field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-slate-300 bg-slate-100 text-slate-700 select-none">+94</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="711234567 or 112345678"
                    {...register("phone")}
                    onInput={(e) => {
                      let v = e.currentTarget.value.replace(/\D/g, "");
                      if (v.startsWith("0")) v = v.slice(1);
                      e.currentTarget.value = v.slice(0, 9);
                    }}
                    className="w-full rounded-r-lg border border-slate-300 border-l-0 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <p className="mt-1 text-[12px] text-slate-500">
                  Type the <b>9 digits after +94</b> (e.g., <code>711234567</code> or <code>112345678</code>).
                </p>
                {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>
            </div>

            {/* Pet type & package */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pet Type</label>
                <select
                  {...register("petType")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Select pet type</option>
                  {PET_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.petType && <p className="mt-1 text-sm text-red-600">{errors.petType.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Service Package</label>
                <select
                  {...register("packageId")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Select a package</option>
                  {PACKAGES.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} — Rs.{p.price}</option>
                  ))}
                </select>
                {errors.packageId && <p className="mt-1 text-sm text-red-600">{errors.packageId.message}</p>}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Date</label>
                <Controller
                  control={control}
                  name="date"
                  render={({ field }) => (
                    <DatePicker
                      placeholderText="mm/dd/yyyy"
                      selected={field.value}
                      onChange={(d) => field.onChange(d)}
                      minDate={new Date()}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      dateFormat="MM/dd/yyyy"
                      isClearable
                    />
                  )}
                />
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Time</label>
                <select
                  {...register("timeSlot")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Select time</option>
                  {TIME_SLOTS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                {errors.timeSlot && <p className="mt-1 text-sm text-red-600">{errors.timeSlot.message}</p>}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Special Requests / Notes</label>
              <textarea
                rows={4}
                placeholder="Any behaviors, allergies, sensitivities, or grooming preferences…"
                {...register("notes")}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              {errors.notes && <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/MyCareAppointments")}
                className="rounded-lg border border-slate-300 bg-white text-slate-700 px-4 py-2 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-violet-600 text-white px-5 py-2 font-semibold hover:bg-violet-700 disabled:opacity-60"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
