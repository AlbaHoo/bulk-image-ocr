import { login, signup } from './parse-server';
import { IUser, IUserService } from './user.interface';

export class UserService implements IUserService {
  async login(email: string, password: string): Promise<IUser> {
    // Implement your login logic here
    // For example, you might check the email and password against a database
    // and return the user if the credentials are valid
    try {
      const parseUser = await login(email, password);
      const user: IUser = {
        email: email,
        name: parseUser.get('name'),
        id: parseUser.id,
        sessionToken: parseUser.getSessionToken(),
      };
      return user;
    } catch (e) {
      throw new Error('Invalid credentials for login');
    }
  }

  async signup(email: string, password: string): Promise<IUser> {
    try {
      console.log('==================================');
      const parseUser = await signup(email, password);
      const user: IUser = {
        email: email,
        name: parseUser.get('name'),
        id: parseUser.id,
        sessionToken: parseUser.getSessionToken(),
      };
      return user;
    } catch (e) {
      throw new Error('Signup failed');
    }
  }
}
