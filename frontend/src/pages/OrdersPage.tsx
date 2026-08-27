import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Eye, X, Clock, CheckCircle, XCircle } from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_COLORS: Record<string, string> = {
  PLACED: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-yellow-100 text-yellow-800",
  PREPARING: "bg-orange-100 text-orange-800",
  READY_FOR_PICKUP: "bg-purple-100 text-purple-800",
  OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export function OrdersPage() {
  const { orders, isLoading, fetchOrders } = useOrderStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
          <p className="text-gray-500 mb-4">Start ordering from your favorite restaurants</p>
          <Link to="/restaurants">
            <Button className="bg-orange-600 hover:bg-orange-700">Browse Restaurants</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm text-gray-500">{order.order_number}</span>
                    <Badge className={STATUS_COLORS[order.status] || "bg-gray-100"}>
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                  <p className="font-semibold mt-1">₹{order.final_total.toFixed(2)}</p>
                  {order.coupon_code && (
                    <p className="text-sm text-green-600">Coupon: {order.coupon_code}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/orders/${order.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" /> Details
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
