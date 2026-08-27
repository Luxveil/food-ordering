import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, Tag, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";

export function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, calculatePrice, applyCoupon, couponCode, pricing } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState("");
  const [loadingPricing, setLoadingPricing] = useState(false);

  useEffect(() => {
    if (items.length > 0) {
      setLoadingPricing(true);
      calculatePrice(couponCode || undefined).finally(() => setLoadingPricing(false));
    }
  }, [items]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    try {
      await applyCoupon(couponInput.trim());
      toast.success("Coupon applied!");
    } catch {
      toast.error("Invalid coupon");
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error("Please login to checkout");
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add items from restaurants to get started</p>
        <Link to="/restaurants">
          <Button className="bg-orange-600 hover:bg-orange-700">Browse Restaurants</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Cart ({items.length} items)</h1>
        <Button variant="destructive" size="sm" onClick={() => { clearCart(); toast.success("Cart cleared"); }}>
          <Trash2 className="h-4 w-4 mr-1" /> Clear
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium">
                    {item.menu_item?.name || `Item #${item.menu_item_id}`}
                  </h3>
                  {item.customization && (
                    <p className="text-sm text-gray-500">{item.customization}</p>
                  )}
                  <p className="font-semibold text-orange-600">₹{item.price_at_time}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 border rounded-lg">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-6 text-center font-medium">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => { removeItem(item.id); toast.success("Removed"); }}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Price Summary */}
        <div>
          <Card className="p-4 sticky top-20">
            <h3 className="font-semibold mb-4">Price Details</h3>

            {/* Coupon */}
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Coupon code"
                  className="pl-9 text-sm"
                />
              </div>
              <Button variant="outline" onClick={handleApplyCoupon}>Apply</Button>
            </div>
            {couponCode && (
              <p className="text-sm text-green-600 mb-2">Coupon "{couponCode}" applied!</p>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{pricing?.subtotal?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5%)</span>
                <span>₹{pricing?.tax?.toFixed(2) || "0.00"}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>{pricing?.delivery_fee === 0 ? "FREE" : `₹${pricing?.delivery_fee?.toFixed(2) || "0.00"}`}</span>
              </div>
              {pricing?.discount ? (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{pricing.discount.toFixed(2)}</span>
                </div>
              ) : null}
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{pricing?.final_total?.toFixed(2) || "0.00"}</span>
              </div>
            </div>

            <Button
              className="w-full mt-4 bg-orange-600 hover:bg-orange-700"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
