/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core'
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { debounceTime, Subscription } from 'rxjs'

@Component({
  standalone: true,
  selector: 'auth-edit-password',
  templateUrl: './edit-password.component.html',
  styleUrls: ['./edit-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule, NzIconModule, MatIconModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AuthEditPasswordComponent),
      multi: true,
    },
  ],
})
export class AuthEditPasswordComponent implements OnInit, OnDestroy, ControlValueAccessor {
  private subscription?: Subscription
  protected valid = false
  protected passwordRequired = true
  form: FormGroup = this.formBuilder.group(
    {
      password: [''],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    },
    { validators: this.passwordMatchingValidator }
  )
  passwordVisible = false
  newPasswordVisible = false
  confirmPasswordVisible = false

  @Input() username!: string

  @Input()
  set hasPassword(value: boolean) {
    this.passwordRequired = value
    if (value) {
      this.form.get('password')?.setValidators(Validators.required)
    } else {
      this.form.get('password')?.clearValidators()
    }
    this.form.get('password')?.updateValueAndValidity()
  }

  @Output() submitted = new EventEmitter<[string, string]>()

  get canUpdate(): boolean {
    return this.valid
  }

  get isValid(): boolean {
    return this.valid
  }

  constructor(private readonly formBuilder: FormBuilder, private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.subscription = this.form.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      const { password, newPassword, confirmPassword } = this.form.value
      this.valid =
        (!this.passwordRequired || password.trim()) &&
        newPassword.trim() &&
        newPassword.trim() === confirmPassword.trim() &&
        AuthEditPasswordComponent.isValidPasswordFormat(newPassword.trim())

      this.onChange([password?.trim() || '', newPassword.trim()])
      this.onTouched()
      this.changeDetectorRef.markForCheck()
    })
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe()
  }

  // ControlValueAccessor methods

  onChange: (value: any) => void = () => {
    //
  }
  onTouched: () => void = () => {
    //
  }

  writeValue(value: any): void {
    if (value) {
      const [password, newPassword] = Array.isArray(value) ? value : ['', '']
      this.form.setValue(
        {
          password,
          newPassword,
          confirmPassword: newPassword,
        },
        { emitEvent: false }
      )
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.form.disable() : this.form.enable()
  }

  passwordMatchingValidator(control: AbstractControl) {
    const newPassword = control.get('newPassword')?.value || ''
    const confirmPassword = control.get('confirmPassword')?.value || ''

    if (!AuthEditPasswordComponent.isValidPasswordFormat(newPassword)) {
      control.get('newPassword')?.setErrors({ invalidPasswordFormat: true })
      return { invalidPasswordFormat: true }
    }

    if (newPassword !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ notMatching: true })
      return { notMatching: true }
    }

    control.get('confirmPassword')?.setErrors(null)
    return null
  }

  private static isValidPasswordFormat(password: string): boolean {
    const passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?([^\w\s]|_)).{12,}$/
    return passwordRegex.test(password)
  }

  is12CharactersLong(): boolean {
    return this.form.get('newPassword')?.value.length >= 12
  }

  hasUpperCaseLetter(): boolean {
    return /[A-Z]/.test(this.form.get('newPassword')?.value)
  }

  hasLowerCaseLetter(): boolean {
    return /[a-z]/.test(this.form.get('newPassword')?.value)
  }

  hasNumber(): boolean {
    return /[0-9]/.test(this.form.get('newPassword')?.value)
  }

  hasSpecialCharacter(): boolean {
    return /[^\w\s]|_/.test(this.form.get('newPassword')?.value)
  }
}
