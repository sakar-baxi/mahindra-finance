"use client";

import React, { useState, useMemo } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { Button } from "@/app/components/ui/button";
import StepCard from "@/app/components/layout/StepCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const INDIAN_STATES = [
  "ANDHRA PRADESH", "ASSAM", "BIHAR", "CHHATTISGARH", "GOA", "GUJARAT", "HARYANA",
  "HIMACHAL PRADESH", "JHARKHAND", "KARNATAKA", "KERALA", "MADHYA PRADESH", "MAHARASHTRA",
  "MANIPUR", "MEGHALAYA", "MIZORAM", "NAGALAND", "ODISHA", "PUNJAB", "RAJASTHAN",
  "SIKKIM", "TAMIL NADU", "TELANGANA", "TRIPURA", "UTTAR PRADESH", "UTTARAKHAND",
  "UTTARANCHAL", "WEST BENGAL",
];

const CITY_SUGGESTIONS: Record<string, string[]> = {
  "MAHARASHTRA": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
  "KARNATAKA": ["Bengaluru", "Bangalore", "Mysuru", "Hubballi", "Mangaluru"],
  "HARYANA": ["Gurugram", "Faridabad", "Panipat", "Ambala"],
  "TAMIL NADU": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
  "TELANGANA": ["Hyderabad", "Warangal", "Nizamabad"],
  "WEST BENGAL": ["Kolkata", "Howrah", "Durgapur"],
  "GUJARAT": ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  "RAJASTHAN": ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
  "DELHI": ["New Delhi", "North Delhi", "South Delhi"],
};

export default function StepPersonalLoanPersonalDetails() {
  const { nextStep, formData, updateFormData, prefilledData } = useJourney();

  const nameParts = (formData?.name ?? prefilledData?.name ?? "").trim().split(/\s+/);
  const [firstName, setFirstName] = useState(formData?.firstName ?? nameParts[0] ?? prefilledData?.firstName ?? "");
  const [lastName, setLastName] = useState(formData?.lastName ?? nameParts.slice(1).join(" ") ?? prefilledData?.lastName ?? "");
  const [state, setState] = useState(formData?.state ?? prefilledData?.state ?? "");
  const [city, setCity] = useState(formData?.city ?? prefilledData?.city ?? "");
  const [pincode, setPincode] = useState(formData?.pincode ?? prefilledData?.pincode ?? formData?.jobLocationPincode ?? "");
  const [email, setEmail] = useState(formData?.email ?? prefilledData?.email ?? "");
  const [phone, setPhone] = useState(formData?.phone ?? formData?.mobileNumber ?? prefilledData?.mobileNumber ?? prefilledData?.phone ?? "");
  const [remark, setRemark] = useState(formData?.remark ?? "");

  const cityOptions = useMemo(() => {
    if (!state) return [];
    return CITY_SUGGESTIONS[state] ?? [`${state} City 1`, `${state} City 2`];
  }, [state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
    updateFormData({
      firstName,
      lastName,
      name: fullName || (formData?.name ?? prefilledData?.name),
      state,
      city,
      pincode,
      email,
      phone,
      mobileNumber: phone,
      remark,
    });
    nextStep();
  };

  return (
    <StepCard maxWidth="2xl">
      <p className="text-sm font-medium text-slate-500 mb-1">Step 3 out of 3</p>
      <h1 className="text-2xl font-bold text-[#111827] mb-2">Personal Details</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Full Name</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="text-xs font-semibold uppercase text-slate-500">FIRST NAME *</Label>
              <Input
                placeholder="Enter your Information"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1.5 h-11 bg-slate-50 border-slate-200"
              />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase text-slate-500">LAST NAME *</Label>
              <Input
                placeholder="Enter your Information"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1.5 h-11 bg-slate-50 border-slate-200"
              />
            </div>
          </div>
        </div>

        <div>
          <Label className="text-xs font-semibold uppercase text-slate-500">STATE *</Label>
          <Select value={state || undefined} onValueChange={setState}>
            <SelectTrigger className="mt-1.5 h-11 bg-slate-50 border-slate-200">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {INDIAN_STATES.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-semibold uppercase text-slate-500">CITY *</Label>
          <Select value={city || undefined} onValueChange={setCity}>
            <SelectTrigger className="mt-1.5 h-11 bg-slate-50 border-slate-200">
              <SelectValue placeholder="Select or type city" />
            </SelectTrigger>
            <SelectContent>
              {cityOptions.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
              {city && !cityOptions.includes(city) && (
                <SelectItem value={city}>{city}</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs font-semibold uppercase text-slate-500">PINCODE *</Label>
          <Input
            placeholder="Enter your Pin Code"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            maxLength={6}
            className="mt-1.5 h-11 bg-slate-50 border-slate-200"
          />
        </div>

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

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
            className="border-slate-300"
          >
            Back
          </Button>
          <Button
            type="submit"
            size="lg"
            className="bg-[var(--primary-bank)] hover:opacity-90 text-white px-8"
          >
            Next
          </Button>
        </div>
      </form>
    </StepCard>
  );
}
