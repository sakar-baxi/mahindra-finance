"use client";

import React, { useState } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import StepCard from "@/app/components/layout/StepCard";
import { MapPin, DollarSign, Shield } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const INCOME_RANGES = ["₹5L - ₹8L", "₹8L - ₹10L", "₹10L - ₹15L", "₹15L - ₹20L", "₹20L - ₹25L", "₹25L+"];

/** Map numeric income (from HRIS) to display range. */
function incomeToRange(income: string | number | undefined): string {
  if (income == null || income === "") return "₹10L - ₹15L";
  const num = typeof income === "string" ? parseInt(income.replace(/\D/g, ""), 10) : income;
  if (!Number.isFinite(num)) return "₹10L - ₹15L";
  if (num < 800_000) return "₹5L - ₹8L";
  if (num < 1_000_000) return "₹8L - ₹10L";
  if (num < 1_500_000) return "₹10L - ₹15L";
  if (num < 2_000_000) return "₹15L - ₹20L";
  if (num < 2_500_000) return "₹20L - ₹25L";
  return "₹25L+";
}

/** Step 6: Permanent address (prefilled from Aadhaar), Income range (prefilled from HRIS), Nominee, Regulatory declarations. */
export default function StepPLAddressIncomeRegulatory() {
  const { formData, prefilledData, updateFormData, nextStep, prevStep, journeySteps, currentStepIndex } = useJourney();
  const [address, setAddress] = useState(formData.currentAddress ?? formData.permanentAddress ?? prefilledData?.currentAddress ?? "Flat 12B, HSR Layout, Bengaluru 560102");
  const [sameAsCurrent, setSameAsCurrent] = useState(formData.communicationAddressSame !== false);
  const incomeFromHris = formData.income ?? prefilledData?.income;
  const defaultRange = incomeFromHris != null ? incomeToRange(incomeFromHris) : (formData.incomeRange ?? "₹10L - ₹15L");
  const [incomeRange, setIncomeRange] = useState(defaultRange);
  const [addNominee, setAddNominee] = useState<"Yes" | "No">(formData.addNominee === true ? "Yes" : "No");
  const [pep, setPep] = useState<"Yes" | "No">((formData.pep as "Yes" | "No") ?? "No");
  const [indianNational, setIndianNational] = useState<"Yes" | "No">((formData.indianNational as "Yes" | "No") ?? "Yes");
  const [taxResidentIndia, setTaxResidentIndia] = useState<"Yes" | "No">((formData.taxResidentIndia as "Yes" | "No") ?? "Yes");

  const total = journeySteps.length;
  const stepLabel = total ? `Step ${currentStepIndex + 1} of ${total}` : null;

  const handleNext = () => {
    updateFormData({
      currentAddress: address,
      permanentAddress: address,
      communicationAddressSame: sameAsCurrent,
      incomeRange,
      addNominee: addNominee === "Yes",
      pep,
      indianNational,
      taxResidentIndia,
    });
    nextStep();
  };

  return (
    <StepCard maxWidth="2xl" step={stepLabel ?? undefined}>
      <h1 className="text-2xl font-bold text-slate-900">Address & Declarations</h1>
      <p className="text-slate-600 mt-1">Permanent address, income and regulatory confirmations.</p>

      <div>
        <Label className="flex items-center gap-2 text-slate-700"><MapPin className="w-4 h-4" /> Permanent Address</Label>
        <p className="text-xs text-slate-500 mt-0.5">Prefilled from Aadhaar / HRIS where available.</p>
        <Input value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1.5 h-11 bg-slate-50 border-slate-200" placeholder="Address *" />
        <div className="flex items-center gap-2 mt-2">
          <Checkbox id="same-addr" checked={sameAsCurrent} onCheckedChange={(c) => setSameAsCurrent(!!c)} />
          <label htmlFor="same-addr" className="text-sm text-slate-700">Communication/Current address is the same as permanent</label>
        </div>
      </div>

      <div>
        <Label className="flex items-center gap-2 text-slate-700"><DollarSign className="w-4 h-4" /> Annual Income Range *</Label>
        {incomeFromHris != null && (
          <p className="text-xs text-emerald-600 mt-0.5">Prefilled from HRIS. You can change if needed.</p>
        )}
        <Select value={incomeRange} onValueChange={setIncomeRange}>
          <SelectTrigger className="mt-1.5 h-11 bg-slate-50 border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {INCOME_RANGES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-slate-700">Do you want to add a nominee? *</Label>
        <p className="text-xs text-slate-500 mt-0.5">If yes, add nominee details. You can add up to 4 nominees.</p>
        <div className="flex gap-4 mt-2">
          <button type="button" onClick={() => setAddNominee("Yes")} className={cn("px-4 py-2 rounded-lg text-sm font-medium", addNominee === "Yes" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700")}>Yes</button>
          <button type="button" onClick={() => setAddNominee("No")} className={cn("px-4 py-2 rounded-lg text-sm font-medium", addNominee === "No" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700")}>No</button>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-5">
        <Label className="flex items-center gap-2 text-slate-700"><Shield className="w-4 h-4" /> Regulatory Declarations</Label>
        <p className="text-xs text-slate-500 mt-0.5">As per RBI/Compliance requirements, please confirm the below.</p>
        <div className="space-y-4 mt-4">
          <div>
            <p className="text-sm font-medium text-slate-700">Are you a Politically Exposed Person (PEP)?</p>
            <div className="flex gap-4 mt-1">
              <button type="button" onClick={() => setPep("No")} className={cn("px-4 py-2 rounded-lg text-sm font-medium", pep === "No" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700")}>No</button>
              <button type="button" onClick={() => setPep("Yes")} className={cn("px-4 py-2 rounded-lg text-sm font-medium", pep === "Yes" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700")}>Yes</button>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Are you an Indian national?</p>
            <div className="flex gap-4 mt-1">
              <button type="button" onClick={() => setIndianNational("Yes")} className={cn("px-4 py-2 rounded-lg text-sm font-medium", indianNational === "Yes" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700")}>Yes</button>
              <button type="button" onClick={() => setIndianNational("No")} className={cn("px-4 py-2 rounded-lg text-sm font-medium", indianNational === "No" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700")}>No</button>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">Are you a Tax Resident of India only?</p>
            <div className="flex gap-4 mt-1">
              <button type="button" onClick={() => setTaxResidentIndia("Yes")} className={cn("px-4 py-2 rounded-lg text-sm font-medium", taxResidentIndia === "Yes" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700")}>Yes</button>
              <button type="button" onClick={() => setTaxResidentIndia("No")} className={cn("px-4 py-2 rounded-lg text-sm font-medium", taxResidentIndia === "No" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700")}>No</button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button type="button" variant="outline" onClick={prevStep} className="border-slate-300">
          Back
        </Button>
        <Button type="button" onClick={handleNext} className="bg-dashboard-primary hover:bg-dashboard-primary-dark text-white">
          Continue
        </Button>
      </div>
    </StepCard>
  );
}
