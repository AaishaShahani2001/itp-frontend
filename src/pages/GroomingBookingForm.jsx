// src/pages/GroomingBookingForm.jsx
import React from "react";
import { useSnackbar } from "notistack";
import { useNavigate, useSearchParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import groomingImg from "../assets/grooming.jpg";
import { useAppContext } from "../context/AppContext";
import axios from "axios";

// ---- helpers: local-date formatting (no UTC shift) ----
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

// Accept 9 digits after +94
const LK_AFTER_CC_REGEX = /^(11|70|71|72|75|76|77|78)\d{7}$/;

// Pet types
const PET_TYPES = ["Dog", "Cat", "Rabbit", "Bird", "Other"];

// Packages
const PACKAGES = [
  { id: "basic-bath-brush", name: "Basic Bath & Brush", price: 2500 },
  { id: "full-grooming", name: "Full Grooming Package", price: 6500 },
  { id: "nail-trim", name: "Nail Trim Only", price: 1500 },
  { id: "deshedding", name: "De-shedding Treatment", price: 4500 },
  { id: "flea-tick", name: "Flea & Tick Treatment", price: 5500 },
  { id: "premium-spa", name: "Premium Spa Package", price: 9500 },
];

// Half-hour slots 08:00–20:00
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

/* ------- validation ------- */
const NAME_REGEX = /^[A-Za-z\s]+$/;

const schema = yup.object({
  ownerName: yup
    .string()
    .transform((v) => (typeof v === "string" ? v.trim() : v))
    .required("Owner name is required")
    .matches(NAME_REGEX, "Only letters and spaces")
    .min(2, "Too short")
    .max(60, "Too long"),
  phone: yup
    .string()
    .required("Phone is required")
    .matches(LK_AFTER_CC_REGEX, "Enter 9 digits after +94 (e.g., 711234567 or 112345678)"),
  email: yup.string().email("Enter a valid email").required("Email is required"),
  petType: yup.string().oneOf(PET_TYPES).required("Select pet type"),
  packageId: yup.string().oneOf(PACKAGES.map((p) => p.id)).required("Select a package"),
  date: yup
    .date()
    .typeError("Choose a valid date.")
    .required("Preferred date is required.")
    .min(new Date(new Date().setHours(0, 0, 0, 0)), "Date cannot be in the past."),
  timeSlot: yup.number().typeError("Select a time slot.").required("Select a time").min(480).max(1200),
  notes: yup.string().max(400),
});

export default function GroomingBookingForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const { token, backendUrl } = useAppContext();

  // Prefill from query
  const preService = params.get("service") || "";
  const prePrice = params.get("price") || "";
  const defaultPkg =
    PACKAGES.find((p) => p.name === preService || String(p.price) === prePrice)?.id || "";
  const isLockedPackage = Boolean(defaultPkg);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ownerName: "",
      phone: "",
      email: "",
      petType: "",
      packageId: defaultPkg,
      date: null,
      timeSlot: undefined,
      notes: "",
    },
  });

  const onSubmit = async (vals) => {
  // ✅ No redirect. Just notify and stop.
  if (!token) {
    enqueueSnackbar("Unauthorized. Login Again", { variant: "warning" });
    return;
  }

  const dateISO = toLocalYMD(normalizeToLocalNoon(vals.date));
  const payload = {
    ownerName: vals.ownerName.trim(),
    phone: `+94${vals.phone}`,
    email: vals.email.trim(),
    petType: vals.petType,
    packageId: vals.packageId,
    dateISO,
    timeSlotMinutes: Number(vals.timeSlot),
    notes: vals.notes?.trim() || "",
  };

  try {
    const res = await axios.post(`${backendUrl}/api/grooming/appointments`, payload, {
      headers: { token },
    });

    if (res.data?.ok) {
      enqueueSnackbar("✅ Grooming appointment created!", { variant: "success" });
      navigate("/book/grooming");
      return;
    }

    enqueueSnackbar(res.data?.message || res.data?.error || "Request failed", { variant: "error" });
  } catch (err) {
    const status = err?.response?.status;
    const apiMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message;

    // 
    if (status === 401) {
      enqueueSnackbar("Unauthorized. Login Again", { variant: "warning" });
      return;
    }

    enqueueSnackbar(`❌ ${apiMsg || "Something went wrong."}`, { variant: "error" });
  }
};

  const pkgById = (id) => PACKAGES.find((p) => p.id === id);
  const lockedLabel = defaultPkg ? `${pkgById(defaultPkg)?.name} — Rs.${pkgById(defaultPkg)?.price}` : "";

  return (
    <section className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          <div className="relative overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5">
            <img src={groomingImg} alt="Pet grooming" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-fuchsia-600/20 to-violet-600/10" />
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 ring-1 ring-black/5">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">Book Grooming Appointment</h2>
            <p className="text-slate-600 mb-4">Choose a package and your preferred date &amp; time.</p>

            {preService && (
              <div className="mb-6 rounded-xl bg-violet-50 text-violet-900 px-4 py-3 ring-1 ring-violet-200">
                <div className="font-semibold">Selected:</div>
                <div className="text-sm">
                  {preService} {prePrice && <span>• Rs. {prePrice}</span>}
                </div>
              </div>
            )}

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

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-slate-300 bg-slate-100 text-slate-700 select-none">
                      +94
                    </span>
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
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  {errors.petType && <p className="mt-1 text-sm text-red-600">{errors.petType.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Service Package</label>
                  {isLockedPackage ? (
                    <>
                      <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                        {lockedLabel}
                      </div>
                      <input type="hidden" value={defaultPkg} {...register("packageId")} />
                    </>
                  ) : (
                    <select
                      {...register("packageId")}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="">Select a package</option>
                      {PACKAGES.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — Rs.{p.price}
                        </option>
                      ))}
                    </select>
                  )}
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
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
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
                  onClick={() => navigate("/book/grooming")}
                  className="rounded-lg border border-slate-300 bg-white text-slate-700 px-4 py-2 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-violet-600 text-white px-5 py-2 font-semibold hover:bg-violet-700 disabled:opacity-60"
                >
                  {isSubmitting ? "Booking..." : "Book Appointment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
