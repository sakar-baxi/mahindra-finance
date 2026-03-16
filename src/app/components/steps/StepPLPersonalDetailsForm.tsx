"use client";

import React, { useState, useEffect } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StepCard from "@/app/components/layout/StepCard";
import { Mail, User } from "lucide-react";

/** Step 5: Personal Details – Email (prefilled from invite), Marital status, Statement email, Father's name, Mother's name. */
export default function StepPLPersonalDetailsForm() {
  const { formData, updateFormData, nextStep, journeySteps, currentStepIndex, prefilledData } = useJourney();
  const [email, setEmail] = useState(formData.email ?? prefilledData?.email ?? "");
  const [maritalStatus, setMaritalStatus] = useState(formData.maritalStatus ?? "");
  const [useSameEmail, setUseSameEmail] = useState(formData.statementEmailSame !== false);
  const [statementEmail, setStatementEmail] = useState(formData.statementEmail ?? formData.email ?? prefilledData?.email ?? "");
  const [fatherName, setFatherName] = useState(formData.fatherName ?? prefilledData?.fatherName ?? "");
  const [motherName, setMotherName] = useState(formData.motherName ?? prefilledData?.motherName ?? "");

  useEffect(() => {
    if (formData.email) setEmail(String(formData.email));
    if (formData.fatherName) setFatherName(String(formData.fatherName));
    if (formData.motherName) setMotherName(String(formData.motherName));
  }, [formData.email, formData.fatherName, formData.motherName]);

  const total = journeySteps.length;
  const stepLabel = total ? `Step ${currentStepIndex + 1} of ${total}` : null;

  const handleNext = () => {
    updateFormData({
      email,
      maritalStatus,
      statementEmail: useSameEmail ? email : statementEmail,
      statementEmailSame: useSameEmail,
      fatherName,
      motherName,
    });
    nextStep();
  };

  return (
    <StepCard maxWidth="2xl" step={stepLabel ?? undefined}>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">STEP {currentStepIndex + 1} OF {total}</p>
      <h1 className="text-2xl font-bold text-slate-900">Personal Details</h1>
      <p className="text-slate-600">Confirm a few details so we can complete your account setup.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label className="flex items-center gap-2 text-slate-700">Email Address *</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 h-11 bg-slate-50 border-slate-200" />
          <p className="text-xs text-slate-500 mt-1">This is prefilled from your invite.</p>
        </div>
        <div>
          <Label className="flex items-center gap-2 text-slate-700">Marital Status *</Label>
          <Select value={maritalStatus} onValueChange={setMaritalStatus}>
            <SelectTrigger className="mt-1.5 h-11 bg-slate-50 border-slate-200">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Single">Single</SelectItem>
              <SelectItem value="Married">Married</SelectItem>
              <SelectItem value="Divorced">Divorced</SelectItem>
              <SelectItem value="Widowed">Widowed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label className="text-slate-700">Statement & Notification Email *</Label>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => { setUseSameEmail(true); setStatementEmail(email); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${useSameEmail ? "bg-dashboard-primary text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            Use this email
          </button>
          <button
            type="button"
            onClick={() => setUseSameEmail(false)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${!useSameEmail ? "bg-dashboard-primary text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            Use a different email
          </button>
        </div>
        {!useSameEmail && (
          <Input type="email" value={statementEmail} onChange={(e) => setStatementEmail(e.target.value)} placeholder="Enter email" className="mt-2 h-11 bg-slate-50 border-slate-200" />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <Label className="flex items-center gap-2 text-slate-700">Father's Name *</Label>
          <Input value={fatherName} onChange={(e) => setFatherName(e.target.value)} className="mt-1.5 h-11 bg-slate-50 border-slate-200" placeholder="Rakesh Mehta" />
        </div>
        <div>
          <Label className="flex items-center gap-2 text-slate-700">Mother's Name *</Label>
          <Input value={motherName} onChange={(e) => setMotherName(e.target.value)} className="mt-1.5 h-11 bg-slate-50 border-slate-200" placeholder="Neeta Mehta" />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="button" onClick={handleNext} disabled={!email || !maritalStatus || !fatherName || !motherName} className="bg-dashboard-primary hover:bg-dashboard-primary-dark text-white">
          Continue
        </Button>
      </div>
    </StepCard>
  );
}
