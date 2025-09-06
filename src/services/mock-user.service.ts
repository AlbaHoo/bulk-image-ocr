import { IUser, IUserService } from './user.interface';

export class MockUserService implements IUserService {
  async login(email: string, password: string): Promise<IUser> {
    // Implement your login logic here
    // For example, you might check the email and password against a database
    // and return the user if the credentials are valid
    const user: IUser = {
      email: email,
      name: 'John Doe',
      id: '123',
      sessionToken: '123',
    };
    return user;
  }

  async signup(email: string, password: string): Promise<IUser> {
    // Implement your signup logic here
    // For example, you might create a new user in the database
    // and return the created user
    const user: IUser = {
      email: email,
      name: 'John Doe',
      id: '123',
      sessionToken: '123',
    };
    return user;
  }
}
