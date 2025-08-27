import logo from "../../assets/logoasoniped.png";
import { navItems } from "../../Constanst/index";
import { Menu, X, User, LogOut, Settings, FileText, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from '@tanstack/react-router';
import { isAuthenticated, logout, getToken } from "../../Utils/auth";

const NavBar = () => {
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [userData, setUserData] = useState<any>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Verificar si estamos en un dashboard
    const isInDashboard = location.pathname.startsWith('/admin') || location.pathname.startsWith('/user');

    // Verificar estado de autenticación al cargar
    useEffect(() => {
        const checkAuth = () => {
            const authenticated = isAuthenticated();
            setIsLoggedIn(authenticated);
            
            if (authenticated) {
                // Obtener datos del usuario desde el token
                const token = getToken();
                if (token) {
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        setUserData(payload);
                    } catch (error) {
                        console.error('Error parsing token:', error);
                    }
                }
            }
        };

        checkAuth();
        // Verificar cada vez que cambie la URL
        const interval = setInterval(checkAuth, 1000);
        return () => clearInterval(interval);
    }, []);

    // Cerrar dropdown cuando se hace clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (userDropdownOpen && !target.closest('.user-dropdown')) {
                setUserDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [userDropdownOpen]);

    const toggleNavbar = () => {
        setMobileDrawerOpen(!mobileDrawerOpen);
    };

    const toggleUserDropdown = () => {
        setUserDropdownOpen(!userDropdownOpen);
    };

    const handleLoginClick = () => {
        navigate({ 
            to: "/admin/login",
            search: (prev) => prev,
            params: (prev) => prev
        });
    };

    const handleLogout = () => {
        logout();
        setIsLoggedIn(false);
        setUserData(null);
        setUserDropdownOpen(false);
        navigate({ 
            to: "/",
            search: (prev) => prev,
            params: (prev) => prev
        });
    };

    const handleDashboardClick = () => {
        const isAdmin = userData?.roles?.some((role: any) => role === 'admin' || role.name === 'admin');
        const destination = isAdmin ? "/admin" : "/user";
        
        navigate({ 
            to: destination,
            search: (prev) => prev,
            params: (prev) => prev
        });
        setUserDropdownOpen(false);
    };

    const handleProfileClick = () => {
        navigate({ 
            to: "/profile",
            search: (prev) => prev,
            params: (prev) => prev
        });
        setUserDropdownOpen(false);
    };

  return (
    <nav className="bg-gradient-to-br from-blue-700 to-sky-500 text-white sticky top-0 z-50 py-5 backdrop-blur-lg border-b.border-neutral-700/80">
        <div className="container mx-auto px-4 text-sm relative">
            <div className="flex items-center w-full">
                {/* Left: Logo and Title */}
                <div className="flex items-center flex-shrink-0">
                    <Link to="/" className="flex items-center">
                        <img className="h-15 w-15 mr-3 rounded-full" src={logo} alt="logo" />
                        <span className="text-xl tracking-tight">Asoniped Digital</span>
                    </Link>
                </div>
                {/* Center: Nav Links - Ocultos en dashboards */}
                {!isInDashboard ? (
                    <ul className="hidden lg:flex mx-auto space-x-12">
                        {navItems.map((item, index) => (
                            <li key={index}>
                                <a href={item.href}>{item.label}</a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    /* Espaciador para mantener distribución en dashboards */
                    <div className="hidden lg:flex flex-1"></div>
                )}
                {/* Right: User Menu */}
                <div className="hidden lg:flex items-center flex-shrink-0">
                    {isLoggedIn ? (
                        // Usuario logueado - Dropdown discreto
                        <div className="relative user-dropdown">
                            <button
                                onClick={toggleUserDropdown}
                                className="flex items-center space-x-2 py-2 px-3 ml-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors duration-200"
                            >
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                                    <User className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-sm text-white">{userData?.username || 'Usuario'}</span>
                                <ChevronDown className={`w-3 h-3 text-white/70 transition-transform duration-200 ${userDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {userDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-200">
                                    {/* Header del usuario */}
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{userData?.full_name || userData?.username}</p>
                                        <p className="text-xs text-gray-500">{userData?.email}</p>
                                    </div>
                                    
                                    {/* Opciones del menú */}
                                    <div className="py-1">
                                        <button
                                            onClick={handleDashboardClick}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <FileText className="w-4 h-4 mr-3 text-gray-500" />
                                            {userData?.roles?.some((role: any) => role === 'admin' || role.name === 'admin') ? 'Panel Admin' : 'Dashboard'}
                                        </button>
                                        
                                        {/*<button
                                            onClick={handleProfileClick}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                        >
                                            <Settings className="w-4 h-4 mr-3 text-gray-500" />
                                            Mi Perfil
                                        </button>*/}
                                    </div>
                                    
                                    {/* Separador */}
                                    <div className="border-t border-gray-100 my-1"></div>
                                    
                                    {/* Logout */}
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <LogOut className="w-4 h-4 mr-3" />
                                        Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        // Usuario no logueado - Botón de login discreto
                        <button
                            onClick={handleLoginClick}
                            className="flex items-center space-x-2 py-2 px-4 ml-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors duration-200"
                        >
                            <User className="w-4 h-4 text-white" />
                            <span className="text-sm text-white">Iniciar Sesión</span>
                        </button>
                    )}
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
                        {!isInDashboard && (
                            <ul >
                                {navItems.map((item, index) => (
                                    <li key={index} className="py-4">
                                        <a href={item.href}>{item.label}</a>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="flex flex-col space-y-3">
                            {isLoggedIn ? (
                                <>
                                    {/* Header del usuario móvil discreto */}
                                    <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                                        <p className="text-sm font-medium text-white">{userData?.full_name || userData?.username}</p>
                                        <p className="text-xs text-white/70">{userData?.email}</p>
                                    </div>
                                    
                                    {/* Opciones del menú móvil discreto */}
                                    <div className="space-y-1">
                                        <button
                                            onClick={handleDashboardClick}
                                            className="flex items-center w-full p-3 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                                        >
                                            <FileText className="w-4 h-4 mr-3 text-white/70" />
                                                                                         <span className="text-sm text-white">{userData?.roles?.some((role: any) => role === 'admin' || role.name === 'admin') ? 'Panel Admin' : 'Inicio'}</span>
                                        </button>
                                        
                                        <button
                                            onClick={handleProfileClick}
                                            className="flex items-center w-full p-3 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-colors"
                                        >
                                            <Settings className="w-4 h-4 mr-3 text-white/70" />
                                            <span className="text-sm text-white">Mi Perfil</span>
                                        </button>
                                        
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full p-3 bg-red-500/20 rounded-lg border border-red-500/30 hover:bg-red-500/30 transition-colors"
                                        >
                                            <LogOut className="w-4 h-4 mr-3 text-red-300" />
                                            <span className="text-sm text-red-300">Cerrar Sesión</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <button
                                    onClick={handleLoginClick}
                                    className="flex items-center space-x-2 p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors"
                                >
                                    <User className="w-4 h-4 text-white" />
                                    <span className="text-sm text-white">Iniciar Sesión</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}
        </div>
    </nav>
  )
}

export default NavBar