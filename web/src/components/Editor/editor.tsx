import { usePathname } from "next/navigation";
import React from "react";
import PersonalCodeEditor from "./PersonalEditor";
import GroupEditor from "./GroupEditor";

export default function Editor() {
  const pathname = usePathname();
  return pathname === "/" ? <PersonalCodeEditor /> : <GroupEditor />;
}
