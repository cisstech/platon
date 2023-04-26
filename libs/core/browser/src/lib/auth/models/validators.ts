import { AbstractControl } from "@angular/forms";

export function passwordMatches() {
  const controlName = 'password';
  const matchingControlName = 'confirmPassword';
  return (controls: AbstractControl) => {
    const control = controls.get(controlName);
    const matchingControl = controls.get(matchingControlName);
    if (!control || !matchingControl) {
      return null;
    }

    if (matchingControl.errors && !matchingControl.errors["mustMatch"]) {
      // return if another validator has already found an error on the matchingControl
      return null;
    }

    // set error on matchingControl if validation fails
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null);
    }
    return null;
  }
}
