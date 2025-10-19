import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useNavigate, useParams, useSearchParams, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

/* ---------- Date helpers (pin to local noon to avoid TZ shifts) ---------- */
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

/* ---------- Shared constants  ---------- */
const PET_TYPES = ["Dog", "Cat", "Rabbit", "Bird", "Other"];
const PET_SIZES = [
  { value: "small", label: "Small (0–10 kg)" },
  { value: "medium", label: "Medium (10–25 kg)" },
  { value: "large", label: "Large (25+ kg)" },
];

const buildSlots = () => {
  const slots = [];
  for (let m = 8 * 60; m <= 20 * 60; m += 30) {
    const h24 = Math.floor(m / 60);
    const mm = m % 60;
    const h12 = ((h24 + 11) % 12) + 1;
    const ampm = h24 >= 12 ? "PM" : "AM";
    const label = `${String(h12).padStart(2, "0")}:${String(mm).padStart(2, "0")} ${ampm}`;
    slots.push({ value: m, label });
  }
  return slots;
};
const TIME_SLOTS = buildSlots();

/* ---------- Email / name ---------- */
const NAME_REGEX = /^[A-Za-z\s]+$/;
const EMAIL_STARTS_WITH_LETTER = /^[A-Za-z][A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com","yopmail.com","guerrillamail.com","10minutemail.com",
  "temp-mail.org","tempmail.dev","discard.email","getnada.com","trashmail.com",
]);

/* ---------- Phone: +94 | 9-digits UI ---------- */
const LK_AFTER_CC_REGEX = /^(11|70|71|72|75|76|77|78)\d{7}$/; // 9 digits after +94

// "+94711234567" -> "711234567"; "0711234567" -> "711234567"; fallback: last 9 digits
function toNineAfter94(input = "") {
  const s = String(input);
  const m = s.match(/^\+94(\d{9})$/);
  if (m) return m[1];
  const digits = s.replace(/\D/g, "");
  if (digits.length === 10 && digits.startsWith("0")) return digits.slice(1);
  if (digits.length === 9) return digits;
  return digits.slice(-9);
}
function toE164FromNine(nine = "") {
  const v = String(nine || "").replace(/\D/g, "").slice(0, 9);
  return v ? `+94${v}` : "";
}

/* ---------- Validation ---------- */
const schema = yup.object({
  ownerName: yup
    .string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .required("Owner name is required.")
    .matches(NAME_REGEX, "Only letters and spaces are allowed.")
    .min(2, "Too short.")
    .max(60, "Too long."),
  ownerEmail: yup
    .string()
    .transform((v) => (typeof v === "string" ? v.trim().toLowerCase() : v))
    .required("Owner email is required.")
    .matches(EMAIL_STARTS_WITH_LETTER, "Email must start with a letter (e.g., aaisha@example.com).")
    .email("Enter a valid email (e.g., aaisha@example.com)")
    .max(254, "Email is too long.")
    .test("not-disposable", "Please use a real (non-disposable) email.", (val) => {
      if (!val || !val.includes("@")) return true;
      const domain = val.split("@")[1];
      return domain && !DISPOSABLE_DOMAINS.has(domain.toLowerCase());
    }),
  // store ONLY the 9 digits after +94 in form state
  ownerPhone: yup
    .string()
    .required("Contact number is required.")
    .matches(LK_AFTER_CC_REGEX, "Enter 9 digits after +94 (e.g., 711234567 or 112345678)"),
  petType: yup.string().oneOf(PET_TYPES, "Select a valid pet type").required("Select pet type."),
  petSize: yup.string().oneOf(PET_SIZES.map((p) => p.value), "Select a valid size").required("Select pet size."),
  date: yup
    .date()
    .typeError("Choose a valid date.")
    .required("Preferred date is required.")
    .min(new Date(new Date().setHours(0, 0, 0, 0)), "Date cannot be in the past."),
  timeSlot: yup.number().typeError("Select a time slot.").required("Time slot is required.").min(8 * 60).max(20 * 60),
  medicalFile: yup
    .mixed()
    .test("fileSize", "File too large (max 5 MB).", (value) => {
      if (!value || value.length === 0) return true;
      return value[0].size <= 5 * 1024 * 1024;
    })
    .test("fileType", "Only PDF, JPG or PNG allowed.", (value) => {
      if (!value || value.length === 0) return true;
      const okTypes = ["application/pdf", "image/jpeg", "image/png"];
      return okTypes.includes(value[0].type);
    }),
  notes: yup.string().max(500, "Keep notes under 500 characters."),
});

