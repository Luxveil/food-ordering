import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Banknote, Smartphone, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useOrderStore } from "@/store/orderStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import api from "@/lib/api";
import toast from "react-hot-toast";

const checkoutSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postal_code: z.string().min(6, "Valid postal code required"),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function CheckoutPage() {
  const { items, pricing, couponCode } = useCartStore();
  const { createOrder } = useOrderStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("mock_card");
  const [isProcessing, setIsProcessing] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: user?.name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
      state: "",
      postal_code: "",
    },
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items]);

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    try {
      const fullAddress = `${data.address}, ${data.city}, ${data.state} - ${data.postal_code}`;
      const order = await createOrder(fullAddress, couponCode || undefined);

      try {
        await api.post("/payments/process", {
          order_id: order.id,
          method: paymentMethod,
        });
      } catch {}

      toast.success("Order placed successfully!");
      navigate(`/orders/${order.id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Failed to place order");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Delivery Address */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Delivery Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <Input {...register("name")} />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input {...register("phone")} />
                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                  </div>
                </div>
                <div>
                  <Label>Address</Label>
                  <Textarea {...register("address")} placeholder="Street address, landmark..." />
                  {errors.address && <p className="text-red-500 text-sm">{errors.address.message}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>City</Label>
                    <Input {...register("city")} />
                    {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input {...register("state")} />
                    {errors.state && <p className="text-red-500 text-sm">{errors.state.message}</p>}
                  </div>
                  <div>
                    <Label>Postal Code</Label>
                    <Input {...register("postal_code")} />
                    {errors.postal_code && <p className="text-red-500 text-sm">{errors.postal_code.message}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Method (Simulated)</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="cod" />
                    <Banknote className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Cash on Delivery</p>
                      <p className="text-sm text-gray-500">Pay when your order arrives</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="mock_card" />
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Mock Card Payment</p>
                      <p className="text-sm text-gray-500">Simulated card payment (95% success)</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="mock_upi" />
                    <Smartphone className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Mock UPI Payment</p>
                      <p className="text-sm text-gray-500">Simulated UPI payment (95% success)</p>
                    </div>
                  </label>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.menu_item?.name || `Item #${item.menu_item_id}`} x{item.quantity}</span>
                    <span>₹{(item.price_at_time * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <hr />
                <div className="flex justify-between text-sm"><span>Subtotal</span><span>₹{pricing?.subtotal?.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span>Tax</span><span>₹{pricing?.tax?.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span>Delivery</span><span>{pricing?.delivery_fee === 0 ? "FREE" : `₹${pricing?.delivery_fee?.toFixed(2)}`}</span></div>
                {pricing?.discount ? <div className="flex justify-between text-sm text-green-600"><span>Discount</span><span>-₹{pricing.discount.toFixed(2)}</span></div> : null}
                <hr />
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span>₹{pricing?.final_total?.toFixed(2)}</span></div>

                <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 mt-4" disabled={isProcessing}>
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Place Order
                </Button>
                <p className="text-xs text-gray-500 text-center">Payments are simulated for demo</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
