// src/pages/UploadSlipPage.jsx
import React, { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { useAppContext } from "../context/AppContext";

const API_BASE = "https://itp-backend-waw1.onrender.com";

// Allowed slip file types & size (match the text on the UI)
const ALLOWED_TYPES = ["image/png", "image/jpeg", "application/pdf"];
const MAX_BYTES = 10 * 1024 * 1024; // 10MB

export default function UploadSlipPage() {
  const { state } = useLocation();
  const order = state?.order; // { currency, subtotal, items: [...] }
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { token } = useAppContext();

  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const inputRef = useRef(null);

  // If user lands here directly without order in state → bounce back
  React.useEffect(() => {
    if (!order || !Array.isArray(order.items) || order.items.length === 0) {
      enqueueSnackbar("No order found. Please start payment again.", { variant: "warning" });
      navigate(-1);
    }
  }, [order, enqueueSnackbar, navigate]);

  const grandTotal = useMemo(() => {
    if (!order?.items) return 0;
    return order.items.reduce((sum, it) => sum + Number(it.lineTotal || 0), 0);
  }, [order]);

  function onPickFile(e) {
    const f = e.target.files?.[0];
    if (f) validateAndSet(f);
  }

  function onDrop(e) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) validateAndSet(f);
  }

  function validateAndSet(f) {
    if (!ALLOWED_TYPES.includes(f.type)) {
      enqueueSnackbar("Only PNG, JPG, or PDF files are allowed.", { variant: "error" });
      return;
    }
    if (f.size > MAX_BYTES) {
      enqueueSnackbar("File is too large. Max 10MB.", { variant: "error" });
      return;
    }
    setFile(f);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      enqueueSnackbar("Please choose a transfer slip file.", { variant: "warning" });
      return;
    }

    try {
      setSubmitting(true);

      // Build multipart/form-data with: slip + order JSON
      const form = new FormData();
      form.append("slip", file);
      form.append("order", JSON.stringify(order));

      // Example endpoint. Adjust to your backend.
      const res = await fetch(`${API_BASE}/api/payments/upload-slip`, {
        method: "POST",
        headers: { token }, // auth
        body: form,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Upload failed");
      }

      enqueueSnackbar("Transfer slip uploaded. We’ll verify your payment soon.", {
        variant: "success",
      });

      // Successful payment - pass service type to success page
      const hasAdoption = order?.items?.some(item => item.service === "adoption");
      navigate("/payment-success", { state: { isAdoption: hasAdoption } }); 
     
    } catch (err) {
      enqueueSnackbar(err.message || "Something went wrong", { variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Simple image preview (for PNG/JPG). PDFs show just file name.
  const previewUrl = useMemo(() => {
    if (!file) return null;
    if (file.type === "application/pdf") return null;
    return URL.createObjectURL(file);
  }, [file]);

  if (!order) return null; // brief guard while effect redirects

  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header / Title */}
      <div className="rounded-2xl p-5 bg-gradient-to-r from-green-600 to-green-500 text-white">
        <h1 className="text-xl md:text-2xl font-bold">Upload Bank Transfer Slip</h1>
        <p className="text-white/90 mt-1 text-sm">
          Please upload a clear image or PDF of your transfer slip. Ensure all transaction details
          are visible and readable.
        </p>
      </div>

      {/* Order summary card */}
      <div className="bg-white rounded-2xl p-5 mt-5 ring-1 ring-black/5">
        <h2 className="font-semibold text-slate-900">Order Summary</h2>

        <ul className="mt-3 divide-y">
          {order.items.map((it) => (
            <li key={it.id} className="py-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <div>
                  <div className="font-medium text-slate-900">
                    {it.service?.toUpperCase?.()} • {it.title}
                  </div>
                  <div className="text-xs text-slate-600">
                    {it.date} • {it.time}
                  </div>
                </div>
                <div className="font-semibold">
                  Rs. {Number(it.lineTotal || 0).toFixed(2)}
                </div>
              </div>

              {!!(it.extras?.length) && (
                <ul className="mt-2 ml-4 text-sm text-slate-700 list-disc">
                  {it.extras.map((e, idx) => (
                    <li key={idx}>
                      Extra · {e.name} (+Rs. {Number(e.price || 0).toFixed(2)})
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-between pt-3 mt-2 border-t">
          <div className="text-slate-600 text-sm">Total</div>
          <div className="text-lg font-bold">
            Rs. {Number(grandTotal).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Upload box */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 mt-5 ring-1 ring-black/5">
        <h3 className="font-semibold text-slate-900">Bank Transfer Slip</h3>

        {/* Drag & drop zone */}
        <div
          className="mt-3 border-2 border-dashed rounded-xl p-6 text-center"
          onDrop={onDrop}
          onDragOver={preventDefaults}
          onDragEnter={preventDefaults}
          onDragLeave={preventDefaults}
        >
          <div className="text-3xl">⬆️</div>
          <p className="mt-2">
            <button
              type="button"
              className="text-indigo-600 font-semibold underline"
              onClick={() => inputRef.current?.click()}
            >
              Choose File
            </button>{" "}
            or drag and drop
          </p>
          <p className="text-xs text-slate-500 mt-1">PNG, JPG, PDF up to 10MB</p>

          <input
            ref={inputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.pdf"
            onChange={onPickFile}
            className="hidden"
          />

          {file && (
            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="text-sm text-slate-700 font-medium">{file.name}</div>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-h-56 rounded-lg ring-1 ring-black/10"
                />
              ) : (
                <div className="text-xs text-slate-500">Preview not available for PDF</div>
              )}
            </div>
          )}
        </div>

        <div className="bg-blue-50 text-blue-900 text-sm rounded-lg px-3 py-2 mt-4">
          Please upload a clear image of your bank transfer slip to confirm your payment.
          Make sure all transaction details are visible and readable.
        </div>

        <div className="mt-5">
          <button
            type="submit"
            disabled={submitting || !file}
            className="w-full sm:w-auto rounded-lg bg-emerald-600 text-white px-4 py-2 font-semibold disabled:opacity-50"
          >
            {submitting ? "Uploading..." : file ? "Continue" : "Please upload transfer slip"}
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="ml-2 w-full sm:w-auto rounded-lg border px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
}