export default function EditVetForm() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { id: idFromParams } = useParams();
  const [params] = useSearchParams();
  const location = useLocation();

  // Prefer param, then query (?editId), then state
  const editId =
    idFromParams ||
    params.get("editId") ||
    location.state?.appointment?._id ||
    location.state?.appointment?.id;

  const selectedService = params.get("service") || "";
  const selectedPrice = params.get("price") || "";

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setValue,
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ownerName: "",
      ownerPhone: "", // 9 digits only (UI)
      ownerEmail: "",
      petType: "",
      petSize: "",
      reason: "",
      date: null,
      timeSlot: "",
      medicalFile: undefined,
      notes: "",
    },
  });

  const onOwnerNameInput = (e) => {
    const v = e.currentTarget.value.replace(/[^A-Za-z\s]/g, "");
    if (v !== e.currentTarget.value) e.currentTarget.value = v;
  };

  // ---- Fetch existing appointment ----
  useEffect(() => {
    let ignore = false;
    if (!editId) return;

    (async () => {
      try {
        const r = await fetch(`https://itp-backend-waw1.onrender.com/api/vet/${editId}`);
        const ct = r.headers.get("content-type") || "";
        const data = ct.includes("application/json") ? await r.json() : await r.text();

        if (!r.ok) {
          enqueueSnackbar("Failed to load appointment", { variant: "error" });
          return;
        }

        const appt = data?.data || data;
        if (!appt || ignore) return;

        const dateObj = appt.dateISO ? fromYMDToLocalDate(appt.dateISO) : null;

        const lockedReason =
          appt.reason && appt.reason.trim()
            ? appt.reason.trim()
            : (selectedService ? `Consultation for ${selectedService}` : "");

        reset({
          ownerName: appt.ownerName || "",
          ownerPhone: toNineAfter94(appt.ownerPhone || ""),  // E.164/local -> 9 digits
          ownerEmail: appt.ownerEmail || "",
          petType: appt.petType || "",
          petSize: appt.petSize || "",
          reason: lockedReason,
          date: dateObj,
          timeSlot: appt.timeSlotMinutes ?? "",
          medicalFile: undefined,
          notes: appt.notes || "",
        });

        setValue("reason", lockedReason, { shouldValidate: false, shouldDirty: false });
      } catch (e) {
        console.error(e);
        enqueueSnackbar("Error loading appointment", { variant: "error" });
      }
    })();

    return () => {
      ignore = true;
    };
  }, [editId, reset, setValue, enqueueSnackbar, selectedService]);

  const reasonLockedValue = watch("reason") || (selectedService ? `Consultation for ${selectedService}` : "");

  // ---- Submit update ----
  const onSubmit = async (values) => {
    try {
      const dateISO = toLocalYMD(normalizeToLocalNoon(values.date));

      const fd = new FormData();
      fd.append("ownerName", values.ownerName.trim());
      fd.append("ownerPhone", toE164FromNine(values.ownerPhone)); // send E.164
      fd.append("ownerEmail", values.ownerEmail.trim());
      fd.append("petType", values.petType);
      fd.append("petSize", values.petSize);

      fd.append("reason", (reasonLockedValue || "").trim()); // locked

      fd.append("dateISO", dateISO);
      fd.append("timeSlotMinutes", String(values.timeSlot));

      if (values.medicalFile && values.medicalFile.length > 0) {
        fd.append("medicalFile", values.medicalFile[0]);
      }
      fd.append("notes", values.notes || "");

      if (selectedService) fd.append("selectedService", selectedService);
      if (selectedPrice) fd.append("selectedPrice", selectedPrice);

      const UPDATE_URL = `https://itp-backend-waw1.onrender.com/api/vet/${editId}`;
      const r = await fetch(UPDATE_URL, { method: "PUT", body: fd });

      const ct = r.headers.get("content-type") || "";
      const result = ct.includes("application/json") ? await r.json() : await r.text();

      if (r.ok) {
        enqueueSnackbar("Appointment updated successfully!", { variant: "success" });

        // notify the list page to refetch, then navigate back
        window.dispatchEvent(
          new CustomEvent("appointments:changed", {
            detail: { service: "vet", id: editId, action: "updated" },
          })
        );

        navigate(`/myCareappointments?email=${encodeURIComponent(values.ownerEmail)}`);
        return;
      }

      enqueueSnackbar("❌ Error: " + (result?.message || "Update failed"), { variant: "error" });
    } catch (error) {
      console.error("Update error:", error);
      enqueueSnackbar("Something went wrong!", { variant: "error" });
    }
  };

  return (
    <section className="bg-white min-h-screen">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-gray-50 rounded-2xl p-6 ring-1 ring-black/5">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Edit Veterinary Appointment</h2>
          <p className="text-slate-600 mb-4">Update the details below and save your changes.</p>

          {selectedService && (
            <div className="mb-6 rounded-xl bg-blue-50 text-blue-800 px-4 py-3 ring-1 ring-blue-200">
              <div className="font-semibold">Selected Service:</div>
              <div className="text-sm">
                {selectedService} {selectedPrice && <span>• Rs. {selectedPrice}</span>}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Owner Name</label>
                <input
                  type="text"
                  placeholder="e.g., Aaisha Shahani"
                  {...register("ownerName")}
                  onInput={(e) => {
                    const v = e.currentTarget.value.replace(/[^A-Za-z\s]/g, "");
                    if (v !== e.currentTarget.value) e.currentTarget.value = v;
                  }}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.ownerName && <p className="mt-1 text-sm text-red-600">{errors.ownerName.message}</p>}
              </div>

              {/* ✅ Phone: +94 chip + 9 digits field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-slate-300 bg-slate-100 text-slate-700 select-none">+94</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={9}
                    placeholder="711234567 or 112345678"
                    {...register("ownerPhone")}
                    onInput={(e) => {
                      let v = e.currentTarget.value.replace(/\D/g, "");
                      if (v.startsWith("0")) v = v.slice(1);
                      e.currentTarget.value = v.slice(0, 9);
                    }}
                    className="w-full rounded-r-lg border border-slate-300 border-l-0 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="mt-1 text-[12px] text-slate-500">
                  Type the <b>9 digits after +94</b> (e.g., <code>711234567</code> or <code>112345678</code>).
                </p>
                {errors.ownerPhone && <p className="mt-1 text-sm text-red-600">{errors.ownerPhone.message}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Owner Email</label>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="aaisha@example.com"
                  {...register("ownerEmail")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.ownerEmail && <p className="mt-1 text-sm text-red-600">{errors.ownerEmail.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pet Type</label>
                <select
                  {...register("petType")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select pet type</option>
                  {PET_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                {errors.petType && <p className="mt-1 text-sm text-red-600">{errors.petType.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Size (with scale)</label>
                <select
                  {...register("petSize")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select size</option>
                  {PET_SIZES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                {errors.petSize && <p className="mt-1 text-sm text-red-600">{errors.petSize.message}</p>}
              </div>
            </div>

            {/* Reason (LOCKED in edit) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason for Consulting</label>
              <input
                type="text"
                readOnly
                {...register("reason")}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700
                           focus:outline-none focus:ring-0 cursor-not-allowed select-none"
              />
              <p className="mt-1 text-xs text-slate-500">Reason is locked for edits. To change it, create a new booking.</p>
              {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>}
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
                      onChange={(date) => field.onChange(date)}
                      minDate={new Date()}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      dateFormat="MM/dd/yyyy"
                      isClearable
                    />
                  )}
                />
                {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Preferred Time Slot</label>
                <select
                  {...register("timeSlot")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select time</option>
                  {TIME_SLOTS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                {errors.timeSlot && <p className="mt-1 text-sm text-red-600">{errors.timeSlot.message}</p>}
              </div>
            </div>

            {/* Medical file (optional replace) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Replace Medical File (optional)</label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                {...register("medicalFile")}
                className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700"
              />
              <p className="mt-1 text-xs text-slate-500">If you don’t choose a new file, the existing one remains.</p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes for the doctor</label>
              <textarea
                rows={3}
                placeholder="Allergies, medications, previous conditions, etc."
                {...register("notes")}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="rounded-lg bg-blue-600 text-white px-5 py-2 font-semibold hover:bg-blue-700 disabled:opacity-60"
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
