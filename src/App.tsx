import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Coffee, Info, Menu as MenuIcon, ShoppingCart, Calendar, Phone, Star, Settings, 
  LogOut, User as UserIcon, Plus, Trash2, CheckCircle, CreditCard, Wallet, 
  Moon, Sun, ChevronRight, Bell, BarChart3, Users, ShieldCheck, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { User, MenuItem, CartItem, Order, Reservation } from './types';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Contexts
const AuthContext = createContext<{
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
} | null>(null);

const CartContext = createContext<{
  cart: CartItem[];
  favorites: MenuItem[];
  addToCart: (item: MenuItem) => void;
  toggleFavorite: (item: MenuItem) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  total: number;
} | null>(null);

const ThemeContext = createContext<{
  isDark: boolean;
  toggleTheme: () => void;
} | null>(null);

// Hooks
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
};

// Components
const Navbar = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', path: '/', icon: Coffee },
    { name: 'About', path: '/about', icon: Info },
    { name: 'Menu', path: '/menu', icon: MenuIcon },
    { name: 'Cart', path: '/cart', icon: ShoppingCart, badge: cart.length },
    { name: 'Table Reservation', path: '/reservation', icon: Calendar },
    { name: 'Contact', path: '/contact', icon: Phone },
    { name: 'Review', path: '/review', icon: Star },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user?.role === 'manager' || user?.role === 'staff') {
      fetch('/api/orders').then(res => res.json()).then(data => {
        setNotifications(data.filter((o: any) => o.status === 'pending'));
      });
    }
  }, [user]);

  return (
    <nav className={cn(
      "sticky top-0 z-50 w-full border-b backdrop-blur-md transition-colors duration-300",
      isDark ? "bg-zinc-950/80 border-zinc-800 text-zinc-100" : "bg-white/80 border-zinc-200 text-zinc-900"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-amber-600 rounded-lg group-hover:rotate-12 transition-transform">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">Coffee Ghar</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link 
                key={item.name} 
                to={item.path}
                className="relative text-sm font-medium hover:text-amber-600 transition-colors flex items-center gap-1"
              >
                <item.icon className="w-4 h-4" />
                {item.name}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-2 -right-3 bg-amber-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {(user?.role === 'manager' || user?.role === 'staff') && (
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={cn(
                        "absolute right-0 mt-2 w-64 rounded-2xl border shadow-2xl p-4",
                        isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-200"
                      )}
                    >
                      <h4 className="font-bold text-sm mb-3">New Orders</h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="text-xs opacity-60">No pending orders.</p>
                        ) : (
                          notifications.map(n => (
                            <div key={n.id} className="text-xs p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                              <p className="font-bold">Order #{n.id}</p>
                              <p className="opacity-60">Rs. {n.total_price} - {n.payment_method}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-medium">{user.name}</p>
                  <p className="text-[10px] opacity-60 capitalize">{user.role}</p>
                </div>
                <button 
                  onClick={() => { logout(); navigate('/login'); }}
                  className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="px-4 py-2 bg-amber-600 text-white rounded-full text-sm font-medium hover:bg-amber-700 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Pages
const Home = () => {
  const { isDark } = useTheme();
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <img 
          src="https://picsum.photos/seed/coffee-hero/1920/1080?blur=2" 
          alt="Coffee Ghar Hero"
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-amber-600 rounded-2xl shadow-2xl">
                <Coffee className="w-16 h-16 text-white" />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tighter">
              Coffee Ghar
            </h1>
            <p className="text-xl md:text-2xl text-amber-100 font-light italic mb-8">
              "Where every bean tells a story, and every cup feels like home."
            </p>
            <Link 
              to="/menu"
              className="px-8 py-4 bg-amber-600 text-white rounded-full text-lg font-semibold hover:bg-amber-700 transition-all hover:scale-105 shadow-xl"
            >
              Explore Our Menu
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Featured Section */}
      <section className={cn("py-20 px-4", isDark ? "bg-zinc-900" : "bg-zinc-50")}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { title: "Premium Beans", desc: "Sourced from the finest high-altitude plantations.", icon: Coffee },
            { title: "Expert Baristas", desc: "Crafting each cup with precision and passion.", icon: UserIcon },
            { title: "Cozy Atmosphere", desc: "The perfect spot for work, rest, or conversation.", icon: Calendar },
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className={cn(
                "p-8 rounded-3xl border transition-all hover:shadow-xl",
                isDark ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-200"
              )}
            >
              <feature.icon className="w-10 h-10 text-amber-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="opacity-70">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

const About = () => {
  const { isDark } = useTheme();
  return (
    <div className="max-w-4xl mx-auto py-20 px-4">
      <h2 className="text-4xl font-bold mb-8 text-center">About Our Coffee</h2>
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <img 
          src="https://picsum.photos/seed/coffee-beans/600/800" 
          alt="Coffee Beans"
          className="rounded-3xl shadow-2xl"
          referrerPolicy="no-referrer"
        />
        <div className="space-y-6 text-lg opacity-80">
          <p>
            At Coffee Ghar, we believe that coffee is more than just a beverage; it's a ritual, a science, and an art form. Our journey begins in the lush, green mountains where the world's finest Arabica beans are grown.
          </p>
          <p>
            We work directly with farmers to ensure sustainable practices and the highest quality harvest. Each batch is roasted in small quantities to preserve the unique flavor profiles of the origin.
          </p>
          <p>
            Whether you prefer a bold, dark roast or a bright, fruity light roast, our baristas are trained to extract the perfect shot every single time.
          </p>
          <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <h4 className="font-bold text-amber-600 mb-2">Our Mission</h4>
            <p className="text-sm italic">
              "To provide a sanctuary for coffee lovers, fostering community and excellence in every cup."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Menu = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const { addToCart, favorites, toggleFavorite } = useCart();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetch('/api/menu').then(res => res.json()).then(setItems);
  }, []);

  const categories = ['All', 'Favorites', ...new Set(items.map(i => i.category))];
  const filteredItems = category === 'All' 
    ? items 
    : category === 'Favorites' 
      ? favorites 
      : items.filter(i => i.category === category);

  const handleDelete = async (id: number) => {
    if (!confirm("Remove this item?")) return;
    await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    setItems(items.filter(i => i.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h2 className="text-4xl font-bold mb-2">Our Menu</h2>
          <p className="opacity-60">Handcrafted drinks and delicious bites.</p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                category === cat 
                  ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20" 
                  : "bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredItems.map(item => (
          <motion.div 
            layout
            key={item.id}
            className={cn(
              "group rounded-3xl border overflow-hidden transition-all hover:shadow-2xl",
              isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
            )}
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={item.image_url} 
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                Rs. {item.price}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold mb-1">{item.name}</h3>
              <p className="text-sm opacity-60 mb-6 line-clamp-2 h-10">{item.description}</p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => addToCart(item)}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-600 text-white py-2 rounded-xl font-medium hover:bg-amber-700 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
                <button 
                  onClick={() => toggleFavorite(item)}
                  className={cn(
                    "p-2 rounded-xl border transition-colors",
                    favorites.find(f => f.id === item.id) 
                      ? "bg-red-50 border-red-200 text-red-500" 
                      : "border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-red-500"
                  )}
                >
                  <Star className={cn("w-5 h-5", favorites.find(f => f.id === item.id) && "fill-current")} />
                </button>
                {(user?.role === 'manager' || user?.role === 'staff') && (
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Cart = () => {
  const { cart, removeFromCart, total, clearCart } = useCart();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [step, setStep] = useState<'cart' | 'payment' | 'success'>('cart');
  const [paymentMethod, setPaymentMethod] = useState<'esewa' | 'bank' | 'cash'>('esewa');
  const navigate = useNavigate();

  const handleOrder = async () => {
    if (!user) {
      alert("Please login to place an order.");
      navigate('/login');
      return;
    }
    
    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        items: cart,
        total_price: total,
        payment_method: paymentMethod
      })
    });
    
    setStep('success');
    clearCart();
  };

  if (step === 'success') {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Order Confirmed!</h2>
        <p className="opacity-60 mb-8">Your coffee is being prepared. We'll notify you when it's ready.</p>
        <Link to="/" className="block w-full py-3 bg-amber-600 text-white rounded-xl font-bold">Back to Home</Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <ShoppingCart className="w-16 h-16 opacity-20 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="opacity-60 mb-8">Add some delicious coffee to get started.</p>
        <Link to="/menu" className="inline-block px-8 py-3 bg-amber-600 text-white rounded-xl font-bold">View Menu</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold mb-8">Your Cart</h2>
      <div className="grid md:grid-cols-3 gap-12">
        <div className="md:col-span-2 space-y-4">
          {cart.map(item => (
            <div key={item.id} className={cn(
              "flex items-center gap-4 p-4 rounded-2xl border",
              isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
            )}>
              <img src={item.image_url} alt={item.name} className="w-20 h-20 rounded-xl object-cover" referrerPolicy="no-referrer" />
              <div className="flex-1">
                <h4 className="font-bold">{item.name}</h4>
                <p className="text-sm opacity-60">Qty: {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">Rs. {item.price * item.quantity}</p>
                <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 hover:underline">Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className={cn(
            "p-6 rounded-3xl border",
            isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
          )}>
            <h3 className="text-xl font-bold mb-4">Order Summary</h3>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between opacity-60">
                <span>Subtotal</span>
                <span>Rs. {total}</span>
              </div>
              <div className="flex justify-between opacity-60">
                <span>Tax (13%)</span>
                <span>Included</span>
              </div>
              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>Rs. {total}</span>
              </div>
            </div>

            {step === 'cart' ? (
              <button 
                onClick={() => setStep('payment')}
                className="w-full py-4 bg-amber-600 text-white rounded-2xl font-bold hover:bg-amber-700 transition-colors"
              >
                Checkout
              </button>
            ) : (
              <div className="space-y-4">
                <h4 className="font-bold text-sm uppercase tracking-wider opacity-60">Payment Method</h4>
                <div className="space-y-2">
                  {[
                    { id: 'esewa', name: 'eSewa', icon: Wallet },
                    { id: 'bank', name: 'Bank Account', icon: CreditCard },
                    { id: 'cash', name: 'Cash (Contact Staff)', icon: Phone },
                  ].map(method => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as any)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl border transition-all",
                        paymentMethod === method.id 
                          ? "border-amber-600 bg-amber-50 dark:bg-amber-900/20" 
                          : "border-zinc-200 dark:border-zinc-800"
                      )}
                    >
                      <method.icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{method.name}</span>
                    </button>
                  ))}
                </div>
                <button 
                  onClick={handleOrder}
                  className="w-full py-4 bg-amber-600 text-white rounded-2xl font-bold hover:bg-amber-700 transition-colors"
                >
                  Confirm Order
                </button>
                <button onClick={() => setStep('cart')} className="w-full text-sm opacity-60 hover:underline">Back to Cart</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ReservationPage = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    date: '',
    time: '',
    event: 'Casual',
    table: 1
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Please login to reserve a table.");
    
    await fetch('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: user.id,
        customer_name: formData.name,
        date: formData.date,
        time: formData.time,
        event_category: formData.event,
        table_number: formData.table
      })
    });
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Reservation Confirmed!</h2>
        <p className="opacity-60 mb-8">We've saved a spot for you on {formData.date} at {formData.time}.</p>
        <button onClick={() => setSuccess(false)} className="px-8 py-3 bg-amber-600 text-white rounded-xl font-bold">New Reservation</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold mb-2">Table Reservation</h2>
      <p className="opacity-60 mb-8">Book your favorite spot in advance.</p>
      
      <form onSubmit={handleSubmit} className={cn(
        "p-8 rounded-3xl border space-y-6",
        isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
      )}>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <input 
              required
              type="text" 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border bg-transparent border-zinc-200 dark:border-zinc-800 focus:ring-2 ring-amber-600 outline-none" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Event Category</label>
            <select 
              value={formData.event}
              onChange={e => setFormData({...formData, event: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border bg-transparent border-zinc-200 dark:border-zinc-800 focus:ring-2 ring-amber-600 outline-none"
            >
              <option>Casual</option>
              <option>Birthday</option>
              <option>Meeting</option>
              <option>Date</option>
              <option>Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Date</label>
            <input 
              required
              type="date" 
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border bg-transparent border-zinc-200 dark:border-zinc-800 focus:ring-2 ring-amber-600 outline-none" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Time</label>
            <input 
              required
              type="time" 
              value={formData.time}
              onChange={e => setFormData({...formData, time: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border bg-transparent border-zinc-200 dark:border-zinc-800 focus:ring-2 ring-amber-600 outline-none" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Table Number (1-20)</label>
            <input 
              required
              type="number" 
              min="1" max="20"
              value={formData.table}
              onChange={e => setFormData({...formData, table: parseInt(e.target.value)})}
              className="w-full px-4 py-3 rounded-xl border bg-transparent border-zinc-200 dark:border-zinc-800 focus:ring-2 ring-amber-600 outline-none" 
            />
          </div>
        </div>
        <button type="submit" className="w-full py-4 bg-amber-600 text-white rounded-2xl font-bold hover:bg-amber-700 transition-colors">
          Confirm Reservation
        </button>
      </form>
    </div>
  );
};

const Contact = () => {
  const { isDark } = useTheme();
  return (
    <div className="max-w-7xl mx-auto py-20 px-4">
      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <h2 className="text-4xl font-bold mb-6">Get in Touch</h2>
          <p className="text-lg opacity-60 mb-12">We'd love to hear from you. Visit us or reach out through any of these channels.</p>
          
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold">Phone</h4>
                <p className="opacity-60">+977-9800000000</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold">Email</h4>
                <p className="opacity-60">hello@coffeeghar.com</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold">Location</h4>
                <p className="opacity-60">Jhamsikhel, Lalitpur, Nepal</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex gap-4">
            {['Instagram', 'Facebook', 'Twitter'].map(social => (
              <button key={social} className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-full text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                {social}
              </button>
            ))}
          </div>
        </div>

        <div className={cn(
          "p-8 rounded-3xl border",
          isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
        )}>
          <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
          <form className="space-y-4">
            <input type="text" placeholder="Name" className="w-full px-4 py-3 rounded-xl border bg-transparent border-zinc-200 dark:border-zinc-800 outline-none" />
            <input type="email" placeholder="Email" className="w-full px-4 py-3 rounded-xl border bg-transparent border-zinc-200 dark:border-zinc-800 outline-none" />
            <textarea placeholder="Message" rows={4} className="w-full px-4 py-3 rounded-xl border bg-transparent border-zinc-200 dark:border-zinc-800 outline-none"></textarea>
            <button className="w-full py-4 bg-amber-600 text-white rounded-2xl font-bold">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

const Review = () => {
  const reviews = [
    { name: "Aarav Sharma", rating: 5, text: "Best espresso in town! The atmosphere is perfect for working." },
    { name: "Sita Gurung", rating: 4, text: "Love the croissants. A bit crowded on weekends but worth it." },
    { name: "David Rai", rating: 5, text: "The baristas really know their craft. Highly recommended." },
  ];

  return (
    <div className="max-w-4xl mx-auto py-20 px-4">
      <h2 className="text-4xl font-bold mb-12 text-center">Customer Reviews</h2>
      <div className="grid gap-6">
        {reviews.map((r, i) => (
          <div key={i} className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="flex items-center gap-1 text-amber-500 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={cn("w-5 h-5", i < r.rating ? "fill-current" : "opacity-20")} />
              ))}
            </div>
            <p className="text-lg italic mb-4">"{r.text}"</p>
            <p className="font-bold">- {r.name}</p>
          </div>
        ))}
      </div>
      <div className="mt-12 text-center">
        <button className="px-8 py-3 bg-amber-600 text-white rounded-xl font-bold">Write a Review</button>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const { user, login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'account' | 'manager'>('account');
  const [stats, setStats] = useState<any>(null);
  const [newMenuItem, setNewMenuItem] = useState({ name: '', description: '', price: '', category: 'Coffee', image_url: '' });
  const [newStaff, setNewStaff] = useState({ name: '', email: '', phone: '', password: '' });

  useEffect(() => {
    if (user?.role === 'manager') {
      fetch('/api/manager/stats').then(res => res.json()).then(setStats);
    }
  }, [user]);

  const handleAddMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMenuItem)
    });
    alert("Item added!");
    setNewMenuItem({ name: '', description: '', price: '', category: 'Coffee', image_url: '' });
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/manager/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStaff)
    });
    if (res.ok) {
      alert("Staff added!");
      setNewStaff({ name: '', email: '', phone: '', password: '' });
      fetch('/api/manager/stats').then(res => res.json()).then(setStats);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="flex gap-8">
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="space-y-2">
            <button 
              onClick={() => setActiveTab('account')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                activeTab === 'account' ? "bg-amber-600 text-white" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              <UserIcon className="w-4 h-4" /> Account Details
            </button>
            {user?.role === 'manager' && (
              <button 
                onClick={() => setActiveTab('manager')}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                  activeTab === 'manager' ? "bg-amber-600 text-white" : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                )}
              >
                <ShieldCheck className="w-4 h-4" /> Manager Dashboard
              </button>
            )}
            <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-sm opacity-60">Dark Mode</span>
                <button onClick={toggleTheme} className="p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1">
          {activeTab === 'account' ? (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold">Account Settings</h2>
              <div className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-bold">Personal Information</h3>
                  <div className="space-y-2">
                    <label className="text-xs opacity-60 uppercase">Name</label>
                    <p className="font-medium">{user?.name}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs opacity-60 uppercase">Email</label>
                    <p className="font-medium">{user?.email}</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs opacity-60 uppercase">Phone</label>
                    <p className="font-medium">{user?.phone}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h3 className="font-bold">Security</h3>
                  <button className="w-full py-3 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    Change Password
                  </button>
                  <button className="w-full py-3 border border-red-200 text-red-500 rounded-xl text-sm font-medium hover:bg-red-50 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              <h2 className="text-3xl font-bold">Manager Dashboard</h2>
              
              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 rounded-3xl bg-amber-600 text-white">
                  <BarChart3 className="w-8 h-8 mb-4" />
                  <p className="text-sm opacity-80">Total Revenue</p>
                  <h4 className="text-3xl font-bold">Rs. {stats?.totalRevenue?.total || 0}</h4>
                </div>
                <div className="p-6 rounded-3xl bg-zinc-900 text-white">
                  <Users className="w-8 h-8 mb-4" />
                  <p className="text-sm opacity-80">Total Customers</p>
                  <h4 className="text-3xl font-bold">{stats?.customerCount?.count || 0}</h4>
                </div>
                <div className="p-6 rounded-3xl bg-zinc-100 dark:bg-zinc-800">
                  <Bell className="w-8 h-8 mb-4 text-amber-600" />
                  <p className="text-sm opacity-60">Active Staff</p>
                  <h4 className="text-3xl font-bold">{stats?.staffList?.length || 0}</h4>
                </div>
              </div>

              {/* Sales Graph */}
              <div className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 h-[400px]">
                <h3 className="font-bold mb-6">Sales Performance</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.salesByDay || []}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d97706" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#27272a" : "#f4f4f5"} />
                    <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `Rs.${v}`} />
                    <Tooltip />
                    <Area type="monotone" dataKey="total" stroke="#d97706" fillOpacity={1} fill="url(#colorTotal)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Management Forms */}
              <div className="grid md:grid-cols-2 gap-8">
                <div className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                  <h3 className="font-bold mb-6">Add Menu Item</h3>
                  <form onSubmit={handleAddMenu} className="space-y-4">
                    <input required placeholder="Name" value={newMenuItem.name} onChange={e => setNewMenuItem({...newMenuItem, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border bg-transparent border-zinc-200 dark:border-zinc-800 outline-none" />
                    <input required placeholder="Price" type="number" value={newMenuItem.price} onChange={e => setNewMenuItem({...newMenuItem, price: e.target.value})} className="w-full px-4 py-2 rounded-xl border bg-transparent border-zinc-200 dark:border-zinc-800 outline-none" />
                    <input required placeholder="Image URL" value={newMenuItem.image_url} onChange={e => setNewMenuItem({...newMenuItem, image_url: e.target.value})} className="w-full px-4 py-2 rounded-xl border bg-transparent border-zinc-200 dark:border-zinc-800 outline-none" />
                    <textarea required placeholder="Description" value={newMenuItem.description} onChange={e => setNewMenuItem({...newMenuItem, description: e.target.value})} className="w-full px-4 py-2 rounded-xl border bg-transparent border-zinc-200 dark:border-zinc-800 outline-none" />
                    <button className="w-full py-3 bg-amber-600 text-white rounded-xl font-bold">Add Item</button>
                  </form>
                </div>
                <div className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                  <h3 className="font-bold mb-6">Add Staff Member</h3>
                  <form onSubmit={handleAddStaff} className="space-y-4">
                    <input required placeholder="Staff Name" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} className="w-full px-4 py-2 rounded-xl border bg-transparent border-zinc-200 dark:border-zinc-800 outline-none" />
                    <input required placeholder="Email" type="email" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} className="w-full px-4 py-2 rounded-xl border bg-transparent border-zinc-200 dark:border-zinc-800 outline-none" />
                    <input required placeholder="Phone" value={newStaff.phone} onChange={e => setNewStaff({...newStaff, phone: e.target.value})} className="w-full px-4 py-2 rounded-xl border bg-transparent border-zinc-200 dark:border-zinc-800 outline-none" />
                    <input required placeholder="Password" type="password" value={newStaff.password} onChange={e => setNewStaff({...newStaff, password: e.target.value})} className="w-full px-4 py-2 rounded-xl border bg-transparent border-zinc-200 dark:border-zinc-800 outline-none" />
                    <button className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold">Add Staff</button>
                  </form>
                </div>
              </div>

              {/* Customer Details Table */}
              <div className="p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-x-auto">
                <h3 className="font-bold mb-6">Customer Database</h3>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800">
                      <th className="pb-4 font-bold">Name</th>
                      <th className="pb-4 font-bold">Email</th>
                      <th className="pb-4 font-bold">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {stats?.customerList?.map((c: any) => (
                      <tr key={c.id}>
                        <td className="py-4">{c.name}</td>
                        <td className="py-4">{c.email}</td>
                        <td className="py-4">{c.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const LoginPage = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [isRecover, setIsRecover] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    const data = await res.json();
    if (res.ok) {
      login(data);
      navigate('/');
    } else {
      alert(data.error);
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/recover-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formData.email })
    });
    const data = await res.json();
    alert(data.message || data.error);
    setIsRecover(false);
  };

  if (isRecover) {
    return (
      <div className="max-w-md mx-auto py-20 px-4">
        <h2 className="text-3xl font-bold mb-2">Recover Password</h2>
        <p className="opacity-60 mb-8">Enter your email to receive your password.</p>
        <form onSubmit={handleRecover} className="space-y-4">
          <input required type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border bg-transparent border-zinc-200 dark:border-zinc-800 outline-none" />
          <button className="w-full py-4 bg-amber-600 text-white rounded-2xl font-bold">Send Recovery Email</button>
          <button type="button" onClick={() => setIsRecover(false)} className="w-full text-sm opacity-60">Back to Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <div className="text-center mb-12">
        <div className="inline-flex p-4 bg-amber-600 rounded-2xl mb-4">
          <Coffee className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold">{isRegister ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="opacity-60">{isRegister ? 'Join the Coffee Ghar community.' : 'Login to your account.'}</p>
      </div>

      <form onSubmit={handleSubmit} className={cn(
        "p-8 rounded-3xl border space-y-4",
        isDark ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
      )}>
        {isRegister && (
          <>
            <input required placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border bg-transparent border-zinc-200 dark:border-zinc-800 outline-none" />
            <input required placeholder="Phone Number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border bg-transparent border-zinc-200 dark:border-zinc-800 outline-none" />
          </>
        )}
        <input required type="email" placeholder="Email Address" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border bg-transparent border-zinc-200 dark:border-zinc-800 outline-none" />
        <input required type="password" placeholder="Password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 rounded-xl border bg-transparent border-zinc-200 dark:border-zinc-800 outline-none" />
        
        {!isRegister && (
          <button type="button" onClick={() => setIsRecover(true)} className="text-xs text-amber-600 hover:underline">Forgot password?</button>
        )}

        <button className="w-full py-4 bg-amber-600 text-white rounded-2xl font-bold hover:bg-amber-700 transition-colors">
          {isRegister ? 'Sign Up' : 'Login'}
        </button>

        <p className="text-center text-sm opacity-60 pt-4">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-amber-600 font-bold hover:underline">
            {isRegister ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </form>
    </div>
  );
};

// Layout
const Layout = ({ children }: { children: React.ReactNode }) => {
  const { isDark } = useTheme();
  return (
    <div className={cn("min-h-screen transition-colors duration-300", isDark ? "bg-zinc-950 text-zinc-100" : "bg-white text-zinc-900")}>
      <Navbar />
      <main>{children}</main>
      <footer className={cn("py-12 border-t", isDark ? "border-zinc-800 bg-zinc-900" : "border-zinc-100 bg-zinc-50")}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-2 bg-amber-600 rounded-lg">
              <Coffee className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="font-bold text-xl mb-2">Coffee Ghar</p>
          <p className="text-sm opacity-60 mb-8 max-w-md mx-auto">Premium coffee experience in the heart of the city. Join us for a cup of perfection.</p>
          <p className="text-xs opacity-40">© 2026 Coffee Ghar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

// Providers
export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favorites, setFavorites] = useState<MenuItem[]>([]);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    if (isDark) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDark]);

  const login = (u: User) => {
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const toggleFavorite = (item: MenuItem) => {
    setFavorites(prev => {
      if (prev.find(f => f.id === item.id)) {
        return prev.filter(f => f.id !== item.id);
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(!isDark) }}>
      <AuthContext.Provider value={{ user, login, logout }}>
        <CartContext.Provider value={{ cart, favorites, addToCart, toggleFavorite, removeFromCart, clearCart, total }}>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/reservation" element={<ReservationPage />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/review" element={<Review />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/login" element={<LoginPage />} />
              </Routes>
            </Layout>
          </Router>
        </CartContext.Provider>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  );
}
