import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are placeholder values (invalid)
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  if (typeof url !== "string") return false;
  // Must be a valid Supabase URL
  // Format: https://[project-ref].supabase.co
  if (!url.startsWith("https://")) return false;
  if (!url.includes("supabase.co")) return false;
  if (url.length < 30) return false; // Real URLs are longer
  // Check if it looks like a real project ref (alphanumeric + hyphens)
  const projectRef = url.split("//")[1]?.split(".")[0];
  if (!projectRef || projectRef.length < 15) return false;
  return true;
};

const isValidKey = (key: string | undefined): boolean => {
  if (!key) return false;
  if (typeof key !== "string") return false;
  if (key === "your-anon-key") return false;
  // Supabase anon keys are JWT tokens, much longer than 10 chars
  if (key.length < 30) return false;
  // Should contain JWT structure (parts separated by dots)
  if (!key.includes(".")) return false;
  const parts = key.split(".");
  if (parts.length !== 3) return false; // JWT has 3 parts
  return true;
};

// Validate environment variables
const urlValid = isValidUrl(supabaseUrl);
const keyValid = isValidKey(supabaseAnonKey);

if (!urlValid) {
  console.warn(
    "⚠️ Supabase URL not configured or invalid. All features will use local defaults.",
  );
  console.log(
    "To enable Supabase, set VITE_SUPABASE_URL=https://[project].supabase.co",
  );
}

if (!keyValid) {
  console.warn(
    "⚠️ Supabase anon key not configured or invalid. All features will use local defaults.",
  );
  console.log(
    "To enable Supabase, set VITE_SUPABASE_ANON_KEY=<your-valid-jwt-key>",
  );
}

// Create client only if we have BOTH valid credentials
let supabaseClient: any = null;
if (urlValid && keyValid) {
  try {
    supabaseClient = createClient(supabaseUrl!, supabaseAnonKey!);
    console.log("✅ Supabase initialized successfully");
  } catch (error) {
    console.error(
      "❌ Failed to initialize Supabase client:",
      error instanceof Error ? error.message : String(error),
    );
    supabaseClient = null;
  }
}

export const supabase = supabaseClient;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabase !== null;
};

// Wrapper function to safely execute Supabase operations
// Returns null on failure instead of throwing
export async function safeSupabaseCall<T>(
  operation: () => Promise<T>,
  defaultValue: T,
): Promise<T> {
  try {
    if (!supabase) {
      return defaultValue;
    }
    return await operation();
  } catch (error) {
    console.warn("Supabase operation failed:", error);
    return defaultValue;
  }
}

// Database Types
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  niche?: string;
  primary_platform?: string;
  follower_count?: string;
  goals?: string[];
  quiz_data?: any;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  original_price: number;
  description: string;
  features: string[];
  is_enabled: boolean;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface Purchase {
  id: string;
  user_id: string;
  product_id: string;
  amount: number;
  discount_amount: number;
  promo_code?: string;
  payment_id?: string;
  payment_status: "pending" | "success" | "failed" | "refunded";
  payment_method: string;
  customer_info: any;
  payu_response?: any;
  created_at: string;
  updated_at: string;
}

export interface Download {
  id: string;
  purchase_id: string;
  product_id: string;
  download_id: string;
  downloaded_at: string;
  user_id: string;
}

