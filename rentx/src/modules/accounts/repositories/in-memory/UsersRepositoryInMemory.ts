import { ICreateUserDTO } from "../../dtos/ICreateUserDTO";
import { User } from "../../entities/User";
import { IUsersRepository } from "../IUsersRepository";

class UsersRepositoryInMemory implements IUsersRepository {
  repository: User[] = [];

  async create({
    driver_license,
    email,
    name,
    password,
  }: ICreateUserDTO): Promise<void> {
    const user = new User();

    Object.assign(user, {
      driver_license,
      email,
      name,
      password,
    });

    this.repository.push(user);
  }

  async findByEmail(email: string): Promise<User> {
    return this.repository.find((user) => user.email === email);
  }

  async findById(id: string): Promise<User> {
    return this.repository.find((user) => user.id === id);
  }
}

export { UsersRepositoryInMemory };
