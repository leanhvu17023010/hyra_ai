import { FiGithub, FiMail } from 'react-icons/fi';

function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="mt-16 border-t border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">

                {/* Logo + text */}
                <div className="text-center md:text-left">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                        Hyra AI
                    </h2>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        AI Face Swap đơn giản và nhanh chóng.
                    </p>
                </div>

                {/* Social */}
                <div className="flex items-center gap-3">
                    <a
                        href="#"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:text-blue-500 dark:border-gray-600 dark:text-gray-400"
                    >
                        <FiGithub size={16} />
                    </a>

                    <a
                        href="#"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:text-blue-500 dark:border-gray-600 dark:text-gray-400"
                    >
                        <FiMail size={16} />
                    </a>
                </div>
            </div>

            {/* Bottom */}
            <div className="border-t border-gray-100 py-4 text-center dark:border-gray-700">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    © {year} Hyra AI. All rights reserved.
                </p>
            </div>
        </footer>
    );
}

export default Footer;