import { Link } from "react-router-dom";

function Navbar(){
    return(
        <nav className="
        flex justify-between items-center 
        px-8 py-4 bg-white text-black shadow-sm
        dark:bg-gray-900 border border-gray-400 dark:text-white">
            <h1 className="text-2xl font-bold">Example AI</h1>
            <div className="flex gap-4 text-base font-medium">
                <Link to="/" className="bg-[#5b6ef7] hover:bg-[#4a5ce6] text-white px-6 py-2 rounded-lg transition-colors dark:bg-[#11229c] dark:hover:bg-[#1128b9]">
                    Đăng nhập
                </Link>
            </div>
        </nav>
    )
}
export default Navbar;