import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FaUtensils, FaLeaf, FaPepperHot, FaStar, FaCocktail, FaFire } from 'react-icons/fa';
import { getAvailableProducts } from '../utils/api';

const Menu = () => {
    const containerRef = useRef(null);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -100]);
    const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await getAvailableProducts();
                if (response.data.success) {
                    const products = response.data.products;
                    
                    // Group products by category
                    const grouped = products.reduce((acc, product) => {
                        const category = product.category || 'Other';
                        if (!acc[category]) {
                            acc[category] = [];
                        }
                        acc[category].push({
                            name: product.name,
                            price: `₹${product.discountPrice || product.price}`,
                            desc: product.description || 'Delicious item from our kitchen',
                            image: product.thumbnail || product.images?.[0] || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
                            tag: product.tags?.[0] || (product.status === 'Low Stock' ? 'Limited' : 'Available'),
                            icon: product.foodType === 'veg' ? FaLeaf : FaUtensils,
                            spicy: product.tags?.includes('Spicy') || false,
                            inStock: product.inStock && product.quantity > 0
                        });
                        return acc;
                    }, {});

                    // Convert to array format
                    const menuData = Object.keys(grouped).map(category => ({
                        category,
                        items: grouped[category]
                    }));

                    setMenuItems(menuData);
                }
            } catch (error) {
                console.error('Failed to fetch products:', error);
                // Fallback to empty array if API fails
                setMenuItems([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div ref={containerRef} className="animate-fade-in bg-background overflow-hidden">
            {/* Cinematic Hero */}
            <section className="relative h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden bg-secondary">
                <motion.div
                    style={{ y: heroY, opacity: heroOpacity }}
                    className="absolute inset-x-0 bottom-0 top-24 z-0"
                >
                    <motion.img
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1.25 }}
                        transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                        src="https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=1920&auto=format&fit=crop&q=80"
                        className="w-full h-full object-cover brightness-[0.75] contrast-[1.1]"
                        alt="Menu Hero"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-secondary via-secondary/40 to-transparent"></div>
                </motion.div>

                <div className="relative z-10 text-center px-6 max-w-5xl">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                    >
                        <span className="text-primary font-black uppercase tracking-[0.4em] text-[10px] md:text-sm mb-4 md:mb-6 block">Gastronomic Journey</span>
                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-display text-white mb-6 md:mb-8 tracking-tighter">
                            Our <span className="text-primary italic">Menu</span>
                        </h1>
                        <div className="w-16 md:w-24 h-1 bg-primary mx-auto mb-8 md:mb-10"></div>
                        <p className="text-lg md:text-2xl text-white/80 font-display italic max-w-2xl mx-auto leading-relaxed">
                            "Feast on the legends of the street, crafted with the purity of heritage."
                        </p>
                    </motion.div>
                </div>

                {/* Decorative Elements */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-10 right-10 w-48 h-48 border-2 border-primary/20 rounded-full border-dashed hidden lg:block"
                ></motion.div>
            </section>

            {/* Menu Sections */}
            <div className="py-20 md:py-32 container mx-auto px-6">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-zinc-500 font-bold">Loading menu...</p>
                    </div>
                ) : menuItems.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-2xl text-zinc-400 font-bold">No items available at the moment</p>
                    </div>
                ) : (
                    menuItems.map((section, sIdx) => (
                    <div key={sIdx} className="mb-20 md:mb-32">
                        <motion.div
                            whileInView={{ opacity: 1, x: 0 }}
                            initial={{ opacity: 0, x: -50 }}
                            className="flex items-center gap-4 md:gap-6 mb-10 md:mb-16"
                        >
                            <h2 className="text-4xl md:text-6xl font-display text-secondary">{section.category}</h2>
                            <div className="h-px flex-grow bg-gradient-to-r from-primary/50 to-transparent"></div>
                        </motion.div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                            {section.items.map((item, idx) => (
                                <motion.div
                                    key={idx}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    initial={{ opacity: 0, y: 30 }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ y: -10 }}
                                    className="bg-white rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-premium border border-primary/5 group flex flex-col h-full"
                                >
                                    <div className="h-64 md:h-72 relative overflow-hidden">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <span className="absolute top-4 right-4 md:top-6 md:right-6 bg-primary text-secondary px-4 md:px-6 py-1.5 md:py-2 rounded-full text-[10px] md:text-xs font-black shadow-2xl flex items-center gap-2">
                                            {item.tag}
                                        </span>
                                        {item.spicy && (
                                            <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-red-600 text-white p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-xl">
                                                <FaPepperHot className="text-sm md:text-base" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-8 md:p-10 flex-grow flex flex-col">
                                        <div className="flex justify-between items-start mb-4 md:mb-6">
                                            <div>
                                                <h3 className="text-2xl md:text-3xl font-display text-secondary mb-1 md:mb-2">{item.name}</h3>
                                                <item.icon className="text-primary/40 text-lg" />
                                            </div>
                                            <span className="text-xl md:text-2xl font-display text-primary">{item.price}</span>
                                        </div>
                                        <p className="text-text-muted text-base md:text-lg leading-relaxed mb-6 md:mb-8 flex-grow italic">{item.desc}</p>
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            disabled={!item.inStock}
                                            className={`w-full py-4 md:py-5 rounded-[1.5rem] md:rounded-[2rem] font-black uppercase tracking-widest text-[10px] md:text-xs transition-all shadow-xl ${
                                                item.inStock 
                                                    ? 'bg-secondary text-white hover:bg-primary hover:text-secondary cursor-pointer' 
                                                    : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                                            }`}
                                        >
                                            {item.inStock ? 'Add to Plate' : 'Out of Stock'}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Special Platter CTA */}
            <section className="pb-20 md:pb-32 container mx-auto px-6">
                <motion.div
                    whileInView={{ scale: 1, opacity: 1 }}
                    initial={{ scale: 0.9, opacity: 0 }}
                    className="bg-primary rounded-[3rem] md:rounded-[5rem] p-10 md:p-32 text-center text-secondary relative overflow-hidden shadow-2xl"
                >
                    <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                        <img src="https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1600&q=80" className="w-full h-full object-cover" />
                    </div>
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl lg:text-8xl font-display mb-6 md:mb-10 leading-tight">The Ultimate <br /><span className="italic">Gappe Platter</span></h2>
                        <p className="text-lg md:text-2xl mb-10 md:mb-16 max-w-3xl mx-auto opacity-80 italic">Can't decide? Try a curated experience of our top 16 specialties at a special price.</p>
                        <button className="bg-secondary text-white px-10 py-4 md:px-16 md:py-6 rounded-full text-lg md:text-xl font-bold hover:scale-105 transition-transform shadow-2xl">
                            Unlock The Feast - ₹499
                        </button>
                    </div>
                </motion.div>
            </section>
        </div>
    );
};

export default Menu;
