"use client";

import { useI18n } from "@/lib/messages-context";

export default function LanguageSwitcher() {
	const { locale, setLocale } = useI18n();

	return (
		<div className="inline-flex items-center gap-2">
			<label htmlFor="lang" className="text-sm text-gray-500">Language</label>
			<select
				id="lang"
				value={locale}
				onChange={(e) => setLocale(e.target.value as "en" | "nl")}
				className="bg-transparent border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
			>
				<option value="en">English</option>
				<option value="nl">Nederlands</option>
			</select>
		</div>
	);
}