// Auth Helper Functions
export const authHelpers = {
  async signUp(email: string, password: string, userData: any) {
    if (!supabase) {
      return { data: null, error: { message: "Supabase not configured" } };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    return { data, error };
  },

  async signIn(email: string, password: string) {
    if (!supabase) {
      return { data: null, error: { message: "Supabase not configured" } };
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signOut() {
    if (!supabase) {
      return { error: { message: "Supabase not configured" } };
    }
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getCurrentUser() {
    if (!supabase) {
      return null;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  },
};

// Database Helper Functions
export const dbHelpers = {
  // Users
  async createUser(userData: Partial<User>) {
    if (!supabase) {
      return { data: null, error: { message: "Supabase not configured" } };
    }
    const { data, error } = await supabase
      .from("users")
      .insert([userData])
      .select()
      .single();
    return { data, error };
  },

  async getUser(id: string) {
    if (!supabase) {
      return { data: null, error: { message: "Supabase not configured" } };
    }
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  async updateUser(id: string, updates: Partial<User>) {
    if (!supabase) {
      return { data: null, error: { message: "Supabase not configured" } };
    }
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  // Products
  async getProducts() {
    const mapLocal = (configs: any[]) =>
      configs.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        original_price: p.originalPrice,
        description: p.description,
        features: p.features,
        is_enabled: p.isEnabled,
        category: p.category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

    // If Supabase is not configured, return local configs
    if (!supabase) {
      const { productConfigs } = await import("./products");
      return { data: mapLocal(productConfigs), error: null };
    }

    // Try Supabase first with timeout
    try {
      // Add a timeout to prevent hanging indefinitely
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Supabase request timeout")),
          5000, // 5 second timeout
        ),
      );

      const supabasePromise = supabase
        .from("products")
        .select("*")
        .eq("is_enabled", true)
        .order("created_at", { ascending: false });

      const { data, error } = (await Promise.race([
        supabasePromise,
        timeoutPromise,
      ])) as any;

      // Fallback if error or empty
      if (error || !data || data.length === 0) {
        console.warn(
          "Supabase products unavailable, falling back to local product configs",
          error || "no data",
        );
        const { productConfigs } = await import("./products");
        return { data: mapLocal(productConfigs), error: null };
      }

      return { data, error: null };
    } catch (e) {
      console.warn(
        "Error fetching Supabase products (using local configs):",
        e instanceof Error ? e.message : String(e),
      );
      const { productConfigs } = await import("./products");
      return { data: mapLocal(productConfigs), error: null };
    }
  },

  async getProduct(id: string) {
    if (!supabase) {
      const { productConfigs } = await import("./products");
      const product = productConfigs.find((p) => p.id === id);
      if (product) {
        return {
          data: {
            id: product.id,
            name: product.name,
            price: product.price,
            original_price: product.originalPrice,
            description: product.description,
            features: product.features,
            is_enabled: product.isEnabled,
            category: product.category,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          error: null,
        };
      }
      return { data: null, error: { message: "Product not found" } };
    }
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    return { data, error };
  },

  // Purchases
  async createPurchase(purchaseData: Partial<Purchase>) {
    if (!supabase) {
      return { data: null, error: { message: "Supabase not configured" } };
    }
    const { data, error } = await supabase
      .from("purchases")
      .insert([purchaseData])
      .select()
      .single();
    return { data, error };
  },

  async updatePurchase(id: string, updates: Partial<Purchase>) {
    if (!supabase) {
      return { data: null, error: { message: "Supabase not configured" } };
    }
    const { data, error } = await supabase
      .from("purchases")
      .update(updates)
      .eq("id", id)
      .select()
      .single();
    return { data, error };
  },

  async getUserPurchases(userId: string) {
    if (!supabase) {
      return { data: [], error: null };
    }
    const { data, error } = await supabase
      .from("purchases")
      .select(
        `
        *,
        products (*)
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    return { data, error };
  },

  async getPurchaseByPaymentId(paymentId: string) {
    if (!supabase) {
      return { data: null, error: { message: "Supabase not configured" } };
    }
    const { data, error } = await supabase
      .from("purchases")
      .select("*")
      .eq("payment_id", paymentId)
      .single();
    return { data, error };
  },

  // Downloads
  async recordDownload(downloadData: Partial<Download>) {
    if (!supabase) {
      return { data: null, error: { message: "Supabase not configured" } };
    }
    const { data, error } = await supabase
      .from("downloads")
      .insert([downloadData])
      .select()
      .single();
    return { data, error };
  },

  async getUserDownloads(userId: string) {
    if (!supabase) {
      return { data: [], error: null };
    }
    const { data, error } = await supabase
      .from("downloads")
      .select("*")
      .eq("user_id", userId)
      .order("downloaded_at", { ascending: false });
    return { data, error };
  },
};
