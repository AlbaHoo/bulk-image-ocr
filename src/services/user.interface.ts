export interface IUser {
  email: string;
  name: string;
  id: string;
  sessionToken: string;
}

export interface IUserService {
  login(email: string, password: string): Promise<IUser>;
  signup(email: string, password: string): Promise<IUser>;
}
