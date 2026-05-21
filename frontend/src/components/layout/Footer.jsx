import { FiGithub, FiMail } from 'react-icons/fi';

function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="w-full mt-16 border-t border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-900 dark:bg-slate-950/85">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">

                {/* Logo + text */}
                <div className="text-center md:text-left">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                        Hyra AI
                    </h2>

                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        AI Face Swap đơn giản và nhanh chóng.
                    </p>
                </div>

                {/* Social */}
                <div className="flex items-center gap-3">
                    <a
                        href="#"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:text-blue-500 dark:border-slate-800 dark:text-slate-400"
                    >
                        <FiGithub size={16} />
                    </a>

                    <a
                        href="#"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:text-blue-500 dark:border-slate-800 dark:text-slate-400"
                    >
                        <FiMail size={16} />
                    </a>
                </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-slate-100 py-4 text-center dark:border-slate-900">
                <p className="text-xs text-slate-400 dark:text-slate-500">
                    © {year} Hyra AI. All rights reserved.
                </p>
            </div>
        </footer>
    );
}

export default Footer;