export interface Base {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface DBProduct extends Base {
  name: string;
  price: number;
  quantity: number;
}

export interface DBOrder extends Base {
  total: number;
}

export interface DBOrderItem extends Base {
  name: string;
  price: number;
  quantity: number;
  orderId: string;
}
