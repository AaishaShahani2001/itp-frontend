// src/pages/VetAppointmentBookingForm.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useSnackbar } from "notistack";
import { useNavigate, useSearchParams } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import vetImg from "../assets/vet.jpg";
import { useAppContext } from "../context/AppContext";
import axios from "axios";

function toLocalYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function normalizeToLocalNoon(d) {
  const copy = new Date(d);
  copy.setHours(12, 0, 0, 0);
  return copy;
}

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

/* ---------- Validation (images only) ---------- */
const NAME_REGEX = /^[A-Za-z\s]+$/;
const EMAIL_STARTS_WITH_LETTER = /^[A-Za-z][A-Za-z0-9._%+-]*@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const LK_AFTER_CC_REGEX = /^(11|70|71|72|75|76|77|78)\d{7}$/;

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
    .max(254, "Email is too long."),
  ownerPhone: yup
    .string()
    .required("Contact number is required.")
    .matches(LK_AFTER_CC_REGEX, "Enter 9 digits after +94 (e.g., 711234567 or 112345678)."),
  petType: yup.string().oneOf(PET_TYPES, "Select a valid pet type").required("Select pet type."),
  petSize: yup
    .string()
    .oneOf(PET_SIZES.map((p) => p.value), "Select a valid size")
    .required("Select pet size."),
  reason: yup
    .string()
    .required("Reason is required.")
    .min(5, "Please add a bit more detail.")
    .max(300, "Keep it under 300 characters."),
  date: yup
    .date()
    .typeError("Choose a valid date.")
    .required("Preferred date is required.")
    .min(new Date(new Date().setHours(0, 0, 0, 0)), "Date cannot be in the past."),
  timeSlot: yup
    .number()
    .typeError("Select a time slot.")
    .required("Time slot is required.")
    .min(8 * 60)
    .max(20 * 60),
  // ✅ Images only + friendly message
  medicalFile: yup
    .mixed()
    .test("fileSize", "File too large (max 5 MB).", (value) => {
      if (!value || value.length === 0) return true;
      return value[0].size <= 5 * 1024 * 1024;
    })
    .test("fileType", "Please upload PNG, JPG or JPEG medical file.", (value) => {
      if (!value || value.length === 0) return true;
      const type = value[0].type;
      return type === "image/jpeg" || type === "image/png";
    }),
  notes: yup.string().max(500, "Keep notes under 500 characters."),
});

