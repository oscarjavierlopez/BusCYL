import { Component, inject, OnInit, signal } from '@angular/core';
import { EmpresasService } from '../../../../services/empresas.service';
import { EmpresasPaginadas } from '../../../../models/empresas-paginadas';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toast, NgxSonnerToaster } from 'ngx-sonner';

declare const Swal: {
  fire: (options: {
    title: string;
    icon: 'question';
    showCancelButton: boolean;
    confirmButtonText: string;
    cancelButtonText: string;
    confirmButtonColor: string;
  }) => Promise<{ isConfirmed: boolean }>;
};

@Component({
  selector: 'app-empresas',
  imports: [RouterLink, NgxSonnerToaster],
  templateUrl: './empresas.html',
  styleUrl: './empresas.css',
})
export class Empresas implements OnInit {
  private empresasService = inject(EmpresasService);
  empresasPaginadas = signal<EmpresasPaginadas | null>(null);
  nombre = signal<string>('');
  activoValue = signal<boolean>(true);
  pagina = signal<number>(1);
  private temporizadorBusqueda: ReturnType<typeof setTimeout> | null = null;
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private obtenerEmpresas(): void {
    this.empresasService.obtenerEmpresasPaginadas(this.pagina(), this.nombre(), this.activoValue()).subscribe({
      next: (response) => {
        this.empresasPaginadas.set(response);
      },
      error: (err) => {
        console.error('Error al obtener datos:', err);
      }
    });
  }

  modificarQueryParams(): void {
    let queryParams: { activo?: string, nombre?: string, pagina?: number } = {};

    if (!this.activoValue()) {
      queryParams = { ...queryParams, activo: "false" };
    }

    if (/.*\S.*/.test(this.nombre())) {
      queryParams = { ...queryParams, nombre: this.nombre() }
    }

    if (this.pagina() != 1) {
      queryParams = { ...queryParams, pagina: this.pagina() }
    }

    this.router.navigate([], {
      queryParams: queryParams,
      relativeTo: this.route
    });

  }

  leerQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params["pagina"]) {
        this.pagina.set(Number(params["pagina"]));
      }

      if (params["nombre"]) {
        this.nombre.set(params["nombre"]);
      }

      if (params["activo"]) {
        this.activoValue.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.leerQueryParams();
    this.obtenerEmpresas();
  }

  seleccionarEstado(activo: boolean): void {
    this.activoValue.set(activo);
    this.pagina.set(1);
    this.modificarQueryParams();
    this.obtenerEmpresas();
  }

  manejarBusqueda(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (this.temporizadorBusqueda) {
      clearTimeout(this.temporizadorBusqueda);
    }

    this.temporizadorBusqueda = setTimeout(() => {
      this.nombre.set(input.value);
      this.pagina.set(1);
      this.modificarQueryParams();
      this.obtenerEmpresas();
    }, 300);
  }

  cambiarPagina(pagina: number): void {
    this.pagina.set(pagina);
    this.modificarQueryParams()
    this.obtenerEmpresas();
  }

  private confirmarCambioEstado(mensaje: string, colorConfirmacion: string, accion: () => void): void {
    Swal.fire({
      title: mensaje,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: colorConfirmacion,
    }).then((result) => {
      if (result.isConfirmed) {
        accion();
      }
    });
  }

  private eliminarEmpresa(id: number): void {
    this.empresasPaginadas.update((paginaEmpresas) => {
      if (!paginaEmpresas) {
        return null;
      }

      return {
        ...paginaEmpresas,
        empresas: paginaEmpresas.empresas.filter((e) => e.id !== id),
      };
    });
  }

  desactivarEmpresa(id: number, nombre: string): void {
      this.confirmarCambioEstado(`¿Desea desactivar la empresa ${nombre}?`, '#a6001c', () => {
        this.empresasService.desactivarEmpresa(id).subscribe({
          next: () => {
            this.eliminarEmpresa(id);
            toast.info(`La empresa ${nombre} ha sido desactivada`)
          },
        });
      });
    }

    activarEmpresa(id: number, nombre: string): void {
      this.confirmarCambioEstado(`¿Desea activar la empresa ${nombre}?`, '#2f6b45', () => {
        this.empresasService.activarEmpresa(id).subscribe({
          next: () => {
            this.eliminarEmpresa(id);
            toast.info(`La empresa ${nombre} ha sido activada`)
          },
        });
      });
    }



}
