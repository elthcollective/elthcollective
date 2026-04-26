import React, { useState } from "react";
import {
  ShoppingBag,
  X,
  ChevronRight,
  ArrowLeft,
  Search,
  Check,
  Mail,
  Lock,
  Gift,
  Truck,
  Sparkles,
  Briefcase,
  Users,
  Feather,
  HeartPulse,
  GraduationCap,
  Flower,
  Star,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const BRAND = {
  name: "ELTH Collective",
  announcement: "Intentional Gifting. Nationwide Courier to your nearest hub.",
  whatsapp: "27123456789",
};

const COLLECTIONS = [
  {
    title: "FOR Maternity",
    subtitle: "Self-care and comfort for the expecting mother.",
    description:
      "Curated essentials designed to pamper and support moms-to-be during their journey, featuring luxury local skin-care and relaxation tools.",
  },
  {
    title: "FOR Baby Welcome",
    subtitle: "Gentle treasures for the newest arrival.",
    description:
      "Soft textures and organic keepsakes for the first days at home, designed to be cherished as family heirlooms.",
  },
  {
    title: "FOR Baby Showers",
    subtitle: "Thoughtful gifts for the celebration of new life.",
    description:
      "Elegant curations designed specifically for baby showers, focusing on quality, aesthetic appeal, and practical luxury for both mom and baby.",
  },
];

const PRODUCTS = COLLECTIONS.map((c) => ({
  id: c.title.toLowerCase().replace(/\s+/g, "-"),
  category: c.title,
  name: `${c.title} Curation`,
  price: c.title.includes("Maternity") ? 850 : 950,
  imageLabel: c.title,
}));

const DELIVERY_FEE = 80;
const COLLECTION_FEE = 0;

const COLLECTION_POINTS = [
  "Select collection point",
  "Collection points coming soon",
];

function ElthLogo({ size = "normal", light = false }) {
  const isLarge = size === "large";
  const textColor = light ? "text-white" : "text-stone-900";
  const subColor = light ? "text-stone-500" : "text-stone-400";

  return (
    <div className="flex flex-col items-center">
      <div
        className={`font-serif italic tracking-tighter leading-none ${textColor} ${
          isLarge ? "text-5xl" : "text-2xl"
        }`}
      >
        ELTH
      </div>
      <div
        className={`uppercase font-sans font-bold tracking-[0.6em] -mr-[0.6em] ${subColor} ${
          isLarge ? "text-[10px] mt-2" : "text-[7px] mt-1"
        }`}
      >
        Collective
      </div>
    </div>
  );
}

const WhatsAppIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.938 3.659 1.432 5.63 1.432h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

function manualFormatZAR(value) {
  return `R ${Number(value || 0).toLocaleString("en-ZA")}`;
}

function PlaceholderImage({ label, height = "h-64", small = false }) {
  return (
    <div
      className={`relative w-full overflow-hidden rounded-sm bg-stone-100 group-hover:bg-stone-200 transition-all duration-700 ${height}`}
    >
      <div className="absolute inset-0 grid place-items-center p-2 text-center">
        {!small ? (
          <div>
            <div className="text-[10px] uppercase tracking-[0.4em] text-stone-400 mb-2 font-medium">
              ELTH Collection
            </div>
            <div className="text-sm font-light italic text-stone-700">{label}</div>
          </div>
        ) : (
          <div className="text-[7px] uppercase tracking-tighter text-stone-400 font-bold">
            {label}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("home");
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState({ open: false, text: "" });
  const [checkoutStep, setCheckoutStep] = useState("details");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    contact: "",
    method: "",
    addressLine1: "",
    addressLine2: "",
    suburb: "",
    city: "",
    postalCode: "",
    collectionPoint: "Select collection point",
  });

  const showToast = (text) => {
    setToast({ open: true, text });
    setTimeout(() => setToast({ open: false, text: "" }), 3000);
  };

  const goHome = () => {
    setView("home");
    setSelectedCollection(null);
    setCheckoutStep("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openCollection = (title) => {
    setSelectedCollection(title);
    setView("collection");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openBespoke = () => {
    setView("bespoke");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  function addToCart(product, message) {
    const cartEntry = {
      ...product,
      cartId: `${product.id}-${Date.now()}`,
      message: message.trim() || "",
      qty: 1,
    };
    setCartItems((prev) => [...prev, cartEntry]);
    setSelectedMessage("");
    setCartOpen(true);
    showToast(`${product.name} added to bag`);
  }

  function removeFromCart(cartId) {
    setCartItems((prev) => prev.filter((x) => x.cartId !== cartId));
  }

  const itemsTotal = cartItems.reduce((s, i) => s + (i.price || 0) * (i.qty || 1), 0);

  const fulfilmentFee =
    formData.method === "delivery"
      ? DELIVERY_FEE
      : formData.method === "collection"
      ? COLLECTION_FEE
      : 0;

  const grandTotal = itemsTotal + fulfilmentFee;

  const isDetailsValid =
    formData.firstName.trim() &&
    formData.lastName.trim() &&
    formData.email.trim() &&
    formData.contact.trim() &&
    formData.method &&
    (
      (formData.method === "delivery" &&
        formData.addressLine1.trim() &&
        formData.suburb.trim() &&
        formData.city.trim() &&
        formData.postalCode.trim()) ||
      (formData.method === "collection" &&
        formData.collectionPoint &&
        formData.collectionPoint !== "Select collection point")
    );

  const moveToCheckout = () => {
    setCartOpen(false);
    setView("checkout");
    setCheckoutStep("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToPaymentStep = () => {
    if (!formData.firstName.trim()) {
      alert("Please enter your full name");
      return;
    }

    if (!formData.lastName.trim()) {
      alert("Please enter your surname");
      return;
    }

    if (!formData.email.trim()) {
      alert("Please enter your email address");
      return;
    }

    if (!formData.contact.trim()) {
      alert("Please enter your contact number");
      return;
    }

    if (!formData.method) {
      alert("Please choose delivery or collection");
      return;
    }

    if (formData.method === "delivery") {
      if (!formData.addressLine1.trim()) {
        alert("Please enter address line 1");
        return;
      }

      if (!formData.suburb.trim()) {
        alert("Please enter your suburb");
        return;
      }

      if (!formData.city.trim()) {
        alert("Please enter your city");
        return;
      }

      if (!formData.postalCode.trim()) {
        alert("Please enter your postal code");
        return;
      }
    }

    if (
      formData.method === "collection" &&
      (!formData.collectionPoint || formData.collectionPoint === "Select collection point")
    ) {
      alert("Please choose a collection point");
      return;
    }

    setCheckoutStep("payment");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePayfastCheckout = async () => {
    try {
      setCheckoutLoading(true);

      const response = await fetch("/api/checkout/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: `${formData.firstName} ${formData.lastName}`.trim(),
          customerEmail: formData.email.trim(),
          customerPhone: formData.contact.trim(),
          fulfilmentMethod: formData.method,
          deliveryAddress:
            formData.method === "delivery"
              ? {
                  line1: formData.addressLine1.trim(),
                  line2: formData.addressLine2.trim(),
                  suburb: formData.suburb.trim(),
                  city: formData.city.trim(),
                  postalCode: formData.postalCode.trim(),
                }
              : null,
          collectionPoint:
            formData.method === "collection" ? formData.collectionPoint : null,
          items: cartItems.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: item.qty,
            price: item.price,
            message: item.message || "",
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to save order");
        return;
      }

      alert(`Order saved successfully. Order number: ${data.orderId}. Payment is not connected yet.`);

      setCartItems([]);
      setCartOpen(false);
      setCheckoutStep("details");
      setView("home");

      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        contact: "",
        method: "",
        addressLine1: "",
        addressLine2: "",
        suburb: "",
        city: "",
        postalCode: "",
        collectionPoint: "Select collection point",
      });
    } catch (error) {
      console.error(error);
      alert("Something went wrong while saving the order");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-stone-900 flex flex-col font-sans selection:bg-stone-200">
      <div className="bg-stone-900 text-white text-[9px] uppercase tracking-[0.5em] py-3 text-center font-bold px-4">
        {BRAND.announcement}
      </div>

      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-stone-100">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <button onClick={goHome} className="flex items-center">
              <ElthLogo />
            </button>
            <nav className="hidden lg:flex items-center gap-10">
              <button
                onClick={goHome}
                className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                  view === "home"
                    ? "text-stone-900"
                    : "text-stone-400 hover:text-stone-900"
                }`}
              >
                Collections
              </button>

              <button
                onClick={openBespoke}
                className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-colors ${
                  view === "bespoke"
                    ? "text-stone-900"
                    : "text-stone-400 hover:text-stone-900"
                }`}
              >
                Bespoke Services
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <button className="hidden sm:flex items-center gap-2 text-stone-400 hover:text-stone-900">
              <Search className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                Search
              </span>
            </button>
            <button
              onClick={() => setCartOpen(true)}
              className="group relative flex items-center gap-3 bg-stone-900 text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-stone-800 transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Bag ({cartItems.length})</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {view === "home" && (
          <section className="py-20">
            <div className="mx-auto max-w-7xl px-6">
              <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
                {COLLECTIONS.map((c) => (
                  <button
                    key={c.title}
                    onClick={() => openCollection(c.title)}
                    className="group text-left"
                  >
                    <PlaceholderImage label={c.title} height="h-[450px]" />
                    <div className="mt-6 border-t border-stone-100 pt-4 flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-serif italic mb-1 tracking-tight">
                          {c.title}
                        </h3>
                        <p className="text-sm text-stone-400">{c.subtitle}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:translate-x-1 transition-transform mt-2" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {view === "collection" && selectedCollection && (
          <section className="py-20">
            <div className="mx-auto max-w-7xl px-6">
              <div className="grid lg:grid-cols-2 gap-20">
                <div>
                  <button
                    onClick={goHome}
                    className="flex items-center gap-4 text-stone-400 mb-8 hover:text-stone-900 transition-colors text-[10px] font-bold uppercase tracking-[0.3em]"
                  >
                    <ArrowLeft className="w-3 h-3" /> Back to Collective
                  </button>
                  <PlaceholderImage label={selectedCollection} height="h-[600px]" />
                </div>
                <div className="flex flex-col justify-center">
                  <h1 className="text-5xl font-serif italic mb-6 tracking-tight lowercase">
                    {selectedCollection}
                  </h1>
                  <p className="text-stone-500 font-light mb-8 leading-relaxed max-w-md">
                    {
                      COLLECTIONS.find((c) => c.title === selectedCollection)
                        ?.description
                    }
                  </p>
                  <p className="text-2xl font-light mb-8 text-stone-400 italic">
                    Starting from{" "}
                    {manualFormatZAR(
                      PRODUCTS.find((p) => p.category === selectedCollection)?.price
                    )}
                  </p>

                  <div className="bg-white p-8 border border-stone-100 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                      <Gift className="w-3.5 h-3.5 text-stone-300" />
                      <label className="block text-[10px] font-bold uppercase tracking-[0.4em] text-stone-400">
                        Add a Heartfelt Note
                      </label>
                    </div>
                    <input
                      className="w-full border-b border-stone-200 py-3 mb-8 focus:outline-none focus:border-stone-900 italic transition-all"
                      maxLength={20}
                      value={selectedMessage}
                      onChange={(e) => setSelectedMessage(e.target.value)}
                      placeholder="Optional (Max 20 characters)"
                    />
                    <button
                      onClick={() =>
                        addToCart(
                          PRODUCTS.find((p) => p.category === selectedCollection),
                          selectedMessage
                        )
                      }
                      className="w-full bg-stone-900 text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-stone-800 transition-all shadow-lg"
                    >
                      Add to Shopping Bag
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === "bespoke" && (
          <section className="py-20 bg-stone-50/50">
            <div className="mx-auto max-w-6xl px-6">
              <div className="text-center mb-20">
                <div className="inline-block bg-stone-900 text-white p-4 rounded-full mb-8">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h1 className="text-6xl font-serif italic mb-6 tracking-tight">
                  Bespoke Gifting
                </h1>
                <p className="text-stone-500 font-light text-lg max-w-2xl mx-auto leading-relaxed">
                  Beyond our curated collections, we offer a high-touch service for
                  those seeking a one-of-a-kind gifting experience. From corporate
                  volumes to intimate, personal gestures.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 mb-20">
                <div className="bg-white p-10 border border-stone-100 text-center flex flex-col items-center group hover:shadow-xl transition-all rounded-2xl">
                  <Briefcase className="w-8 h-8 text-stone-200 mb-6 group-hover:text-stone-900 transition-colors" />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-4">
                    Corporate Volume
                  </h3>
                  <p className="text-[13px] text-stone-400 leading-relaxed font-medium">
                    Elevated maternity leave, staff gifts and baby welcome gifts for
                    your team members, branded with your corporate identity.
                  </p>
                </div>

                <div className="bg-white p-10 border border-stone-100 text-center flex flex-col items-center group hover:shadow-xl transition-all md:scale-105 md:z-10 shadow-lg ring-1 ring-stone-100 rounded-2xl">
                  <Feather className="w-8 h-8 text-stone-900 mb-6" />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-4">
                    Individual Custom
                  </h3>
                  <p className="text-[13px] text-stone-600 leading-relaxed font-medium mb-8">
                    Fully tailored curations for all life stages. We source specific
                    artisanal goods to match your unique vision.
                  </p>
                  <div className="grid grid-cols-1 gap-5 w-full text-left">
                    <div className="flex items-center gap-3">
                      <HeartPulse className="w-4 h-4 text-stone-300" />
                      <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                        Get Well Soon
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Flower className="w-4 h-4 text-stone-300" />
                      <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                        The First Bloom
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <GraduationCap className="w-4 h-4 text-stone-900" />
                      <span className="text-[10px] uppercase tracking-widest text-stone-900 font-bold">
                        Matric Graduation
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Star className="w-4 h-4 text-stone-900" />
                      <span className="text-[10px] uppercase tracking-widest text-stone-900 font-bold">
                        Teen
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-10 border border-stone-100 text-center flex flex-col items-center group hover:shadow-xl transition-all rounded-2xl">
                  <Users className="w-8 h-8 text-stone-200 mb-6 group-hover:text-stone-900 transition-colors" />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-4">
                    Event Favours
                  </h3>
                  <p className="text-[13px] text-stone-400 leading-relaxed font-medium">
                    Miniature curations, and luxury guest favors for intimate
                    celebrations like weddings and engagement parties.
                  </p>
                </div>
              </div>

              <div className="bg-stone-900 text-white p-12 md:p-20 flex flex-col items-center text-center rounded-3xl">
                <h2 className="text-3xl font-serif italic mb-6">
                  Let's create something intentional.
                </h2>
                <p className="text-stone-400 text-sm max-w-md mb-10 leading-relaxed">
                  Tailored specifically to your event or corporate needs. We source
                  with care.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href={`https://wa.me/${BRAND.whatsapp}`}
                    className="bg-white text-stone-900 px-10 py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-stone-100 transition-all flex items-center gap-3 rounded-2xl"
                  >
                    <WhatsAppIcon className="w-4 h-4 text-[#25D366]" /> Chat on
                    WhatsApp
                  </a>
                  <button className="border border-stone-700 text-stone-400 px-10 py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:text-white hover:border-white transition-all rounded-2xl">
                    Email Inquiry
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === "checkout" && (
          <section className="py-20">
            <div className="mx-auto max-w-5xl px-6">
              <button
                onClick={goHome}
                className="flex items-center gap-4 text-stone-400 mb-12 hover:text-stone-900 transition-colors text-[10px] font-bold uppercase tracking-[0.3em]"
              >
                <ArrowLeft className="w-3 h-3" /> Return to Shop
              </button>

              <div className="mb-10">
                <h2 className="text-4xl font-serif italic mb-4">Checkout</h2>
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em]">
                  <div
                    className={`px-4 py-2 rounded-full border ${
                      checkoutStep === "details"
                        ? "border-stone-900 text-stone-900"
                        : "border-stone-200 text-stone-400"
                    }`}
                  >
                    1. Customer Details
                  </div>
                  <div
                    className={`px-4 py-2 rounded-full border ${
                      checkoutStep === "payment"
                        ? "border-stone-900 text-stone-900"
                        : "border-stone-200 text-stone-400"
                    }`}
                  >
                    2. Payment Summary
                  </div>
                </div>
              </div>

              {checkoutStep === "details" && (
                <div className="grid md:grid-cols-5 gap-16">
                  <div className="md:col-span-3 space-y-10">
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-stone-900 mb-8 pb-2 border-b">
                        Customer Details
                      </h3>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                            First Name *
                          </label>
                          <input
                            type="text"
                            className="w-full border-b border-stone-200 py-2 focus:outline-none"
                            value={formData.firstName}
                            onChange={(e) =>
                              setFormData({ ...formData, firstName: e.target.value })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                            Surname *
                          </label>
                          <input
                            type="text"
                            className="w-full border-b border-stone-200 py-2 focus:outline-none"
                            value={formData.lastName}
                            onChange={(e) =>
                              setFormData({ ...formData, lastName: e.target.value })
                            }
                          />
                        </div>

                        <div className="col-span-2 space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                            Email Address *
                          </label>
                          <input
                            type="email"
                            className="w-full border-b border-stone-200 py-2 focus:outline-none"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({ ...formData, email: e.target.value })
                            }
                          />
                        </div>

                        <div className="col-span-2 space-y-2">
                          <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                            Contact Number *
                          </label>
                          <input
                            type="tel"
                            className="w-full border-b border-stone-200 py-2 focus:outline-none"
                            value={formData.contact}
                            onChange={(e) =>
                              setFormData({ ...formData, contact: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-stone-900 mb-8 pb-2 border-b">
                        Delivery or Collection
                      </h3>

                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              method: "delivery",
                              collectionPoint: "Select collection point",
                            })
                          }
                          className={`border p-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${
                            formData.method === "delivery"
                              ? "border-stone-900 text-stone-900 bg-stone-50"
                              : "border-stone-200 text-stone-400"
                          }`}
                        >
                          Delivery
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setFormData({
                              ...formData,
                              method: "collection",
                              addressLine1: "",
                              addressLine2: "",
                              suburb: "",
                              city: "",
                              postalCode: "",
                            })
                          }
                          className={`border p-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${
                            formData.method === "collection"
                              ? "border-stone-900 text-stone-900 bg-stone-50"
                              : "border-stone-200 text-stone-400"
                          }`}
                        >
                          Collection
                        </button>
                      </div>

                      {formData.method === "delivery" && (
                        <div className="grid grid-cols-2 gap-6">
                          <div className="col-span-2 space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                              Address Line 1 *
                            </label>
                            <input
                              type="text"
                              className="w-full border-b border-stone-200 py-2 focus:outline-none"
                              value={formData.addressLine1}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  addressLine1: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="col-span-2 space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                              Address Line 2
                            </label>
                            <input
                              type="text"
                              className="w-full border-b border-stone-200 py-2 focus:outline-none"
                              value={formData.addressLine2}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  addressLine2: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                              Suburb *
                            </label>
                            <input
                              type="text"
                              className="w-full border-b border-stone-200 py-2 focus:outline-none"
                              value={formData.suburb}
                              onChange={(e) =>
                                setFormData({ ...formData, suburb: e.target.value })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                              City *
                            </label>
                            <input
                              type="text"
                              className="w-full border-b border-stone-200 py-2 focus:outline-none"
                              value={formData.city}
                              onChange={(e) =>
                                setFormData({ ...formData, city: e.target.value })
                              }
                            />
                          </div>

                          <div className="col-span-2 space-y-2">
                            <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                              Postal Code *
                            </label>
                            <input
                              type="text"
                              className="w-full border-b border-stone-200 py-2 focus:outline-none"
                              value={formData.postalCode}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  postalCode: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      )}

                      {formData.method === "collection" && (
                        <div className="space-y-3">
                          <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">
                            Collection Point *
                          </label>
                          <select
                            className="w-full border-b border-stone-200 py-3 focus:outline-none bg-transparent"
                            value={formData.collectionPoint}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                collectionPoint: e.target.value,
                              })
                            }
                          >
                            {COLLECTION_POINTS.map((point) => (
                              <option key={point} value={point}>
                                {point}
                              </option>
                            ))}
                          </select>
                          <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                            Collection points will be added at a future date
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={goToPaymentStep}
                      disabled={!isDetailsValid}
                      className={`w-full py-5 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-md rounded-2xl ${
                        isDetailsValid
                          ? "bg-stone-900 text-white hover:bg-stone-800"
                          : "bg-stone-200 text-stone-400 cursor-not-allowed"
                      }`}
                    >
                      Payment <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="md:col-span-2 space-y-8">
                    <div className="bg-stone-50 p-8 border border-stone-100 rounded-2xl">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-8 pb-4 border-b border-stone-200/60">
                        Summary
                      </h3>

                      <div className="space-y-6 mb-8">
                        {cartItems.map((item) => (
                          <div key={item.cartId} className="flex gap-4">
                            <div className="w-16 h-16 shrink-0 bg-white border border-stone-100 p-1">
                              <PlaceholderImage label={item.imageLabel} height="h-full" small />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="text-[11px] font-serif italic truncate text-stone-900">
                                  {item.name}
                                </h4>
                                <span className="text-[10px] font-bold text-stone-900">
                                  {manualFormatZAR(item.price)}
                                </span>
                              </div>
                              <p className="text-[9px] uppercase tracking-widest text-stone-400 font-medium">
                                Qty: {item.qty}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-stone-200 pt-6 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                            Items Total
                          </span>
                          <span className="text-[10px] font-bold text-stone-900">
                            {manualFormatZAR(itemsTotal)}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                            Delivery or Collection Fee
                          </span>
                          <span className="text-[10px] font-bold text-stone-900">
                            {manualFormatZAR(fulfilmentFee)}
                          </span>
                        </div>

                        <div className="flex justify-between items-end pt-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            Total
                          </span>
                          <span className="text-2xl font-light">
                            {manualFormatZAR(grandTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {checkoutStep === "payment" && (
                <div className="grid md:grid-cols-5 gap-16">
                  <div className="md:col-span-3 space-y-8">
                    <div className="bg-white p-8 border border-stone-100 rounded-2xl">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-6 pb-2 border-b">
                        Contact Details
                      </h3>
                      <div className="space-y-2 text-sm text-stone-700">
                        <p>{formData.firstName} {formData.lastName}</p>
                        <p>{formData.email}</p>
                        <p>{formData.contact}</p>
                      </div>
                    </div>

                    <div className="bg-white p-8 border border-stone-100 rounded-2xl">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-6 pb-2 border-b">
                        Delivery or Collection
                      </h3>

                      <div className="space-y-2 text-sm text-stone-700">
                        <p className="uppercase tracking-widest text-[10px] font-bold text-stone-400">
                          {formData.method}
                        </p>

                        {formData.method === "delivery" && (
                          <>
                            <p>{formData.addressLine1}</p>
                            {formData.addressLine2 ? <p>{formData.addressLine2}</p> : null}
                            <p>{formData.suburb}</p>
                            <p>{formData.city}</p>
                            <p>{formData.postalCode}</p>
                          </>
                        )}

                        {formData.method === "collection" && (
                          <p>{formData.collectionPoint}</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-8 border border-stone-100 rounded-2xl">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-6 pb-2 border-b">
                        Payment Method
                      </h3>

                      <div className="border border-stone-200 p-6 flex items-center justify-between rounded-sm">
                        <div className="flex items-center gap-4">
                          <div className="bg-stone-900 text-white p-2 rounded">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest">
                              Order Save
                            </p>
                            <p className="text-[10px] text-stone-400">
                              Payment not connected yet
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold italic text-stone-300 uppercase">
                          Pending
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setCheckoutStep("details")}
                        className="w-full border border-stone-200 py-5 text-[10px] font-bold uppercase tracking-[0.3em] rounded-2xl"
                      >
                        Back
                      </button>

                      <button
                        type="button"
                        onClick={handlePayfastCheckout}
                        disabled={checkoutLoading}
                        className={`w-full py-5 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-md rounded-2xl ${
                          checkoutLoading
                            ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                            : "bg-stone-900 text-white hover:bg-stone-800"
                        }`}
                      >
                        {checkoutLoading ? "Saving..." : "Save Order"}{" "}
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-8">
                    <div className="bg-stone-50 p-8 border border-stone-100 rounded-2xl">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-8 pb-4 border-b border-stone-200/60">
                        Payment Summary
                      </h3>

                      <div className="space-y-6 mb-8">
                        {cartItems.map((item) => (
                          <div key={item.cartId} className="flex gap-4">
                            <div className="w-16 h-16 shrink-0 bg-white border border-stone-100 p-1">
                              <PlaceholderImage label={item.imageLabel} height="h-full" small />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="text-[11px] font-serif italic truncate text-stone-900">
                                  {item.name}
                                </h4>
                                <span className="text-[10px] font-bold text-stone-900">
                                  {manualFormatZAR(item.price)}
                                </span>
                              </div>
                              <p className="text-[9px] uppercase tracking-widest text-stone-400 font-medium">
                                Qty: {item.qty}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-stone-200 pt-6 space-y-3">
                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                            Items Total
                          </span>
                          <span className="text-[10px] font-bold text-stone-900">
                            {manualFormatZAR(itemsTotal)}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                            {formData.method === "delivery" ? "Delivery Fee" : "Collection Fee"}
                          </span>
                          <span className="text-[10px] font-bold text-stone-900">
                            {manualFormatZAR(fulfilmentFee)}
                          </span>
                        </div>

                        <div className="flex justify-between items-end pt-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            Total
                          </span>
                          <span className="text-2xl font-light">
                            {manualFormatZAR(grandTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <footer className="bg-stone-50 border-t border-stone-100 pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="md:col-span-2">
              <ElthLogo size="large" />
              <div className="mt-8 flex gap-6">
                <button className="text-stone-400 hover:text-stone-900 transition-colors">
                  <Mail className="w-5 h-5" />
                </button>
                <a
                  href={`https://wa.me/${BRAND.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-400 hover:text-[#25D366] transition-colors"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-8">
                The Collection
              </h4>
              <ul className="space-y-4 text-[11px] uppercase tracking-widest text-stone-400 font-bold">
                {COLLECTIONS.map((c) => (
                  <li key={c.title}>
                    <button
                      onClick={() => openCollection(c.title)}
                      className="hover:text-stone-900 text-left"
                    >
                      {c.title}
                    </button>
                  </li>
                ))}
                <li>
                  <button onClick={openBespoke} className="hover:text-stone-900 text-left">
                    Bespoke Services
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.4em] mb-8">
                Inquiries
              </h4>
              <ul className="space-y-4 text-[11px] uppercase tracking-widest text-stone-400 font-bold">
                <li>
                  <a
                    href={`https://wa.me/${BRAND.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-stone-900 flex items-center gap-2"
                  >
                    WhatsApp Support <WhatsAppIcon className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  <button className="hover:text-stone-900 text-left">Shipping Policy</button>
                </li>
                <li>
                  <button className="hover:text-stone-900 text-left">
                    Returns and Exchanges
                  </button>
                </li>
                <li>
                  <button className="hover:text-stone-900 text-left">FAQ</button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-12 border-t border-stone-200/60 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[9px] uppercase tracking-[0.4em] text-stone-400 font-bold">
              © 2026 ELTH Collective. Elevated Curation.
            </p>
            <div className="flex gap-8 items-center">
              <div className="flex items-center gap-2 grayscale opacity-40">
                <Truck className="w-3 h-3" />
                <span className="text-[8px] font-bold uppercase tracking-widest">
                  Nationwide Delivery
                </span>
              </div>
              <div className="flex items-center gap-2 grayscale opacity-40">
                <Lock className="w-3 h-3" />
                <span className="text-[8px] font-bold uppercase tracking-widest">
                  Secure Payments
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <a
        href={`https://wa.me/${BRAND.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-8 right-8 z-40 bg-white text-stone-900 p-4 rounded-full shadow-2xl border border-stone-100 group hover:bg-stone-900 hover:text-white transition-all duration-300 flex items-center gap-3 overflow-hidden"
      >
        <span className="max-w-0 group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap text-[10px] font-bold uppercase tracking-widest">
          Chat with us
        </span>
        <WhatsAppIcon className="w-5 h-5 text-[#25D366] group-hover:text-white transition-colors" />
      </a>

      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
            <div className="p-10 border-b flex justify-between items-center">
              <h2 className="text-xs font-bold uppercase tracking-[0.5em]">
                Your Selection
              </h2>
              <button onClick={() => setCartOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-10">
              {cartItems.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center">
                  <ShoppingBag className="w-8 h-8 text-stone-100 mb-4" />
                  <p className="text-stone-400 text-[10px] uppercase tracking-[0.4em] font-bold italic">
                    Bag is Empty
                  </p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div
                    key={item.cartId}
                    className="flex flex-col border-b border-stone-100 pb-8 last:border-0"
                  >
                    <div className="flex justify-between items-start mb-4 gap-4">
                      <div className="flex gap-4">
                        <div className="w-16 h-16 shrink-0 border border-stone-100 p-1 bg-stone-50">
                          <PlaceholderImage label={item.imageLabel} height="h-full" small />
                        </div>
                        <div>
                          <h3 className="font-serif italic text-lg leading-tight lowercase">
                            {item.name}
                          </h3>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                            {manualFormatZAR(item.price)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.cartId)}
                        className="text-stone-300 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {item.message && (
                      <div className="bg-stone-50 p-4 border-l-2 border-stone-200 flex gap-3 items-start">
                        <Gift className="w-3 h-3 text-stone-300 mt-0.5" />
                        <span className="text-[11px] italic text-stone-600">
                          “{item.message}”
                        </span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            {cartItems.length > 0 && (
              <div className="p-10 border-t bg-white">
                <div className="flex justify-between mb-8">
                  <span className="text-xs font-bold uppercase tracking-widest text-stone-400">
                    Subtotal
                  </span>
                  <span className="text-xl font-light tracking-tighter">
                    {manualFormatZAR(itemsTotal)}
                  </span>
                </div>
                <button
                  onClick={moveToCheckout}
                  className="w-full bg-stone-900 text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-stone-800 shadow-xl transition-all rounded-2xl"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ${
          toast.open
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8 pointer-events-none"
        }`}
      >
        <div className="bg-stone-900 text-white px-8 py-4 text-[10px] font-bold uppercase tracking-[0.4em] shadow-2xl flex items-center gap-4 rounded-2xl">
          <Check className="w-4 h-4 text-stone-400" />
          {toast.text}
        </div>
      </div>
    </div>
  );
}