import type { Metadata } from "next";
import { SettingsManager } from "./SettingsManager";

export const metadata: Metadata = {
  title: "Site Settings · Admin · Xisbiga Hilaac",
};

export default function SettingsPage() {
  return <SettingsManager />;
}
