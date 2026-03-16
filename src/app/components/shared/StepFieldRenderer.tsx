"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, CalendarDays, CreditCard, HelpCircle, Mail, Phone, ShieldCheck, User } from "lucide-react";
import type { FieldConfig, FieldKind } from "@/app/context/JourneyConfigContext";
import { FIELD_KINDS } from "@/app/context/JourneyConfigContext";
import { useJourneyConfig } from "@/app/context/JourneyConfigContext";

const getFieldLabel = (field: FieldConfig) => field.label || FIELD_KINDS.find((k) => k.id === field.id)?.label || field.id;

/** Renders a single form field for welcome step. Used for dynamic field order from stepFieldLayouts. */
export function WelcomeFieldRenderer({
  field,
  value,
  onChange,
  error,
  disabled,
  isPrefilled,
}: {
  field: FieldConfig;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  disabled?: boolean;
  isPrefilled?: boolean;
}) {
  const { config: journeyConfig } = useJourneyConfig();
  const label = getFieldLabel(field);

  switch (field.id as FieldKind) {
    case "name":
      return (
        <div>
          <label className="form-label flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            {label}
          </label>
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`enterprise-input ${error ? "error" : ""} ${isPrefilled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
            placeholder="Full name as per records"
            disabled={disabled || isPrefilled}
          />
          {error && (
            <p className="error-text">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>
      );

    case "mobileNumber":
      return (
        <div>
          <label className="form-label flex items-center gap-2">
            <Phone className="w-4 h-4 text-slate-400" />
            {label}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-700 font-medium text-sm z-10">+91</span>
            <Input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={value}
              onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className={`enterprise-input pl-12 ${error ? "error" : ""} ${isPrefilled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
              placeholder="98765 43210"
              disabled={disabled || isPrefilled}
            />
          </div>
          {error && (
            <p className="error-text">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>
      );

    case "email":
      return (
        <div>
          <label className="form-label flex items-center gap-2">
            <Mail className="w-4 h-4 text-slate-400" />
            {label}
          </label>
          <Input
            type="email"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`enterprise-input ${error ? "error" : ""} ${isPrefilled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
            placeholder="name@example.com"
            disabled={disabled || isPrefilled}
          />
          {error && (
            <p className="error-text">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>
      );

    case "dob":
      return (
        <div>
          <label className="form-label flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-slate-400" />
            {label}
          </label>
          <Input
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className={`enterprise-input ${error ? "error" : ""} ${isPrefilled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
            disabled={disabled || isPrefilled}
          />
          {error && (
            <p className="error-text">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>
      );

    case "pan":
      return (
        <div>
          <label className="form-label flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-slate-400" />
            {label}
          </label>
          <Input
            type="text"
            maxLength={10}
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
            className={`enterprise-input uppercase ${error ? "error" : ""} ${isPrefilled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
            placeholder="ABCDE1234F"
            disabled={disabled || isPrefilled}
          />
          {error && (
            <p className="error-text">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>
      );

    case "aadhaarNumber": {
      const raw = value.replace(/\D/g, "");
      const display = raw.length > 4 ? raw.slice(0, 4) + " " + raw.slice(4) : raw;
      const display2 = display.length > 9 ? display.slice(0, 9) + " " + display.slice(9) : display;
      return (
        <div>
          <label className="form-label flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            {label}
            <details className="inline">
              <summary className="list-none cursor-pointer text-slate-400 hover:text-slate-600 p-0.5 rounded inline-flex" title="Where can I find my Aadhaar?">
                <HelpCircle className="w-4 h-4" />
              </summary>
              <div className="mt-2 p-3 rounded-lg bg-blue-50 border border-blue-100 text-sm text-blue-900">
                <p className="font-medium">Where can I find my Aadhaar?</p>
                <p className="mt-1 text-blue-800">
                  Your 12-digit Aadhaar is on your physical Aadhaar card, in the mAadhaar app, or on your e-Aadhaar PDF.
                  Don&apos;t worry – your progress is saved automatically. You can leave and come back anytime.
                </p>
              </div>
            </details>
          </label>
          <Input
            type="text"
            inputMode="numeric"
            maxLength={14}
            value={display2}
            onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, 12))}
            className={`enterprise-input text-center tracking-widest font-mono ${error ? "error" : ""}`}
            placeholder="XXXX XXXX XXXX"
            disabled={disabled}
          />
          {error && (
            <p className="error-text">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}
        </div>
      );
    }

    default:
      return null;
  }
}
