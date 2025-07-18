export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export interface Table {
  id: number;
  isOccupied: boolean;
  items: MenuItem[];
  total: number;
}