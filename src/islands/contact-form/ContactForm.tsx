"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { z } from "zod";
import s from "./form.module.css";

export type FormLabels = {
  title: string;
  name: string;
  email: string;
  message: string;
  submit: string;
  sending: string;
  sent: string;
  error: string;
  required: string;
  invalidEmail: string;
  tooShort: string;
  privacy: string;
  captcha: string;
};

type Field = "name" | "email" | "message";
type Status = "idle" | "sending" | "sent" | "error" | "captcha";

const ENDPOINT = "https://api.web3forms.com/submit";
const CAPTCHA_SCRIPT = "https://web3forms.com/client/script.js";

/**
 * Contact form (PLAN §3, ADR-0005): Web3Forms with a honeypot and hCaptcha, Zod validation
 * before sending, errors next to each field, and an aria-live status. The access key is public
 * by design (it only lets the form deliver to Noel's inbox).
 */
export function ContactForm({ accessKey, labels }: { accessKey: string; labels: FormLabels }) {
  const form = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [status, setStatus] = useState<Status>("idle");

  const schema = z.object({
    name: z.string().trim().min(1, labels.required),
    email: z.string().trim().min(1, labels.required).pipe(z.email(labels.invalidEmail)),
    message: z.string().trim().min(1, labels.required).min(10, labels.tooShort),
  });

  // Load the hCaptcha widget only on the page that has the form.
  useEffect(() => {
    if (document.querySelector(`script[src="${CAPTCHA_SCRIPT}"]`)) return;
    const script = document.createElement("script");
    script.src = CAPTCHA_SCRIPT;
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
  }, []);

  const validate = (data: FormData, only?: Field) => {
    const result = schema.safeParse(Object.fromEntries(data));
    const next: Partial<Record<Field, string>> = {};
    if (!result.success) {
      for (const issue of result.error.issues) {
        const key = issue.path[0] as Field;
        next[key] ??= issue.message;
      }
    }
    setErrors((prev) => (only ? { ...prev, [only]: next[only] } : next));
    return next;
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const found = validate(data);
    const first = (["name", "email", "message"] as const).find((f) => found[f]);
    if (first) {
      form.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    if (!data.get("h-captcha-response")) {
      setStatus("captcha");
      return;
    }
    setStatus("sending");
    try {
      data.append("access_key", accessKey);
      data.append("subject", "Portfolio contact form");
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data,
      });
      const json = (await res.json()) as { success?: boolean };
      if (!res.ok || !json.success) throw new Error("rejected");
      setStatus("sent");
      form.current?.reset();
    } catch {
      setStatus("error");
    }
  };

  const field = (name: Field, label: string, input: React.ReactNode) => (
    <div className={s.field}>
      <label htmlFor={`cf-${name}`}>{label}</label>
      {input}
      {errors[name] && (
        <p id={`cf-${name}-error`} className={s.error}>
          {errors[name]}
        </p>
      )}
    </div>
  );
  const a11y = (name: Field) => ({
    id: `cf-${name}`,
    name,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `cf-${name}-error` : undefined,
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      if (e.currentTarget.form) validate(new FormData(e.currentTarget.form), name);
    },
  });

  return (
    <form ref={form} className={s.form} noValidate onSubmit={onSubmit} aria-labelledby="cf-title">
      <h2 id="cf-title" className={s.title}>
        {labels.title}
      </h2>
      {field("name", labels.name, <input {...a11y("name")} type="text" autoComplete="name" required />)}
      {field("email", labels.email, <input {...a11y("email")} type="email" autoComplete="email" required />)}
      {field("message", labels.message, <textarea {...a11y("message")} rows={6} required />)}

      {/* Honeypot: hidden from people and assistive tech; bots fill it and get dropped. */}
      <input type="checkbox" name="botcheck" className={s.honeypot} tabIndex={-1} aria-hidden="true" />

      <div className="h-captcha" data-captcha="true" />

      <p className={s.privacy}>{labels.privacy}</p>

      <button type="submit" className={s.submit} disabled={status === "sending"}>
        {status === "sending" ? labels.sending : labels.submit}
      </button>

      <p className={s.status} data-status={status} aria-live="polite" role="status">
        {status === "sent"
          ? labels.sent
          : status === "error"
            ? labels.error
            : status === "captcha"
              ? labels.captcha
              : ""}
      </p>
    </form>
  );
}
