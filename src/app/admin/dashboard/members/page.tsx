import type { Metadata } from "next";
import { MembersManager } from "./MembersManager";

export const metadata: Metadata = {
  title: "Members Registry · Admin · Xisbiga Hilaac",
};

export default function MembersPage() {
  return <MembersManager />;
}
