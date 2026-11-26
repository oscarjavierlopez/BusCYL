export interface Asiento {
    id?: number;
    numero: number;
    tipo: string;
    activo: boolean;
    reservado?: boolean;
}
