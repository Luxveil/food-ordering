import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LogOut, Menu, X, Utensils } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { items } = useCartStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMobileOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-orange-600">
              <Utensils className="h-6 w-6" />
              FoodOrder
            </Link>
            <div className="hidden md:flex items-center ml-10 space-x-4">
              <Link to="/restaurants" className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium">
                Restaurants
              </Link>
              {isAuthenticated && (
                <Link to="/orders" className="text-gray-700 hover:text-orange-600 px-3 py-2 text-sm font-medium">
                  My Orders
                </Link>
              )}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/cart" className="relative text-gray-700 hover:text-orange-600">
              <ShoppingCart className="h-6 w-6" />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {items.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link to="/profile" className="flex items-center gap-1 text-gray-700 hover:text-orange-600 text-sm">
                  <User className="h-5 w-5" />
                  {user?.name}
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative text-gray-700">
              <ShoppingCart className="h-6 w-6" />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {items.reduce((sum, i) => sum + i.quantity, 0)}
                </span>
              )}
            </Link>
            <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-700">
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/restaurants" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setMobileOpen(false)}>
              Restaurants
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/orders" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setMobileOpen(false)}>
                  My Orders
                </Link>
                <Link to="/profile" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setMobileOpen(false)}>
                  Profile
                </Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-red-600 hover:bg-gray-100 rounded">
                  Logout
                </button>
              </>
            )}
            {!isAuthenticated && (
              <>
                <Link to="/login" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded" onClick={() => setMobileOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
