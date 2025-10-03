"use client";

import { usePathname, useRouter } from "next/navigation";

import React from "react";

const LOCALES = ["en", "nl", "fr", "de"] as const;
type Locale = typeof LOCALES[number];

export default function LanguageSwitcher() {
	const router = useRouter();
	const pathname = usePathname() || "/";

	const parts = pathname.split("/");
	const firstSeg = parts[1] || "";
	const hasLocale = (LOCALES as readonly string[]).includes(firstSeg);
	const currentLocale: Locale = (hasLocale ? (firstSeg as Locale) : "en");

	const onChange: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
		const nextLocale = e.target.value as Locale;
		const newParts = [...parts];
		if (hasLocale) {
			newParts[1] = nextLocale;
		} else {
			newParts.splice(1, 0, nextLocale);
		}
		const newPath = newParts.join("/") || "/";
		router.push(newPath);
	};

	return (
		<div className="inline-flex items-center gap-2">
			<label htmlFor="lang" className="text-sm text-gray-400">Language</label>
			<select
				id="lang"
				value={currentLocale}
				onChange={onChange}
				className="bg-transparent border border-gray-600 rounded px-2 py-1 text-sm text-white"
			>
				{LOCALES.map((l) => (
					<option key={l} value={l} className="text-black">
						{l === "en" ? "English" : l === "nl" ? "Nederlands" : l === "fr" ? "Français" : "Deutsch"}
					</option>
				))}
			</select>
		</div>
	);
}
