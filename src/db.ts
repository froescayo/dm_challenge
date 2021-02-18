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
