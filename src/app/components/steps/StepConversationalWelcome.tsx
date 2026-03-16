"use client";

import React, { useState, useEffect, useRef } from "react";
import { useJourney } from "@/app/context/JourneyContext";
import { useJourneyConfig } from "@/app/context/JourneyConfigContext";
import AgentMessage from "@/app/components/chat/AgentMessage";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Loader2, Sparkles, Pencil } from "lucide-react";

type Message = { role: "agent" | "user"; content: string };

export default function StepConversationalWelcome() {
  const { nextStep, formData, updateFormData } = useJourney();
  const { config } = useJourneyConfig();
  const bankName = config.bankName || "your bank";

  const [messages, setMessages] = useState<Message[]>([]);
  const [showData, setShowData] = useState(false);
  const [isTyping, setIsTyping] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const mountedRef = useRef(true);

  const [editable, setEditable] = useState({
    name: formData.name || "",
    pan: formData.pan || formData.panNumber || "",
    email: formData.email || "",
    mobile: formData.mobileNumber || "",
    dob: formData.dob || "",
    income: formData.income || "",
  });

  const firstName = editable.name.trim().split(/\s+/)[0] || "there";
  const prefilled = editable;
  const hasPrefilledData = !!(editable.name || editable.pan || editable.email || editable.mobile);

  useEffect(() => {
    mountedRef.current = true;
    const sequence: Message[] = hasPrefilledData
      ? [
          { role: "agent" as const, content: `Hi ${firstName}! Great to connect with you. I'm here to help you open your salary account with ${bankName}.` },
          { role: "agent" as const, content: `I've pulled your details from our HRMS sync—so we can skip the long forms. Just a quick review and you're good to go.` },
        ]
      : [
          { role: "agent" as const, content: `Hi! I'm here to help you open your salary account with ${bankName}.` },
          { role: "agent" as const, content: `We couldn't fetch your details automatically. Please enter your details below to continue.` },
        ];
    let i = 0;
    const timer = setInterval(() => {
      if (!mountedRef.current) return;
      if (i < sequence.length) {
        const msg = sequence[i];
        if (msg) {
          setMessages((m) => [...m, msg]);
        }
        i++;
      } else {
        setIsTyping(false);
        setShowData(true);
        clearInterval(timer);
      }
    }, 1400);
    return () => {
      mountedRef.current = false;
      clearInterval(timer);
    };
  }, [bankName, firstName, hasPrefilledData]);

  const handleConfirm = () => {
    updateFormData({
      name: editable.name,
      pan: editable.pan,
      panNumber: editable.pan,
      email: editable.email,
      mobileNumber: editable.mobile,
      dob: editable.dob,
      income: editable.income,
    });
    nextStep();
  };

  const validMessages = messages.filter((m): m is Message => m != null && typeof m.role === "string");

  return (
    <div className="max-w-5xl mx-auto space-y-4">
      {validMessages.map((msg, i) =>
        msg.role === "agent" ? (
          <AgentMessage key={i} isNew={i === validMessages.length - 1}>
            {msg.content}
          </AgentMessage>
        ) : null
      )}
      {isTyping && (
        <AgentMessage isNew={true}>
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-slate-500">Fetching your details from HRMS & {bankName} APIs…</span>
          </div>
        </AgentMessage>
      )}
      {showData && (
        <div className="pl-8 space-y-4 animate-in slide-in-from-bottom-4 duration-300">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: "var(--primary-bank)" }} />
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Your details from HRMS & {bankName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs font-semibold text-[var(--primary-bank)] hover:underline flex items-center gap-1"
              >
                <Pencil className="w-3 h-3" />
                {isEditing ? "Done" : "Edit"}
              </button>
            </div>
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Full Name</label>
                  <Input value={editable.name} onChange={(e) => setEditable((p) => ({ ...p, name: e.target.value }))} className="h-10" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">PAN</label>
                  <Input value={editable.pan} onChange={(e) => setEditable((p) => ({ ...p, pan: e.target.value.toUpperCase() }))} className="h-10 font-mono" maxLength={10} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Email</label>
                  <Input type="email" value={editable.email} onChange={(e) => setEditable((p) => ({ ...p, email: e.target.value }))} className="h-10" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Mobile</label>
                  <Input value={editable.mobile} onChange={(e) => setEditable((p) => ({ ...p, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))} className="h-10" maxLength={10} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Date of Birth</label>
                  <Input type="date" value={editable.dob} onChange={(e) => setEditable((p) => ({ ...p, dob: e.target.value }))} className="h-10" />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Income Range</label>
                  <Input value={editable.income} onChange={(e) => setEditable((p) => ({ ...p, income: e.target.value }))} className="h-10" />
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                {[
                  { label: "Full Name", value: prefilled.name },
                  { label: "PAN", value: prefilled.pan },
                  { label: "Email", value: prefilled.email },
                  { label: "Mobile", value: prefilled.mobile },
                  { label: "Date of Birth", value: prefilled.dob },
                  { label: "Income Range", value: prefilled.income },
                ].map((r) => (
                  <div key={r.label} className="flex justify-between py-2 border-b border-slate-100 last:border-0">
                    <span className="text-slate-600">{r.label}</span>
                    <span className="font-semibold text-slate-900">{r.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <AgentMessage isNew={true}>
            Everything looks good, {firstName}. Ready to confirm and move ahead?
          </AgentMessage>
          <Button
            onClick={handleConfirm}
            className="w-full h-12 bg-[var(--primary-bank)] hover:opacity-90 text-white font-semibold"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {config.ctaLabels.confirmAndContinue}
          </Button>
        </div>
      )}
    </div>
  );
}
