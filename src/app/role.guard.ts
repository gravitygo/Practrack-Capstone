import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

export function RoleGuardFactory(auth: Auth, router: Router): CanActivateFn {
  return (next, state) => {
    const expectedRole = next.data['expectedRole'];
    if (auth.currentUser === null) {
      router.navigate(['/login']);
      return Promise.resolve(false);
    }

    return auth.currentUser?.getIdTokenResult(true).then((token) => {
      if (token.claims['role'] === expectedRole) {
        return true;
      } else {
        router.navigate(['/home']);
        return false;
      }
    });
  };
}
