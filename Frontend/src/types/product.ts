export interface Categoria {
  idCat: number;
  nombre: string;
  descripcion: string;
}

export interface SubCategoria {
  idSubCat: number;
  nombre: string;
  idCat: number;
}

export interface Producto {
  idProd?: number;
  codProd?: string;
  nombre: string;      
  categoria: string;       
  subcategoria: string;   
  marca: string;
  unidad: string; 
  precio: string;        
  stock: number;       
  estado: "Disponible" | "Critico" | "Inactivo";
  imgProd?: string;
  idSubCat: number;
}

export interface ProductoFormData {
  codProd?: string;
  nomProd: string;
  marca?: string;
  unidad?: string;
  categoria: string;
  subcategoria: string;
  precioProd: number;
  cantProd: number;
  estado?: "Disponible" | "Critico" | "Inactivo";
  imagen?: File | null;
}
