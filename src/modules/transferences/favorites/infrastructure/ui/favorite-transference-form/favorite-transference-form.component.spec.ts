import { ComponentFixture, TestBed } from "@angular/core/testing"
import { FavoriteTransferenceFormComponent } from "./favorite-transference-form.component"
import { SaveFavoriteTransferenceUseCase } from "../../../application/save-favorite-transference.use-case";
import { DuplicatedAliasException } from "../../../domain/exceptions/duplicated-alias.exception";

describe('FavoriteTransferenceFormComponent', () => {
  let fixture: ComponentFixture<FavoriteTransferenceFormComponent>;
  let element: HTMLElement;
  const execute = vi.fn();

  beforeEach(async () => {
    execute.mockReset().mockResolvedValue(undefined);

    await TestBed.configureTestingModule({
      imports: [FavoriteTransferenceFormComponent],
      providers: [{ provide: SaveFavoriteTransferenceUseCase, useValue: { execute } }]
    }).compileComponents();

    fixture = TestBed.createComponent(FavoriteTransferenceFormComponent);
    element = fixture.nativeElement;
    await fixture.whenStable();
  })

  const input = (id: string) => element.querySelector<HTMLInputElement>(`#${id}`)!;
  const submitButton = () => element.querySelector<HTMLButtonElement>('button[type="submit"]')!;

  async function type(id: string, value: string) {
    input(id).value = value;
    input(id).dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
  }

  async function fillValidForm() {
    await type('alias', 'Mamá');
    await type('amount', '100');
    await type('destinationAccount', '1234567890');
  }

  async function submit() {
    submitButton().click();
    await fixture.whenStable();
  }

  it('deshabilita el botón mientras el formulario es inválido', () => {
    expect(submitButton().disabled).toBe(true);
  });

  it('muestra el mensaje del dominio cuando el alias es muy largo', async () => {
    await type('alias', 'a'.repeat(31));

    expect(element.textContent).toContain('El alias debe tener máximo 30 caracteres.');
  });

  it('no muestra errores si el usuario no ha interactuado', () => {
    expect(element.querySelectorAll('p').length).toBe(0);
  });

  it('guarda la transferencia, limpia el formulario y muestra confirmación', async () => {
    await fillValidForm();
    expect(submitButton().disabled).toBe(false);

    await submit();

    expect(execute).toHaveBeenCalledWith({
      alias: 'Mamá',
      amount: '100',
      destinationAccount: '1234567890',
    });
    expect(element.textContent).toContain('Transferencia guardada');
    expect(input('alias').value).toBe('');
  });

  it('muestra error en el alias cuando ya existe', async () => {
    execute.mockRejectedValue(new DuplicatedAliasException());
    await fillValidForm();

    await submit();

    expect(element.textContent).toContain('Ya existe una transferencia favorita con este alias.');
    expect(element.textContent).not.toContain('Transferencia guardada');
  });
})