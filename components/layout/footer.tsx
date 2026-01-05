import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { CopyrightYear } from "./copyright-year";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  MessageCircle,
  Hash,
} from "lucide-react";

interface Props {
  lang: Locale;
  dict: any;
}

export default function Footer({ lang, dict }: Props) {
  const companyLabel = dict.footer?.company ?? "Company";
  const legalLabel = dict.footer?.legal ?? "Legal";
  const aboutLabel =
    dict.footer?.aboutUs ?? dict.nav?.aboutUs ?? dict.nav?.about ?? "About Us";
  const contactLabel =
    dict.footer?.contactUs ??
    dict.nav?.contactUs ??
    dict.footer?.contact ??
    dict.nav?.contact ??
    "Contact";
  const dmcaLabel = dict.footer?.dmca ?? dict.nav?.dmca ?? "DMCA";
  const disclaimerLabel =
    dict.footer?.disclaimer ?? dict.nav?.disclaimer ?? "Disclaimer";
  const rightsLabel = dict.footer?.allRightsReserved ?? "All rights reserved.";

  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex flex-wrap justify-center gap-8 text-center md:justify-between md:text-left">
          <div>
            <h2 className="text-xs font-bold uppercase text-slate-900 dark:text-white">
              {companyLabel}
            </h2>
            <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link
                  href={`/${lang}/about`}
                  className="inline-block py-2 hover:text-slate-900 dark:hover:text-white"
                >
                  {aboutLabel}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/contact`}
                  className="inline-block py-2 hover:text-slate-900 dark:hover:text-white"
                >
                  {contactLabel}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase text-slate-900 dark:text-white">
              {legalLabel}
            </h2>
            <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link
                  href={`/${lang}/privacy`}
                  className="inline-block py-2 hover:text-slate-900 dark:hover:text-white"
                >
                  {dict.footer.privacy}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/terms`}
                  className="inline-block py-2 hover:text-slate-900 dark:hover:text-white"
                >
                  {dict.footer.terms}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/dmca`}
                  className="inline-block py-2 hover:text-slate-900 dark:hover:text-white"
                >
                  {dmcaLabel}
                </Link>
              </li>
              <li>
                <Link
                  href={`/${lang}/disclaimer`}
                  className="inline-block py-2 hover:text-slate-900 dark:hover:text-white"
                >
                  {disclaimerLabel}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="flex items-center space-x-8">
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 transition-colors duration-200 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400"
              aria-label="Facebook"
            >
              <Facebook className="h-7 w-7" />
            </Link>
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 transition-colors duration-200 hover:text-pink-600 dark:text-slate-500 dark:hover:text-pink-400"
              aria-label="Instagram"
            >
              <Instagram className="h-7 w-7" />
            </Link>
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 transition-colors duration-200 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white"
              aria-label="Twitter/X"
            >
              <Twitter className="h-7 w-7" />
            </Link>
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 transition-colors duration-200 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white"
              aria-label="Threads"
            >
              <MessageCircle className="h-7 w-7" />
            </Link>
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 transition-colors duration-200 hover:text-red-600 dark:text-slate-500 dark:hover:text-red-400"
              aria-label="YouTube"
            >
              <Youtube className="h-7 w-7" />
            </Link>
            <Link
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 transition-colors duration-200 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400"
              aria-label="Discord"
            >
              <Hash className="h-7 w-7" />
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500">
          <p>
            &copy; <CopyrightYear /> {dict.footer.copyright}. {rightsLabel}
          </p>
        </div>
      </div>
    </footer>
  );
}
