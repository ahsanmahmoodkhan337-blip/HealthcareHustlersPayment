"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { formSchema, type PaymentFormData } from "@/lib/schema";

// ── Inline SVG Icons ─────────────────────────────────────────────
const IconUser = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const IconPhone = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
  </svg>
);

const IconMail = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
  </svg>
);

const IconCurrency = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconPayment = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
  </svg>
);

const IconInstallment = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const IconCheckCircle = () => (
  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconShield = () => (
  <svg className="h-4 w-4 text-brand-blue" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

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
    <div className="min-h-dvh bg-gradient-to-br from-blue-50/60 via-white to-blue-50/30">
      {/* ─────── Background Decorative Elements ─────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-brand-blue/5 to-transparent blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-gradient-to-tl from-brand-blue/5 to-transparent blur-3xl" />
        <div className="absolute left-1/2 top-1/4 h-[300px] w-[800px] -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-blue/3 to-transparent blur-2xl" />
      </div>

      {/* ─────── Header ─────── */}
      <header className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <img
              src="/healthcare-hustlers-logo.png"
              alt="Healthcare Hustlers"
              className="h-11 w-auto drop-shadow-sm"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold tracking-tight text-brand-dark">
                Healthcare Hustlers
              </h1>
              <p className="text-[11px] font-medium tracking-wide text-gray-400 uppercase">
                Official Invoice Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/login"
              className="rounded-lg border border-gray-200 bg-white/80 px-3.5 py-2 text-xs font-semibold text-brand-secondary shadow-sm transition-all hover:border-brand-blue/30 hover:bg-blue-50/50 hover:text-brand-blue"
            >
              Admin Portal
            </a>
          </div>
        </div>
      </header>

      {/* ─────── Main Content ─────── */}
      <main className="relative mx-auto max-w-3xl px-4 pb-32 pt-10 sm:px-6 lg:px-8">
        {/* ── Hero Section ── */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-brand-blue/15 bg-blue-50/60 px-4 py-1.5 text-xs font-medium text-brand-blue shadow-sm">
            <IconShield />
            <span>Secure & Official Payment Portal</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-dark sm:text-4xl lg:text-5xl">
            Generate Your{" "}
            <span className="bg-gradient-to-r from-brand-blue to-brand-blue-dark bg-clip-text text-transparent">
              Payment Receipt
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-gray-500">
            Fill in your details below and receive an official, timestamped PDF receipt for your records.
          </p>
        </div>

        {/* ── Step Indicator ── */}
        <div className="mb-10 flex items-center justify-center gap-0">
          <div className="flex items-center gap-2 rounded-full bg-brand-blue/10 px-4 py-2 text-xs font-semibold text-brand-blue">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue text-[10px] font-bold text-white">1</span>
            Fill Details
          </div>
          <div className="mx-2 h-px w-12 bg-gradient-to-r from-brand-blue/40 to-gray-200" />
          <div className="flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300 text-[10px] font-bold text-white">2</span>
            Get Receipt
          </div>
        </div>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="card-elevated space-y-0">
            {/* ── Section: Personal Information ── */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue/10">
                  <IconUser />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Personal Information</h3>
                  <p className="text-xs text-gray-400">Your contact details for the receipt</p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label htmlFor="fullName" className="form-label">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon"><IconUser /></span>
                    <input
                      id="fullName"
                      type="text"
                      {...register("fullName")}
                      className={`input-field pl-11 ${errors.fullName ? "border-red-300 bg-red-50/50" : ""}`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {errors.fullName && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">{errors.fullName.message}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phoneNumber" className="form-label">
                    Phone Number <span className="text-red-400">*</span>
                  </label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon"><IconPhone /></span>
                    <input
                      id="phoneNumber"
                      type="text"
                      {...register("phoneNumber")}
                      className={`input-field pl-11 ${errors.phoneNumber ? "border-red-300 bg-red-50/50" : ""}`}
                      placeholder="e.g. 0300-1234567"
                    />
                  </div>
                  {errors.phoneNumber && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">{errors.phoneNumber.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="form-label">
                    Email Address <span className="text-red-400">*</span>
                  </label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon"><IconMail /></span>
                    <input
                      id="email"
                      type="email"
                      {...register("email")}
                      className={`input-field pl-11 ${errors.email ? "border-red-300 bg-red-50/50" : ""}`}
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">{errors.email.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Divider ── */}
            <div className="section-divider">
              <div className="flex justify-center">
                <span className="section-title">Payment Details</span>
              </div>
            </div>

            {/* ── Section: Payment Details ── */}
            <div>
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-blue/10">
                  <IconPayment />
                </div>
                <div>
                  <h3 className="text-base font-bold text-brand-dark">Payment Information</h3>
                  <p className="text-xs text-gray-400">How and how much you're paying</p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Currency */}
                <div>
                  <label htmlFor="currency" className="form-label">
                    Currency <span className="text-red-400">*</span>
                  </label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon"><IconCurrency /></span>
                    <select
                      id="currency"
                      {...register("currency")}
                      className="input-field pl-11 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239ca3af%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10"
                    >
                      <option value="PKR">PKR (Pakistani Rupee)</option>
                      <option value="USD">USD (US Dollar)</option>
                    </select>
                  </div>
                </div>

                {/* Mode of Payment */}
                <div>
                  <label htmlFor="modeOfPayment" className="form-label">
                    Mode of Payment <span className="text-red-400">*</span>
                  </label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon"><IconPayment /></span>
                    <select
                      id="modeOfPayment"
                      {...register("modeOfPayment")}
                      className={`input-field pl-11 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239ca3af%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_0.75rem_center] bg-no-repeat pr-10 ${errors.modeOfPayment ? "border-red-300 bg-red-50/50" : ""}`}
                    >
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="EasyPaisa">EasyPaisa</option>
                      <option value="PayPal">PayPal</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {errors.modeOfPayment && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">{errors.modeOfPayment.message}</p>
                  )}
                </div>
              </div>

              {/* Other Payment Method */}
              {modeOfPayment === "Other" && (
                <div className="mt-5 animate-[fadeIn_0.2s_ease-out]">
                  <label htmlFor="otherPaymentMethod" className="form-label">
                    Please specify payment method <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="otherPaymentMethod"
                    type="text"
                    {...register("otherPaymentMethod")}
                    className={`input-field ${errors.otherPaymentMethod ? "border-red-300 bg-red-50/50" : ""}`}
                    placeholder="Enter your payment method..."
                  />
                  {errors.otherPaymentMethod && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">{errors.otherPaymentMethod.message}</p>
                  )}
                </div>
              )}

              {/* Installment Selection */}
              <div className="mt-6">
                <div className="mb-3 flex items-center gap-2">
                  <IconInstallment />
                  <span className="form-label mb-0">
                    Are you paying in installments? <span className="text-red-400">*</span>
                  </span>
                </div>
                <div className="flex gap-3">
                  <label className="radio-chip flex-1 justify-center">
                    <input
                      type="radio"
                      value="no"
                      {...register("isInstallment")}
                      className="h-4 w-4 accent-brand-blue"
                    />
                    No, Full Payment
                  </label>
                  <label className="radio-chip flex-1 justify-center">
                    <input
                      type="radio"
                      value="yes"
                      {...register("isInstallment")}
                      className="h-4 w-4 accent-brand-blue"
                    />
                    Yes, Installment
                  </label>
                </div>
                {errors.isInstallment && (
                  <p className="mt-1.5 text-xs font-medium text-red-500">{errors.isInstallment.message}</p>
                )}
              </div>

              {/* ── Conditional Amount Fields ── */}
              <div className="mt-6 animate-[fadeIn_0.2s_ease-out]">
                {/* If NOT installment */}
                {isInstallment === "no" && (
                  <div className="space-y-5">
                    <div>
                      <label htmlFor="amountPaid" className="form-label">
                        How much payment is done? <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 font-medium text-gray-500">{currency}</span>
                        <input
                          id="amountPaid"
                          type="number"
                          step="0.01"
                          min="0"
                          {...register("amountPaid")}
                          className={`input-field pl-12 ${errors.amountPaid ? "border-red-300 bg-red-50/50" : ""}`}
                          placeholder="0.00"
                        />
                      </div>
                      {errors.amountPaid && (
                        <p className="mt-1.5 text-xs font-medium text-red-500">{errors.amountPaid.message}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50/60 px-5 py-3.5">
                      <IconCheckCircle />
                      <p className="text-sm text-gray-600">
                        Payment Date:{" "}
                        <span className="font-semibold text-gray-900">{todayDate}</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* If installment */}
                {isInstallment === "yes" && (
                  <div className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="firstInstallmentPaid" className="form-label">
                          1st installment paid? <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 font-medium text-gray-500">{currency}</span>
                          <input
                            id="firstInstallmentPaid"
                            type="number"
                            step="0.01"
                            min="0"
                            {...register("firstInstallmentPaid")}
                            className={`input-field pl-12 ${errors.firstInstallmentPaid ? "border-red-300 bg-red-50/50" : ""}`}
                            placeholder="0.00"
                          />
                        </div>
                        {errors.firstInstallmentPaid && (
                          <p className="mt-1.5 text-xs font-medium text-red-500">{errors.firstInstallmentPaid.message}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="remainingAmount" className="form-label">
                          Remaining amount? <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 font-medium text-gray-500">{currency}</span>
                          <input
                            id="remainingAmount"
                            type="number"
                            step="0.01"
                            min="0"
                            {...register("remainingAmount")}
                            className={`input-field pl-12 ${errors.remainingAmount ? "border-red-300 bg-red-50/50" : ""}`}
                            placeholder="0.00"
                          />
                        </div>
                        {errors.remainingAmount && (
                          <p className="mt-1.5 text-xs font-medium text-red-500">{errors.remainingAmount.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-brand-blue/15 bg-gradient-to-r from-blue-50/80 to-white px-5 py-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue/10">
                        <svg className="h-4 w-4 text-brand-blue" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-brand-blue">
                          Your next installment is due on:{" "}
                          <span className="font-bold">{nextDueDate}</span>
                        </p>
                        <p className="text-[11px] text-brand-blue/60">15 days from today</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Submit Button ── */}
          <div className="mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full text-base"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2.5">
                  <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating Your Receipt...
                </span>
              ) : (
                <span className="flex items-center gap-2.5">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Generate Receipt
                </span>
              )}
            </button>
          </div>
        </form>

        {/* ── Trust Badges ── */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <IconShield />
            <span>SSL Secured</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <IconCheckCircle />
            <span>Official Receipt</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
            </svg>
            <span>Instant PDF Download</span>
          </div>
        </div>

        {/* ── Footer ── */}
        <footer className="mt-12 border-t border-gray-100 pt-6 text-center">
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <a href="/admin/login" className="text-brand-blue transition-colors hover:text-brand-blue-dark">
              Admin Portal
            </a>
            <span className="text-gray-300">&middot;</span>
            <span>&copy; {new Date().getFullYear()} Healthcare Hustlers. All rights reserved.</span>
          </div>
        </footer>
      </main>
    </div>
  );
}