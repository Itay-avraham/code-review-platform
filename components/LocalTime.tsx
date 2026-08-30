"use client";

import { useEffect, useState } from "react";

export default function LocalTime({ date }: { date: Date | string }) {
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    // This only runs on the client, using the browser's local timezone
    setFormattedDate(new Date(date).toLocaleString());
  }, [date]);

  // Return a fallback during Server-Side Rendering to prevent hydration mismatch errors
  if (!formattedDate) return <span className="text-sm text-gray-400">...</span>;

  return <span className="text-sm text-gray-400">{formattedDate}</span>;
}