"use client";

import { adminText, type AdminKey } from "@/lib/i18n/admin";
import { useLanguage } from "@/lib/i18n/provider";

/**
 * Admin strings in the active language.
 *
 * The dashboard reuses the site's own language context rather than keeping a
 * second one, so choosing Somali here also shows the public site in Somali —
 * which is what an administrator previewing their own site expects.
 */
export function useAdminText() {
  const { locale, setLocale, toggleLocale } = useLanguage();
  return {
    locale,
    setLocale,
    toggleLocale,
    at: (key: AdminKey) => adminText(locale, key),
  };
}
