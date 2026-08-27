import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle, Circle, Clock, Truck, Package, MapPin,
  Play, Pause, XCircle, Utensils, Home
} from "lucide-react";
import { useOrderStore } from "@/store/orderStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

const DELIVERY_STATES = [
  "PLACED", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "OUT_FOR_DELIVERY", "DELIVERED",
];

const STATE_ICONS: Record<string, any> = {
  PLACED: Clock,
  CONFIRMED: CheckCircle,
  PREPARING: Utensils,
  READY_FOR_PICKUP: Package,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED: Home,
};

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentOrder, delivery, isLoading, fetchOrder, fetchDeliveryStatus, simulateProgress, cancelOrder } = useOrderStore();
  const [polling, setPolling] = useState(true);

  useEffect(() => {
    if (id) {
      fetchOrder(Number(id));
      fetchDeliveryStatus(Number(id)).catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    if (!polling || !id) return;
    const interval = setInterval(() => {
      fetchDeliveryStatus(Number(id)).catch(() => {});
      fetchOrder(Number(id)).catch(() => {});
    }, 12000);
    return () => clearInterval(interval);
  }, [polling, id]);

  const handleSimulate = async () => {
    try {
      const result = await simulateProgress(Number(id));
      toast.success(`Status: ${result.status.replace(/_/g, " ")}`);
    } catch {
      toast.error("Cannot progress further");
    }
  };

  const handleCancel = async () => {
    try {
      await cancelOrder(Number(id));
      toast.success("Order cancelled");
    } catch (e: any) {
      toast.error(e?.response?.data?.detail || "Cannot cancel");
    }
  };

  if (isLoading || !currentOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const currentIdx = DELIVERY_STATES.indexOf(delivery?.status || currentOrder.status);
  const canCancel = ["PLACED", "CONFIRMED"].includes(currentOrder.status);
  const isDelivered = currentOrder.status === "DELIVERED";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order {currentOrder.order_number}</h1>
          <p className="text-gray-500">
            {new Date(currentOrder.created_at).toLocaleDateString("en-IN", {
              year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
            })}
          </p>
        </div>
        <div className="flex gap-2">
          {!isDelivered && canCancel && (
            <Button variant="destructive" onClick={handleCancel}>Cancel Order</Button>
          )}
          {!isDelivered && (
            <Button onClick={handleSimulate} className="bg-blue-600 hover:bg-blue-700">
              <Play className="h-4 w-4 mr-1" /> Simulate Progress
            </Button>
          )}
        </div>
      </div>

      {/* Delivery Timeline */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Truck className="h-5 w-5" /> Delivery Status
            {delivery && (
              <Badge variant={isDelivered ? "default" : "secondary"}>
                {delivery.status.replace(/_/g, " ")}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {DELIVERY_STATES.map((state, idx) => {
              const Icon = STATE_ICONS[state] || Circle;
              const isActive = idx <= currentIdx;
              const isCurrent = idx === currentIdx;
              return (
                <div key={state} className="flex flex-col items-center flex-1">
                  <div className={`rounded-full p-2 ${isCurrent ? "bg-orange-500 text-white ring-4 ring-orange-200" : isActive ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`text-xs mt-2 text-center ${isCurrent ? "font-bold text-orange-600" : isActive ? "text-green-600" : "text-gray-400"}`}>
                    {state.replace(/_/g, " ")}
                  </span>
                  {idx < DELIVERY_STATES.length - 1 && (
                    <div className={`h-0.5 w-full ${idx < currentIdx ? "bg-green-500" : "bg-gray-200"} absolute hidden`} />
                  )}
                </div>
              );
            })}
          </div>
          {delivery && (
            <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
              <span>ETA: {delivery.eta_minutes} min</span>
              <span>Partner: {delivery.partner_name}</span>
              <span>Location: {delivery.current_location}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentOrder.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.item_name || `Item #${item.menu_item_id}`} x{item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{currentOrder.total.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Tax</span><span>₹{currentOrder.tax.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Delivery Fee</span><span>{currentOrder.delivery_fee === 0 ? "FREE" : `₹${currentOrder.delivery_fee.toFixed(2)}`}</span></div>
            {currentOrder.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-₹{currentOrder.discount.toFixed(2)}</span></div>}
            <hr />
            <div className="flex justify-between font-bold text-lg"><span>Total Paid</span><span>₹{currentOrder.final_total.toFixed(2)}</span></div>
          </div>
          {currentOrder.delivery_address && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium flex items-center gap-1"><MapPin className="h-4 w-4" /> Delivery Address</p>
              <p className="text-sm text-gray-600">{currentOrder.delivery_address}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
