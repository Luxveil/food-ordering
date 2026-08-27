import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Star, Clock, Filter, X, LayoutGrid, LayoutList } from "lucide-react";
import { useRestaurantStore } from "@/store/restaurantStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select } from "@/components/ui/select";

export function RestaurantsPage() {
  const { restaurants, isLoading, fetchRestaurants, filters, setFilters, clearFilters } = useRestaurantStore();
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const cuisine = searchParams.get("cuisine");
    const search = searchParams.get("search");
    if (cuisine) setFilters({ cuisine });
    if (search) {
      setFilters({ search });
      setSearchQuery(search);
    }
    fetchRestaurants();
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ [key]: value });
    setTimeout(() => fetchRestaurants({ [key]: value }), 100);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange("search", searchQuery || undefined);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="md:w-64 flex-shrink-0">
          <Card className="p-4 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4" /> Filters
              </h2>
              <Button variant="ghost" size="sm" onClick={() => { clearFilters(); setSearchQuery(""); fetchRestaurants({ cuisine: undefined, search: undefined, rating: undefined, price: undefined, veg_only: false }); }}>
                <X className="h-4 w-4" /> Clear
              </Button>
            </div>

            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex gap-1">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="text-sm"
                />
                <Button type="submit" size="icon" variant="outline"><Search className="h-4 w-4" /></Button>
              </div>
            </form>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Cuisine</label>
                <Select
                  value={filters.cuisine || ""}
                  onChange={(e) => handleFilterChange("cuisine", e.target.value || undefined)}
                  options={[
                    { value: "North Indian", label: "North Indian" },
                    { value: "South Indian", label: "South Indian" },
                    { value: "Biryani", label: "Biryani" },
                    { value: "Chinese", label: "Chinese" },
                    { value: "Street Food", label: "Street Food" },
                    { value: "Desserts", label: "Desserts" },
                  ]}
                  placeholder="All cuisines"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Min Rating</label>
                <Select
                  value={filters.rating?.toString() || ""}
                  onChange={(e) => handleFilterChange("rating", e.target.value ? Number(e.target.value) : undefined)}
                  options={[
                    { value: "4.5", label: "4.5+" },
                    { value: "4.0", label: "4.0+" },
                    { value: "3.5", label: "3.5+" },
                    { value: "3.0", label: "3.0+" },
                  ]}
                  placeholder="Any rating"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Price for Two</label>
                <Select
                  value={filters.price?.toString() || ""}
                  onChange={(e) => handleFilterChange("price", e.target.value ? Number(e.target.value) : undefined)}
                  options={[
                    { value: "300", label: "Under ₹300" },
                    { value: "500", label: "Under ₹500" },
                    { value: "800", label: "Under ₹800" },
                  ]}
                  placeholder="Any price"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="veg_only"
                  checked={filters.veg_only}
                  onChange={(e) => handleFilterChange("veg_only", e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="veg_only" className="text-sm font-medium">Veg Only</label>
              </div>
            </div>
          </Card>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">{restaurants.length} Restaurants</h1>
            <div className="flex items-center gap-2">
              <Button variant={viewMode === "grid" ? "default" : "outline"} size="icon" onClick={() => setViewMode("grid")}>
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "list" ? "default" : "outline"} size="icon" onClick={() => setViewMode("list")}>
                <LayoutList className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </Card>
              ))}
            </div>
          ) : restaurants.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No restaurants found</p>
              <Button variant="outline" className="mt-4" onClick={() => { clearFilters(); fetchRestaurants(); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
              {restaurants.map((restaurant) => (
                <Link key={restaurant.id} to={`/restaurant/${restaurant.id}`}>
                  <Card className={`overflow-hidden hover:shadow-lg transition-shadow cursor-pointer ${viewMode === "list" ? "flex" : ""}`}>
                    <div className={`bg-gray-200 ${viewMode === "list" ? "w-48 h-48 flex-shrink-0" : "h-48"}`}>
                      {restaurant.image_url && (
                        <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{restaurant.name}</h3>
                          <p className="text-sm text-gray-500">{restaurant.cuisine} • {restaurant.city}</p>
                        </div>
                        {restaurant.is_vegetarian_friendly && (
                          <Badge className="bg-green-500 text-white">Pure Veg</Badge>
                        )}
                      </div>
                      {restaurant.description && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{restaurant.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span className="flex items-center gap-1 font-medium">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          {restaurant.rating}
                        </span>
                        <span className="flex items-center gap-1 text-gray-500">
                          <Clock className="h-4 w-4" />
                          {restaurant.delivery_time_min} min
                        </span>
                        <span className="text-gray-500">₹{restaurant.price_for_two} for two</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
