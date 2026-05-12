import { Outlet } from "react-router-dom"
import Navbar from "../components/Navbar"

function MainLayout(){
    return(
        <div className="min-h-screen bg-[#def1ff] flex flex-col font-sans">
            <Navbar/>
            <main className="flex-1 flex justify-center pt-10">
                <Outlet/> 
            </main>
        </div>
    )
}
export default MainLayout