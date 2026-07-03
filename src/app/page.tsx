"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { formSchema, type PaymentFormData } from "@/lib/schema";

export default function HomePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isInstallment: "no",
      modeOfPayment: "Bank Transfer",
    },
  });

  const modeOfPayment = watch("modeOfPayment");
  const isInstallment = watch("isInstallment");
  const currency = watch("currency");

  const nextDueDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);

  const todayDate = useMemo(() => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }, []);

  const mapModeToApi = (mode: string): string => {
    switch (mode) {
      case "Bank Transfer": return "BANK";
      case "EasyPaisa": return "EASYPAISA";
      case "PayPal": return "PAYPAL";
      case "Other": return "OTHER";
      default: return "OTHER";
    }
  };

  const onSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    try {
      const paymentMode = mapModeToApi(data.modeOfPayment);

      const payload: Record<string, unknown> = {
        studentName: data.fullName,
        phoneNumber: data.phoneNumber,
        emailAddress: data.email,
        paymentMode,
        currency: data.currency,
        isInstallment: data.isInstallment === "yes",
        paymentDate: new Date().toISOString(),
      };

      if (data.isInstallment === "no") {
        payload.amountPaid = parseFloat(data.amountPaid || "0");
        payload.remainingAmount = 0;
      } else {
        payload.amountPaid = parseFloat(data.firstInstallmentPaid || "0");
        payload.remainingAmount = parseFloat(data.remainingAmount || "0");
      }

      if (paymentMode === "OTHER") {
        payload.paymentModeOther = data.otherPaymentMethod || "";
      }

      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate receipt");
      }

      const result = await res.json();

      // Download PDF
      const pdfRes = await fetch(result.pdfUrl);
      if (!pdfRes.ok) throw new Error("Failed to download PDF");
      const blob = await pdfRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt-${data.fullName.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("Receipt generated successfully!");
      reset();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-brand-light via-white to-brand-light">
      {/* Header */}
      <header className="border-b border-gray-200/60 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-blue text-white font-bold text-lg">
              HH
            </div>
            <div>
              <h1 className="text-lg font-bold text-brand-dark">
                Healthcare Hustlers
              </h1>
              <p className="text-xs text-gray-500">Invoice Portal</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Form */}
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-brand-dark sm:text-3xl">
            Generate Your Payment Receipt
          </h2>
          <p className="mt-2 text-gray-600">
            Fill in your details below to receive an official payment receipt.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="card space-y-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="form-label">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                {...register("fullName")}
                className={`input-field ${errors.fullName ? "border-red-400" : ""}`}
                placeholder="Enter your full name"
              />
              {errors.fullName && (
                <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="form-label">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phoneNumber"
                type="text"
                {...register("phoneNumber")}
                className={`input-field ${errors.phoneNumber ? "border-red-400" : ""}`}
                placeholder="e.g. 0300-1234567"
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-xs text-red-500">{errors.phoneNumber.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="form-label">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                {...register("email")}
                className={`input-field ${errors.email ? "border-red-400" : ""}`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Currency Selector */}
            <div>
              <label htmlFor="currency" className="form-label">
                Currency <span className="text-red-500">*</span>
              </label>
              <select
                id="currency"
                {...register("currency")}
                className="input-field"
              >
                <option value="PKR">PKR (Pakistani Rupee)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </div>

            {/* Mode of Payment */}
            <div>
              <label htmlFor="modeOfPayment" className="form-label">
                Mode of Payment <span className="text-red-500">*</span>
              </label>
              <select
                id="modeOfPayment"
                {...register("modeOfPayment")}
                className={`input-field ${errors.modeOfPayment ? "border-red-400" : ""}`}
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="PayPal">PayPal</option>
                <option value="Other">Other</option>
              </select>
              {errors.modeOfPayment && (
                <p className="mt-1 text-xs text-red-500">{errors.modeOfPayment.message}</p>
              )}
            </div>

            {/* Other Payment Method */}
            {modeOfPayment === "Other" && (
              <div>
                <label htmlFor="otherPaymentMethod" className="form-label">
                  Please specify payment method <span className="text-red-500">*</span>
                </label>
                <input
                  id="otherPaymentMethod"
                  type="text"
                  {...register("otherPaymentMethod")}
                  className={`input-field ${errors.otherPaymentMethod ? "border-red-400" : ""}`}
                  placeholder="Enter payment method"
                />
                {errors.otherPaymentMethod && (
                  <p className="mt-1 text-xs text-red-500">{errors.otherPaymentMethod.message}</p>
                )}
              </div>
            )}

            {/* Installment Selection */}
            <div>
              <span className="form-label">
                Are you paying in installments? <span className="text-red-500">*</span>
              </span>
              <div className="mt-2 flex gap-4">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-all has-[:checked]:border-brand-blue has-[:checked]:bg-blue-50 has-[:checked]:text-brand-blue">
                  <input
                    type="radio"
                    value="no"
                    {...register("isInstallment")}
                    className="h-4 w-4 accent-brand-blue"
                  />
                  No
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-all has-[:checked]:border-brand-blue has-[:checked]:bg-blue-50 has-[:checked]:text-brand-blue">
                  <input
                    type="radio"
                    value="yes"
                    {...register("isInstallment")}
                    className="h-4 w-4 accent-brand-blue"
                  />
                  Yes
                </label>
              </div>
              {errors.isInstallment && (
                <p className="mt-1 text-xs text-red-500">{errors.isInstallment.message}</p>
              )}
            </div>

            {/* If NOT installment */}
            {isInstallment === "no" && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="amountPaid" className="form-label">
                    How much payment is done? <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">{currency}</span>
                    <input
                      id="amountPaid"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register("amountPaid")}
                      className={`input-field pl-14 ${errors.amountPaid ? "border-red-400" : ""}`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.amountPaid && (
                    <p className="mt-1 text-xs text-red-500">{errors.amountPaid.message}</p>
                  )}
                </div>
                <div className="rounded-lg bg-gray-50 px-4 py-3">
                  <p className="text-sm text-gray-600">
                    Payment Date: <span className="font-medium text-gray-900">{todayDate}</span>
                  </p>
                </div>
              </div>
            )}

            {/* If installment */}
            {isInstallment === "yes" && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="firstInstallmentPaid" className="form-label">
                    1st installment paid? <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">{currency}</span>
                    <input
                      id="firstInstallmentPaid"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register("firstInstallmentPaid")}
                      className={`input-field pl-14 ${errors.firstInstallmentPaid ? "border-red-400" : ""}`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.firstInstallmentPaid && (
                    <p className="mt-1 text-xs text-red-500">{errors.firstInstallmentPaid.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="remainingAmount" className="form-label">
                    Remaining amount? <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">{currency}</span>
                    <input
                      id="remainingAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      {...register("remainingAmount")}
                      className={`input-field pl-14 ${errors.remainingAmount ? "border-red-400" : ""}`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.remainingAmount && (
                    <p className="mt-1 text-xs text-red-500">{errors.remainingAmount.message}</p>
                  )}
                </div>
                <div className="rounded-lg border border-brand-blue/20 bg-blue-50 px-4 py-3">
                  <p className="text-sm text-brand-blue">
                    Your next installment is due on:{" "}
                    <span className="font-bold">{nextDueDate}</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating Receipt...
              </span>
            ) : (
              "Generate Receipt"
            )}
          </button>
        </form>

        <footer className="mt-12 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Healthcare Hustlers. All rights reserved.
        </footer>
      </main>
    </div>
  );
}