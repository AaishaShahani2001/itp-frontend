import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function PaymentSuccess() {
  const { state } = useLocation();
  const isAdoption = state?.isAdoption;

  return (
    <div className="min-h-[70vh] bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto rounded-2xl shadow-xl border border-gray-100 p-8 text-center">
        <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center bg-emerald-50">
          <span className="text-3xl">✅</span>
        </div>
        <h1 className="mt-4 text-2xl font-semibold">Payment Successful</h1>
        <p className="mt-2 text-gray-600">
          {isAdoption 
            ? "Thank you! Your adoption payment has been recorded." 
            : "Thank you! Your appointments have been marked as paid."
          }
        </p>

        <div className="mt-6 space-y-3">
          <Link
            to={isAdoption ? "/MyAdoptions" : "/myCareappointments"}
            className="inline-block w-full px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            {isAdoption ? "View My Adoptions" : "View My Appointments"}
          </Link>
          <Link
            to="/"
            className="inline-block w-full px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            Back to Home
          </Link>
        </div>

        <p className="mt-4 text-xs text-gray-400">Ref: DEMO-{Date.now()}</p>
      </div>
    </div>
  );
}
