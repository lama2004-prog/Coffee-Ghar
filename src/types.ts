export type Role = 'customer' | 'staff' | 'manager';

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: number;
  user_id: number;
  items: CartItem[];
  total_price: number;
  status: string;
  payment_method: string;
  created_at: string;
  customer_name?: string;
}

export interface Reservation {
  id: number;
  user_id: number;
  customer_name: string;
  date: string;
  time: string;
  event_category: string;
  table_number: number;
  status: string;
}
