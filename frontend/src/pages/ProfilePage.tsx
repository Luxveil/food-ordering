import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, LogOut, Leaf, Utensils } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import toast from "react-hot-toast";

export function ProfilePage() {
  const { user, logout, fetchMe } = useAuthStore();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<any>(null);
  const [vegOnly, setVegOnly] = useState(false);

  useEffect(() => {
    fetchMe();
    api.get("/users/preferences").then((r) => {
      setPrefs(r.data);
      setVegOnly(r.data.dietary_restrictions?.includes("vegetarian"));
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    const restrictions = vegOnly ? ["vegetarian"] : [];
    try {
      await api.put("/users/preferences", {
        dietary_restrictions: restrictions,
        favorite_cuisine: prefs?.favorite_cuisine || "",
        favorite_restaurants: prefs?.favorite_restaurants || [],
      });
      toast.success("Preferences saved!");
    } catch {
      toast.error("Failed to save");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
    toast.success("Logged out");
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" /> Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{user?.name || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user?.email || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{user?.phone || "—"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">City</p>
              <p className="font-medium">{user?.city || "—"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Leaf className="h-5 w-5" /> Dietary Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={(e) => setVegOnly(e.target.checked)}
              className="rounded"
            />
            <Utensils className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium">Vegetarian</p>
              <p className="text-sm text-gray-500">Show only vegetarian restaurants</p>
            </div>
          </label>
          <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700">
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <Button variant="destructive" onClick={handleLogout} className="w-full">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
