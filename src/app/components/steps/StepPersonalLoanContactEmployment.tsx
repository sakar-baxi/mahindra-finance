"use client";

import React, { useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import StepCard from "@/app/components/layout/StepCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const EMPLOYMENT_OPTIONS = ["Salaried", "Self-employed", "Other"] as const;

export default function StepPersonalLoanContactEmployment() {
  const { nextStep, formData, updateFormData, prefilledData } = useJourney();
  const [email, setEmail] = useState(formData?.email ?? prefilledData?.email ?? "");
  const [phone, setPhone] = useState(formData?.phone ?? formData?.mobileNumber ?? prefilledData?.mobileNumber ?? prefilledData?.phone ?? "");
  const [remark, setRemark] = useState(formData?.remark ?? "");
  const [employmentType, setEmploymentType] = useState<string>(formData?.employmentType ?? "Salaried");
  const [agreeTerms, setAgreeTerms] = useState(!!formData?.agreeTerms);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFormData({
      email,
      phone,
      mobileNumber: phone,
      remark,
      employmentType,
      agreeTerms,
    });
    nextStep();
  };

  return (
    <StepCard maxWidth="2xl">
      <p className="text-sm font-medium text-slate-500 mb-1">Step 2 out of 4</p>
      <h1 className="text-2xl font-bold text-[#111827] mb-6">Contact & Employment</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label className="text-xs font-semibold uppercase text-slate-500">EMAIL</Label>
          <Input
            type="email"
            placeholder="Enter your e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 h-11 bg-slate-50 border-slate-200"
          />
        </div>

        <div>
          <Label className="text-xs font-semibold uppercase text-slate-500">PHONE NUMBER *</Label>
          <div className="mt-1.5 flex rounded-lg border border-slate-200 bg-slate-50 overflow-hidden">
            <div className="flex items-center gap-1 px-3 border-r border-slate-200 bg-white text-sm text-slate-600">
              <span>🇮🇳</span>
              <span>+91</span>
            </div>
            <Input
              type="tel"
              placeholder="e.g. 9769235488"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border-0 bg-transparent rounded-none focus-visible:ring-0"
            />
          </div>
        </div>

        <div>
          <Label className="text-xs font-semibold uppercase text-slate-500">REMARK</Label>
          <Input
            placeholder="Type here"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="mt-1.5 h-11 bg-slate-50 border-slate-200"
          />
        </div>

        <div>
          <Label className="text-xs font-semibold uppercase text-slate-500">TYPE OF EMPLOYMENT *</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {EMPLOYMENT_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setEmploymentType(opt)}
                className={cn(
                  "px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors",
                  employmentType === opt
                    ? "bg-[var(--primary-bank)] text-white border-[var(--primary-bank)]"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-3 pt-2">
          <Checkbox
            id="terms"
            checked={agreeTerms}
            onCheckedChange={(v) => setAgreeTerms(!!v)}
            className="mt-0.5"
          />
          <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer">
            I agree to the{" "}
            <a href="#" className="text-[var(--primary-bank)] font-medium hover:underline">Terms & Conditions</a>
            {" "}and{" "}
            <a href="#" className="text-[var(--primary-bank)] font-medium hover:underline">Privacy Policy</a>
            {" "}of Mahindra Finance
          </label>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            size="lg"
            className="bg-[var(--primary-bank)] hover:opacity-90 text-white px-8"
            disabled={!agreeTerms}
          >
            SUBMIT
          </Button>
        </div>
      </form>
    </StepCard>
  );
}
