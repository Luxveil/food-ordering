import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Star, Clock, Plus, Minus, ShoppingCart } from "lucide-react";
import { useRestaurantStore } from "@/store/restaurantStore";
import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";

export function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { selectedRestaurant, isLoading, fetchRestaurant } = useRestaurantStore();
  const { items, addToCart } = useCartStore();
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  useEffect(() => {
    if (id) fetchRestaurant(Number(id));
  }, [id]);

  useEffect(() => {
    if (selectedRestaurant?.menu_items?.length) {
      const categories = [...new Set(selectedRestaurant.menu_items.map((item) => item.category))];
      if (categories.length && !selectedCategory) {
        setSelectedCategory(categories[0]);
      }
    }
  }, [selectedRestaurant]);

  const getItemQuantity = (menuItemId: number) => {
    const cartItem = items.find((i) => i.menu_item_id === menuItemId);
    return cartItem?.quantity || 0;
  };

  const handleAddToCart = (menuItemId: number) => {
    addToCart(menuItemId, 1);
    toast.success("Added to cart");
  };

  if (isLoading || !selectedRestaurant) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Skeleton className="h-64 w-full mb-6" />
        <Skeleton className="h-8 w-1/2 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const categories = [...new Set(selectedRestaurant.menu_items.map((item) => item.category))];
  const filteredItems = selectedRestaurant.menu_items.filter(
    (item) => item.category === selectedCategory
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Restaurant Header */}
      <Card className="overflow-hidden mb-6">
        <div className="relative h-64 bg-gray-200">
          {selectedRestaurant.image_url && (
            <img src={selectedRestaurant.image_url} alt={selectedRestaurant.name} className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-2">
              {selectedRestaurant.is_vegetarian_friendly && (
                <Badge className="bg-green-500">Pure Veg</Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold">{selectedRestaurant.name}</h1>
            <p className="text-white/80">{selectedRestaurant.cuisine}</p>
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-6 text-sm">
            <span className="flex items-center gap-1">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <strong>{selectedRestaurant.rating}</strong>
            </span>
            <span className="flex items-center gap-1 text-gray-500">
              <Clock className="h-5 w-5" />
              {selectedRestaurant.delivery_time_min} min delivery
            </span>
            <span className="text-gray-500">₹{selectedRestaurant.price_for_two} for two</span>
          </div>
          {selectedRestaurant.description && (
            <p className="text-gray-600 mt-2">{selectedRestaurant.description}</p>
          )}
        </div>
      </Card>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 sticky top-16 bg-white z-10 py-2">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={selectedCategory === cat ? "default" : "outline"}
            onClick={() => setSelectedCategory(cat)}
            className="whitespace-nowrap"
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const qty = getItemQuantity(item.id);
          return (
            <Card key={item.id} className="p-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{item.name}</h3>
                  <Badge variant={item.is_vegetarian ? "secondary" : "destructive"} className="text-xs">
                    {item.is_vegetarian ? "VEG" : "NON-VEG"}
                  </Badge>
                </div>
                {item.description && (
                  <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                )}
                <p className="font-semibold mt-1">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-2">
                {qty > 0 ? (
                  <div className="flex items-center gap-2 bg-orange-50 rounded-lg">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (qty === 1) {
                          const cartItem = items.find((i) => i.menu_item_id === item.id);
                          if (cartItem) useCartStore.getState().removeItem(cartItem.id);
                        } else {
                          const cartItem = items.find((i) => i.menu_item_id === item.id);
                          if (cartItem) useCartStore.getState().updateQuantity(cartItem.id, qty - 1);
                        }
                      }}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="font-medium w-6 text-center">{qty}</span>
                    <Button size="icon" variant="ghost" onClick={() => handleAddToCart(item.id)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button onClick={() => handleAddToCart(item.id)} className="bg-orange-600 hover:bg-orange-700">
                    ADD
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Cart Summary */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span>{items.reduce((s, i) => s + i.quantity, 0)} items</span>
            </div>
            <Button onClick={() => window.location.href = "/cart"} className="bg-orange-600 hover:bg-orange-700">
              View Cart
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