export default function VetAppointmentBookingForm() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();
  const { token, backendUrl } = useAppContext();

  const selectedService = params.get("service") || "";
  const selectedPrice = params.get("price") || "";
  const lockedReason = selectedService ? `Consultation for ${selectedService}` : "";

  const {
    register,
    handleSubmit,
    control,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      ownerName: "",
      ownerPhone: "",
      ownerEmail: "",
      petType: "",
      petSize: "",
      reason: lockedReason || "",
      date: null,
      timeSlot: undefined,
      medicalFile: undefined,
      notes: "",
    },
  });

  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const chosenDate = watch("date");

  useEffect(() => {
    const run = async () => {
      setBookedSlots([]);
      if (!chosenDate) return;
      setLoadingSlots(true);
      try {
        const ymd = toLocalYMD(normalizeToLocalNoon(chosenDate));
        const resp = await axios.get(`${backendUrl}/api/vet/appointments`, {
          params: { date: ymd },
        });
        const minutes = (resp.data || [])
          .map((a) => Number(a?.startMinutes))
          .filter(Number.isFinite);
        setBookedSlots(Array.from(new Set(minutes)));
      } catch {
      } finally {
        setLoadingSlots(false);
      }
    };
    run();
  }, [chosenDate, backendUrl]);

  const isSlotBooked = (m) => bookedSlots.includes(Number(m));

  const onSubmit = async (values) => {
    try {
      const fd = new FormData();
      fd.append("ownerName", values.ownerName.trim());
      fd.append("ownerPhone", `+94${values.ownerPhone}`);
      fd.append("ownerEmail", values.ownerEmail.trim());
      fd.append("petType", values.petType);
      fd.append("petSize", values.petSize);
      fd.append("reason", (lockedReason || values.reason || "").trim());
      fd.append("dateISO", toLocalYMD(normalizeToLocalNoon(values.date)));
      fd.append("timeSlotMinutes", String(values.timeSlot));
      if (values.medicalFile?.length > 0) fd.append("medicalFile", values.medicalFile[0]);
      fd.append("notes", values.notes || "");
      if (selectedService) fd.append("selectedService", selectedService);
      if (selectedPrice) fd.append("selectedPrice", selectedPrice);

      const res = await axios.post(`${backendUrl}/api/vet/appointments`, fd, {
        headers: { token },
      });

      if (res.data?.ok) {
        enqueueSnackbar("✅ Vet appointment created!", { variant: "success" });
        navigate("/book/vetappointment");
      } else {
        enqueueSnackbar(res.data?.message || "Request failed", { variant: "error" });
      }
    } catch (error) {
      const msg = error?.response?.data?.message || error.message || "Something went wrong!";
      if (error?.response?.status === 409) {
        enqueueSnackbar(msg, { variant: "warning" });
        setError("timeSlot", { type: "manual", message: msg });
      } else {
        enqueueSnackbar(msg, { variant: "error" });
      }
    }
  };

  const onOwnerNameInput = (e) => {
    const v = e.currentTarget.value.replace(/[^A-Za-z\s]/g, "");
    if (v !== e.currentTarget.value) e.currentTarget.value = v;
  };

  return (
    <section className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Left: Image */}
          <div className="relative overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5">
            <img src={vetImg} alt="Veterinary care" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 to-indigo-600/10" />
          </div>

          {/* Right: Form */}
          <div className="bg-gray-50 rounded-2xl p-6 ring-1 ring-black/5">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
              Book Veterinary Care
            </h2>
            <p className="text-slate-600 mb-4">
              Fill in the details below and we’ll confirm your appointment.
            </p>

            {selectedService && (
              <div className="mb-6 rounded-xl bg-blue-50 text-blue-800 px-4 py-3 ring-1 ring-blue-200">
                <div className="font-semibold">Selected Service:</div>
                <div className="text-sm">
                  {selectedService} {selectedPrice && <span>• Rs. {selectedPrice}</span>}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Owner info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Owner Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Aaisha Shahani"
                    {...register("ownerName")}
                    onInput={onOwnerNameInput}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.ownerName && (
                    <p className="mt-1 text-sm text-red-600">{errors.ownerName.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 rounded-l-lg border border-slate-300 bg-slate-100 text-slate-700 select-none">
                      +94
                    </span>
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
                    Type the <b>9 digits after +94</b> (e.g., <code>711234567</code> or{" "}
                    <code>112345678</code>).
                  </p>
                  {errors.ownerPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.ownerPhone.message}</p>
                  )}
                </div>

                {/* Owner Email */}
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
                  {errors.ownerEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.ownerEmail.message}</p>
                  )}
                </div>
              </div>

              {/* Pet type & size */}
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
                  {errors.petType && (
                    <p className="mt-1 text-sm text-red-600">{errors.petType.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Size (with scale)
                  </label>
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
                  {errors.petSize && (
                    <p className="mt-1 text-sm text-red-600">{errors.petSize.message}</p>
                  )}
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Reason for Consulting
                </label>
                {lockedReason ? (
                  <>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                      {lockedReason}
                    </div>
                    <input type="hidden" value={lockedReason} {...register("reason")} />
                  </>
                ) : (
                  <>
                    <textarea
                      rows={3}
                      placeholder="Describe symptoms, concerns, or what you’d like the vet to check…"
                      {...register("reason")}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.reason && (
                      <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>
                    )}
                  </>
                )}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Preferred Date
                  </label>
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
                  {errors.date && (
                    <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Preferred Time Slot
                  </label>
                  <select
                    {...register("timeSlot")}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                    disabled={loadingSlots}
                  >
                    <option value="">{loadingSlots ? "Loading slots…" : "Select time"}</option>
                    {TIME_SLOTS.map((t) => {
                      const taken = isSlotBooked(t.value);
                      return (
                        <option key={t.value} value={t.value} disabled={taken}>
                          {t.label}
                          {taken ? " (booked)" : ""}
                        </option>
                      );
                    })}
                  </select>
                  {errors.timeSlot && (
                    <p className="mt-1 text-sm text-red-600">{errors.timeSlot.message}</p>
                  )}
                  {bookedSlots.length > 0 && (
                    <p className="mt-1 text-xs text-slate-500">
                      Times marked “(booked)” are unavailable for the selected date.
                    </p>
                  )}
                </div>
              </div>

              {/* Medical file — ✅ images only */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Medical File (optional)
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"   // <-- removed .pdf
                  {...register("medicalFile")}
                  className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Accepted: PNG, JPG, JPEG only. Max 5&nbsp;MB.
                </p>
                {errors.medicalFile && (
                  <p className="mt-1 text-sm text-red-600">{errors.medicalFile.message}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Any notes for the doctor?
                </label>
                <textarea
                  rows={3}
                  placeholder="Allergies, medications, previous conditions, etc."
                  {...register("notes")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                />
                {errors.notes && (
                  <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/book/vetappointment")}
                  className="rounded-lg border border-slate-300 bg-white text-slate-700 px-4 py-2 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-600 text-white px-5 py-2 font-semibold hover:bg-blue-700 disabled:opacity-60"
                >
                  {isSubmitting ? "Booking..." : "Book Vet Care"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
