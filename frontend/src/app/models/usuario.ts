export interface Usuario {
    id: number;
    email: string;
    rol: string | number;
    nombre: string;
    apellidos: string;
    dni: string;
    telefono: string;
    fechaNacimiento: string;
    empresa: string | null | number;
    activo: boolean;
}
