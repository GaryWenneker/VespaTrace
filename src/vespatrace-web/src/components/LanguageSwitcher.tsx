"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronsUpDown } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";

const LOCALES = ["en", "nl", "fr", "de"] as const;
type Locale = typeof LOCALES[number];

const META: Record<Locale, { label: string; icon: string; ratio: string }> = {
	en: { label: "English", icon: "/flags/gb.svg", ratio: "2 / 1" },
	nl: { label: "Nederlands", icon: "/flags/nl.svg", ratio: "3 / 2" },
	fr: { label: "Français", icon: "/flags/fr.svg", ratio: "3 / 2" },
	de: { label: "Deutsch", icon: "/flags/de.svg", ratio: "5 / 3" },
};

export default function LanguageSwitcher() {
	const t = useTranslations();
	const router = useRouter();
	const pathname = usePathname() || "/";

	const parts = useMemo(() => pathname.split("/"), [pathname]);
	const firstSeg = parts[1] || "";
	const hasLocale = (LOCALES as readonly string[]).includes(firstSeg);
	const currentLocale: Locale = hasLocale ? (firstSeg as Locale) : "en";

	const [open, setOpen] = useState(false);
	const btnRef = useRef<HTMLButtonElement | null>(null);
		const menuRef = useRef<HTMLDivElement | null>(null);
		const [coords, setCoords] = useState<{ top: number; left: number; origin: 'left'|'right' }>({ top: 0, left: 0, origin: 'right' });

	const buildPath = (nextLocale: Locale) => {
		const newParts = [...parts];
		if (hasLocale) newParts[1] = nextLocale; else newParts.splice(1, 0, nextLocale);
		return newParts.join("/") || "/";
	};

	const selectLocale = (nextLocale: Locale) => {
		setOpen(false);
		router.push(buildPath(nextLocale));
	};

	// Close on outside click
	useEffect(() => {
		if (!open) return;
		const onDocClick = (e: MouseEvent) => {
			const target = e.target as Node | null;
			if (menuRef.current && !menuRef.current.contains(target!) && btnRef.current && !btnRef.current.contains(target!)) {
				setOpen(false);
			}
		};
		const onEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("mousedown", onDocClick);
		document.addEventListener("keydown", onEsc);
		return () => {
			document.removeEventListener("mousedown", onDocClick);
			document.removeEventListener("keydown", onEsc);
		};
	}, [open]);

		// Compute dropdown viewport-safe position when opening and on resize
		useEffect(() => {
			if (!open) return;
			const compute = () => {
				const btn = btnRef.current;
				if (!btn) return;
				const rect = btn.getBoundingClientRect();
				const vw = window.innerWidth;
				const margin = 8;
				const width = 192; // w-48
				let left = rect.left;
				// Prefer aligning with button's left; clamp to viewport
				if (left + width + margin > vw) {
					left = Math.max(margin, vw - width - margin);
					setCoords({ top: rect.bottom + 8, left, origin: 'right' });
				} else {
					left = Math.max(margin, left);
					setCoords({ top: rect.bottom + 8, left, origin: 'left' });
				}
			};
			compute();
			window.addEventListener('resize', compute);
			return () => window.removeEventListener('resize', compute);
		}, [open]);

	return (
		<div className="relative inline-block text-left">
					<button
				ref={btnRef}
				type="button"
				aria-haspopup="listbox"
				aria-expanded={open}
				aria-label={t("menu.language", { default: "Language" })}
				onClick={() => setOpen((v) => !v)}
				className="inline-flex items-center gap-2 rounded-lg border border-gray-700/60 bg-gray-800/60 hover:bg-gray-800 px-3 py-2 text-sm text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/50"
			>
										<span
											className="relative inline-block w-5 rounded-[3px] overflow-hidden align-middle"
											style={{ aspectRatio: META[currentLocale].ratio }}
										>
									<Image src={META[currentLocale].icon} alt="" aria-hidden fill className="object-cover" />
								</span>
				<span className="hidden sm:inline">{META[currentLocale].label}</span>
				<ChevronsUpDown className="h-4 w-4 text-gray-400" />
			</button>

			{/* Dropdown */}
					<div
						ref={menuRef}
						className={`fixed z-[80] w-48 rounded-xl border border-gray-700 bg-gray-900/95 backdrop-blur-sm shadow-2xl ring-1 ring-black/5 transition transform ${open ? 'opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-95'} ${coords.origin === 'right' ? 'origin-top-right' : 'origin-top-left'}`}
						style={{ top: coords.top, left: coords.left, maxWidth: 'calc(100vw - 16px)' }}
						role="listbox"
					>
				<ul className="py-2">
					{LOCALES.map((l) => (
						<li key={l}>
											<button
								type="button"
								onClick={() => selectLocale(l)}
								className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${l === currentLocale ? 'bg-gray-800/70 text-white' : 'text-gray-300 hover:bg-gray-800/60 hover:text-white'}`}
								role="option"
								aria-selected={l === currentLocale}
							>
																				<span
																					className="relative inline-block w-5 rounded-[3px] overflow-hidden align-middle"
																					style={{ aspectRatio: META[l].ratio }}
																				>
																	<Image src={META[l].icon} alt="" aria-hidden fill className="object-cover" />
																</span>
								<span>{META[l].label}</span>
							</button>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
