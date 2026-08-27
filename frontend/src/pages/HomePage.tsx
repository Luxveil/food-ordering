import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ChevronRight, Truck, Clock, Star, Tag } from "lucide-react";
import { useRestaurantStore } from "@/store/restaurantStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const CUISINES = ["North Indian", "South Indian", "Biryani", "Chinese", "Street Food", "Desserts"];

export function HomePage() {
  const { restaurants, fetchRestaurants, isLoading } = useRestaurantStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/restaurants?search=${encodeURIComponent(search)}`;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-orange-500 to-red-600 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Delicious Food,<br />Delivered to Your Door
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-orange-100">
            Order from the best restaurants near you
          </p>
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search restaurants or food..."
                className="pl-10 h-12 text-lg"
              />
            </div>
            <Button type="submit" size="lg" className="bg-white text-orange-600 hover:bg-orange-50">
              Search
            </Button>
          </form>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4 p-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <Truck className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold">Fast Delivery</h3>
              <p className="text-sm text-gray-500">30 min delivery guarantee</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <Star className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold">Top Rated</h3>
              <p className="text-sm text-gray-500">Best restaurants only</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <Tag className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold">Great Deals</h3>
              <p className="text-sm text-gray-500">Exclusive coupons & offers</p>
            </div>
          </div>
        </div>
      </section>

      {/* Cuisines */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Explore by Cuisine</h2>
          <div className="flex flex-wrap gap-4">
            {CUISINES.map((cuisine) => (
              <Link
                key={cuisine}
                to={`/restaurants?cuisine=${encodeURIComponent(cuisine)}`}
                className="bg-white px-6 py-3 rounded-full border hover:border-orange-500 hover:text-orange-600 transition-colors font-medium"
              >
                {cuisine}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Promo */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold mb-2">Use code WELCOME10 for 10% off!</h3>
                <p className="text-orange-100">Valid on orders above ₹200. Max discount ₹100.</p>
              </div>
              <Link to="/restaurants">
                <Button className="bg-white text-orange-600 hover:bg-orange-50">
                  Order Now <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Featured Restaurants */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Featured Restaurants</h2>
            <Link to="/restaurants" className="text-orange-600 hover:underline flex items-center">
              View All <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.slice(0, 6).map((restaurant) => (
                <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="relative h-48 bg-gray-200">
                      {restaurant.image_url && (
                        <img
                          src={restaurant.image_url}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {restaurant.is_vegetarian_friendly && (
                        <Badge className="absolute top-2 left-2 bg-green-500">Pure Veg</Badge>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                      <p className="text-sm text-gray-500">{restaurant.cuisine}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          {restaurant.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {restaurant.delivery_time_min} min
                        </span>
                        <span>₹{restaurant.price_for_two} for two</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
