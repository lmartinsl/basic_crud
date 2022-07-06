import { Department } from './department';

export interface Product {
  _id: string;
  name: string;
  departments: Department[] | string[];
  stock: number;
  price: number;
}
