import type { Metadata } from "next";
import { JoinForm } from "./JoinForm";
import { JoinHeader } from "./JoinHeader";

export const metadata: Metadata = {
  title: "Ku Biir — Join Xisbiga Hilaac",
  description:
    "Become an official member of Xisbiga Hilaac. Registration is free and takes a few minutes.",
  alternates: { canonical: "/join" },
};

export default function JoinPage() {
  return (
    <>
      <JoinHeader />
      <JoinForm />
    </>
  );
}
