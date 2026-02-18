import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ArrowLeft, CreditCard, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSupabaseAuth } from '../context/SupabaseAuthContext';
import { db } from '../services/database';
import { SEO } from '../components/SEO';

export function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useApp();
  const { user } = useSupabaseAuth();
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: ''
  });

  const shipping = cartTotal > 500 ? 0 : 25;
  const tax = cartTotal * 0.08;
  const total = cartTotal + shipping + tax;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (!user) {
        setSubmitError('Please sign in before placing an order.');
        return;
      }

      const order = await db.createCompleteOrder(
        {
          name: formData.name.trim(),
          email: formData.email.trim() || user.email || undefined,
          phone: formData.phone.trim(),
          address: `${formData.address.trim()}, ${formData.city.trim()} ${formData.zip.trim()}`.trim(),
        },
        cart,
        shipping,
        tax
      );

      setOrderNumber(order.order_number);
      clearCart();
      setOrderPlaced(true);
    } catch (error) {
      setSubmitError(db.getCheckoutErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-4">
        <SEO title="Order Success" description="Your order has been placed successfully." />
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-[#22c55e]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#22c55e]/20">
            <CheckCircle className="w-10 h-10 text-[#22c55e]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Order Placed!</h1>
          <p className="text-[#a1a1aa] mb-8 font-mono text-sm uppercase tracking-wider">
            SYSTEM_TX_SUCCESS: CONFIRMATION_SENT
          </p>
          {orderNumber && (
            <p className="text-[#3b82f6] mb-8 font-mono text-xs uppercase tracking-widest">
              ORDER_ID: {orderNumber}
            </p>
          )}
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#3b82f6] text-white font-bold rounded-xl hover:bg-[#2563eb] transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] uppercase text-xs tracking-widest"
          >
            Continue Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center px-4 pt-20">
        <SEO title="Cart Empty" />
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-[#18181b] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#27272a]">
            <ShoppingBag className="w-10 h-10 text-[#71717a]" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Your cart is empty</h1>
          <p className="text-[#71717a] mb-8 font-mono text-xs uppercase tracking-widest">
            NO_ITEMS_IN_QUEUE
          </p>
          <Link
            to="/products"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#3b82f6] text-white font-bold rounded-xl hover:bg-[#2563eb] transition-all uppercase text-xs tracking-widest shadow-lg shadow-blue-500/20"
          >
            Browse Products
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] pt-24 pb-16">
      <SEO title="Shopping Cart" description="Review your selected items and proceed to checkout." />
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-12">
          <Link to="/products" className="p-3 bg-[#18181b] border border-[#27272a] hover:border-[#71717a] text-white rounded-xl transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
            <p className="text-[#71717a] font-mono text-xs uppercase tracking-widest mt-1">{cart.length} UNITS_PENDING</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map(({ product, quantity }) => (
              <div key={product.id} className="bg-[#111113] border border-[#27272a] rounded-2xl p-4 flex gap-6 hover:border-[#3b82f6]/50 transition-colors">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-[#18181b] rounded-xl overflow-hidden shrink-0 border border-[#27272a]">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-4">
                    <div>
                      <p className="text-[10px] font-mono text-[#3b82f6] uppercase mb-1">UNIT_COMPONENT</p>
                      <h3 className="font-bold text-white line-clamp-2 text-sm md:text-base">{product.name}</h3>
                    </div>
                    <button onClick={() => removeFromCart(product.id)} className="p-2 text-[#71717a] hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                  </div>

                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center gap-2 bg-[#18181b] rounded-xl p-1 border border-[#27272a]">
                      <button onClick={() => updateQuantity(product.id, quantity - 1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#27272a] transition-colors"><Minus className="w-4 h-4 text-white" /></button>
                      <span className="w-8 text-center font-mono font-bold text-white text-sm">{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, quantity + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#27272a] transition-colors"><Plus className="w-4 h-4 text-white" /></button>
                    </div>
                    <span className="text-xl font-bold text-white font-mono">${(product.price * quantity).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={clearCart} className="text-[#ef4444] text-[10px] font-mono font-bold hover:underline uppercase tracking-widest pl-2">PURGE_CART</button>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-[#111113] border border-[#27272a] rounded-2xl p-6 sticky top-24">
              {!showCheckout ? (
                <>
                  <h2 className="text-sm font-bold text-white mb-8 border-b border-[#27272a] pb-4 font-mono uppercase tracking-[0.2em]">Summary</h2>
                  <div className="space-y-4 mb-8 font-mono text-xs">
                    <div className="flex justify-between text-[#71717a]"><span>Subtotal</span><span className="text-white">${cartTotal.toLocaleString()}</span></div>
                    <div className="flex justify-between text-[#71717a]"><span>Shipping</span><span className="text-white">{shipping === 0 ? 'FREE' : `$${shipping}`}</span></div>
                    <div className="flex justify-between text-[#71717a]"><span>Tax (8%)</span><span className="text-white">${tax.toFixed(2)}</span></div>
                    <div className="h-px bg-[#27272a]"></div>
                    <div className="flex justify-between text-xl font-bold text-white pt-2"><span>Total</span><span className="text-[#3b82f6]">${total.toFixed(2)}</span></div>
                  </div>
                  {shipping > 0 && <p className="text-[10px] text-[#3b82f6] mb-8 font-mono animate-pulse">ADD ${(500 - cartTotal).toFixed(2)} MORE FOR FREE_SHIP</p>}
                  <button onClick={() => setShowCheckout(true)} className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#3b82f6] text-white font-bold rounded-2xl hover:bg-[#2563eb] transition-all hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] uppercase text-xs tracking-widest">
                    Proceed to Checkout <ArrowRight className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#27272a]">
                    <button type="button" onClick={() => setShowCheckout(false)} className="p-2 hover:bg-[#18181b] rounded-xl text-white transition-colors"><ArrowLeft className="w-4 h-4" /></button>
                    <h2 className="text-sm font-bold text-white font-mono uppercase tracking-widest">Secure Checkout</h2>
                  </div>
                  {submitError && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <p className="text-red-400 text-sm font-mono">{submitError}</p>
                    </div>
                  )}
                  {['name', 'email', 'phone', 'address'].map(f => (
                    <input key={f} type={f === 'email' ? 'email' : f === 'phone' ? 'tel' : 'text'} placeholder={f.toUpperCase()} required value={(formData as any)[f]} onChange={(e) => setFormData({ ...formData, [f]: e.target.value })} className="w-full px-4 py-3 bg-[#18181b] border border-[#27272a] rounded-xl text-white focus:outline-none focus:border-[#3b82f6] font-mono text-xs" />
                  ))}
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="CITY" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-4 py-3 bg-[#18181b] border border-[#27272a] rounded-xl text-white focus:outline-none focus:border-[#3b82f6] font-mono text-xs" />
                    <input type="text" placeholder="ZIP" required value={formData.zip} onChange={(e) => setFormData({ ...formData, zip: e.target.value })} className="w-full px-4 py-3 bg-[#18181b] border border-[#27272a] rounded-xl text-white focus:outline-none focus:border-[#3b82f6] font-mono text-xs" />
                  </div>
                  <div className="h-px bg-[#27272a] my-6"></div>
                  <div className="flex justify-between font-bold text-white mb-8"><span className="font-mono text-xs">FINAL_TOTAL</span><span className="text-xl font-mono text-[#3b82f6]">${total.toFixed(2)}</span></div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#22c55e] text-white font-bold rounded-2xl hover:bg-[#16a34a] transition-all hover:shadow-[0_0_30px_rgba(34,197,94,0.3)] uppercase text-xs tracking-widest disabled:bg-[#27272a] disabled:text-[#71717a] disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    <CreditCard className="w-5 h-5" /> Place Order
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
