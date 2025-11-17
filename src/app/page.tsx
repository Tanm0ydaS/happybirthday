// src/app/page.tsx
import React from "react";
import HeroCard from "../components/HeroCard";

export default function Page() {
  const herName = "Barnita"; // change to your crush's name
  const birthdate = "18 November";

  return <HeroCard herName={herName} birthdate={birthdate} />;
}
