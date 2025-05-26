import logo from "../../assets/logoasoniped.png";
import { navItems } from "../../Constanst/index";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from '@tanstack/react-router';

const NavBar = () => {

    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const toggleNavbar = () => {
        setMobileDrawerOpen(!mobileDrawerOpen);
    }
  return (
    <nav className="bg-blue-500 text-white sticky top-0 z-50 py-5 backdrop-blur-lg border-b.border-neutral-700/80">
        <div className="container mx-auto px-4 text-sm relative">
            <div className="flex items-center w-full">
                {/* Left: Logo and Title */}
                <div className="flex items-center flex-shrink-0">
                    <Link to="/" className="flex items-center">
                        <img className="h-15 w-15 mr-3 rounded-full" src={logo} alt="logo" />
                        <span className="text-xl tracking-tight">Asoniped Digital</span>
                    </Link>
                </div>
                {/* Center: Nav Links */}
                <ul className="hidden lg:flex mx-auto space-x-12">
                    {navItems.map((item, index) => (
                        <li key={index}>
                            <a href={item.href}>{item.label}</a>
                        </li>
                    ))}
                </ul>
                {/* Right: Login Button */}
                <div className="hidden lg:flex items-center flex-shrink-0">
                    <Link to="/admin-login" className="py-2 px-3 border rounded-md ml-2">
                        Login
                    </Link>
                </div>
                {/* Mobile Toggle Button (always far right) */}
                <div className="lg:hidden flex flex-col justify-end ml-auto">
                    <button onClick={toggleNavbar}>
                        {mobileDrawerOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>
            {mobileDrawerOpen && (
                    <div className="fixed right-0 z-20 bg-blue-500 w-full p-12 flex delx-col justify-between items-center lg:hidden">
                        <ul >
                            {navItems.map((item, index) => (
                                <li key={index} className="py-4">
                                    <a href={item.href}>{item.label}</a>
                                </li>
                            ))}
                        </ul>
                        <div className="flex space-x-6">
                            <Link to="/admin-login" className="py-2 px-3 border rounded-md">
                                Login
                            </Link>
                        </div>
                    </div>
                )}
        </div>
    </nav>
  )
}

export default NavBar

 