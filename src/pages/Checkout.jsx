import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaTrash, FaMinus, FaPlus, FaTag } from 'react-icons/fa';
import { validateOffer, applyOffer, createOrder } from '../utils/api';

const Checkout = ({ cart, user, removeFromCart, updateQty }) => {
    const navigate = useNavigate();
    const [offerCode, setOfferCode] = useState('');
    const [appliedOffer, setAppliedOffer] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showOfferInput, setShowOfferInput] = useState(false);

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
    const discount = appliedOffer ? appliedOffer.priceBreakdown.discountAmount : 0;
    const total = subtotal - discount;

    const handleValidateOffer = async () => {
        if (!offerCode.trim()) {
            toast.error('Enter offer code');
            return;
        }
        
        // Get first product ID from cart for product-specific offers
        const productId = cart.length > 0 ? cart[0]._id : null;
        
        setLoading(true);
        try {
            const res = await validateOffer(offerCode, subtotal, productId);
            setAppliedOffer(res.data);
            toast.success('Offer applied successfully! ✓');
            setShowOfferInput(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid offer code');
            setAppliedOffer(null);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = async () => {
        if (!appliedOffer) {
            toast.error('Please apply an offer first');
            return;
        }
        
        const productId = cart.length > 0 ? cart[0]._id : null;
        
        setLoading(true);
        try {
            // Apply offer to mark it as used
            await applyOffer(offerCode, subtotal, productId);
            
            const orderData = {
                items: cart.map(item => ({
                    product: item._id,
                    quantity: item.qty,
                    price: item.price
                })),
                totalAmount: appliedOffer.priceBreakdown.finalPrice,
                offerCode: offerCode,
                discount: appliedOffer.priceBreakdown.discountAmount,
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
                                <img src={item.thumbnail} alt={item.name} className="w-20 h-20 rounded-lg object-cover" />
                                <div className="flex-1">
                                    <h3 className="font-bold text-secondary">{item.name}</h3>
                                    <p className="text-sm text-zinc-400">₹{item.price}</p>
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

                            {/* Offer Section */}
                            {!appliedOffer ? (
                                <div className="space-y-2">
                                    {!showOfferInput ? (
                                        <button
                                            onClick={() => setShowOfferInput(true)}
                                            className="w-full border-2 border-dashed border-primary text-primary font-bold py-2 rounded-lg hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                                        >
                                            <FaTag size={14} /> Add Offer Code
                                        </button>
                                    ) : (
                                        <div className="space-y-2">
                                            <input
                                                type="text"
                                                placeholder="Enter 6-digit code"
                                                value={offerCode}
                                                onChange={(e) => setOfferCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
                                                maxLength={6}
                                                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-primary uppercase tracking-wider"
                                            />
                                            <button
                                                onClick={handleValidateOffer}
                                                disabled={loading || offerCode.length !== 6}
                                                className="w-full bg-primary text-white font-bold py-2 rounded-lg hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                            >
                                                {loading ? 'Checking...' : 'Apply Offer'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-2">
                                    <p className="text-xs font-black text-emerald-700 uppercase">✓ Offer Valid</p>
                                    <p className="text-sm font-bold text-secondary">{appliedOffer.offer.code}</p>
                                    <p className="text-xs text-zinc-600">Save ₹{appliedOffer.priceBreakdown.discountAmount}</p>
                                </div>
                            )}

                            <button
                                onClick={handleCheckout}
                                disabled={loading || !appliedOffer}
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
