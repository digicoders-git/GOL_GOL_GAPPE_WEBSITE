import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaTrash, FaMinus, FaPlus, FaCheckCircle } from 'react-icons/fa';
import { createOrder } from '../utils/api';

const Checkout = ({ cart, user, removeFromCart, updateQty }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center pt-24 px-4">
                <h2 className="text-3xl font-display text-secondary mb-4">Please Login First</h2>
                <button onClick={() => navigate('/login')} className="btn-primary px-8 py-3 rounded-full">Login</button>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center pt-24 px-4">
                <h2 className="text-3xl font-display text-secondary mb-4">Your cart is empty</h2>
                <button onClick={() => navigate('/menu')} className="btn-primary px-8 py-3 rounded-full">Continue Shopping</button>
            </div>
        );
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const discount = cart.reduce((sum, item) => (item.discount || 0) * item.qty, 0);
    const total = subtotal;

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const orderData = {
                items: cart.map(item => ({
                    product: item._id,
                    quantity: item.qty,
                    price: item.price,
                    discount: item.discount || 0,
                    offer: item.offer || null
                })),
                totalAmount: total,
                discount: discount,
                paymentMethod: 'Cash',
                paymentStatus: 'Pending'
            };
            await createOrder(orderData);
            toast.success('Order placed successfully! ✓');
            setTimeout(() => navigate('/my-orders'), 1500);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pt-28 pb-20 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-display text-secondary mb-8">Checkout</h1>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="md:col-span-2 space-y-4">
                        {cart.map(item => (
                            <motion.div
                                key={item._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl p-4 flex gap-4 items-center shadow-sm border border-zinc-100"
                            >
                                <img src={item.image || item.thumbnail} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                                <div className="flex-1">
                                    <h3 className="font-bold text-secondary">{item.name}</h3>
                                    <p className="text-sm text-zinc-400">₹{item.price}</p>
                                    {item.offer && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <FaCheckCircle className="text-green-600 text-xs" />
                                            <span className="text-xs text-green-600 font-bold">{item.offer.title}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 bg-zinc-100 rounded-lg p-1">
                                    <button onClick={() => updateQty(item._id, item.qty - 1)} className="p-1 hover:bg-white rounded"><FaMinus size={12} /></button>
                                    <span className="w-6 text-center font-bold text-sm">{item.qty}</span>
                                    <button onClick={() => updateQty(item._id, item.qty + 1)} className="p-1 hover:bg-white rounded"><FaPlus size={12} /></button>
                                </div>
                                <span className="font-bold text-secondary min-w-16 text-right">₹{item.price * item.qty}</span>
                                <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700"><FaTrash /></button>
                            </motion.div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="md:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl shadow-premium p-6 sticky top-32 space-y-4"
                        >
                            <h2 className="text-xl font-display text-secondary">Order Summary</h2>

                            <div className="space-y-2 border-b border-zinc-100 pb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-600">Subtotal</span>
                                    <span className="font-bold">₹{subtotal.toFixed(2)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-sm text-emerald-600">
                                        <span>Discount</span>
                                        <span className="font-bold">-₹{discount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between text-lg font-black text-secondary">
                                <span>Total</span>
                                <span className="text-primary">₹{total.toFixed(2)}</span>
                            </div>

                            {discount > 0 && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <p className="text-xs font-black text-green-700 uppercase flex items-center gap-2">
                                        <FaCheckCircle /> Offers Applied
                                    </p>
                                    <p className="text-xs text-zinc-600 mt-1">You saved ₹{discount.toFixed(2)}</p>
                                </div>
                            )}

                            <button
                                onClick={handleCheckout}
                                disabled={loading}
                                className="w-full bg-secondary text-primary font-black py-3 rounded-lg hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                            >
                                {loading ? 'Processing...' : 'Confirm Order'}
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
