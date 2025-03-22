import Cookies from 'js-cookie';
import { AuthInterface } from '../interfaces/authInteface';

export const COOKIE_NAME = 'auth_token';
export const USER_COOKIE_NAME = 'user';

export const cookies = {
  set: (token: string, user: AuthInterface) => {

    Cookies.set(COOKIE_NAME, token, {
      expires: 1,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
    Cookies.set(USER_COOKIE_NAME, JSON.stringify(user), {
      expires: 1,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  },
  get: () => ({
    token: Cookies.get(COOKIE_NAME),
    user: Cookies.get(USER_COOKIE_NAME) ? JSON.parse(Cookies.get(USER_COOKIE_NAME) as string) : null,
  }),
  remove: () => {
    Cookies.remove(COOKIE_NAME)
    Cookies.remove(USER_COOKIE_NAME)
  }
}
