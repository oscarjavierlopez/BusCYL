import { DestroyRef, WritableSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';

export function resetearErroresAlModificarFormulario(formulario: FormGroup, mensajeError: WritableSignal<string | null>, destroyRef: DestroyRef): void {
  formulario.valueChanges.pipe(takeUntilDestroyed(destroyRef)).subscribe(() => {
    mensajeError.set(null);
    Object.values(formulario.controls).forEach((control) => control.markAsUntouched());
    formulario.markAsUntouched();
  });
}
