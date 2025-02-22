import { sign, verify } from "jsonwebtoken";
import { inject, injectable } from "tsyringe";

import auth from "@config/auth";
import { IUsersTokensRepository } from "@modules/accounts/repositories/IUsersTokensRepository";
import { IDateProvider } from "@shared/container/providers/DateProvider/IDateProvider";
import { AppError } from "@shared/errors/AppError";

interface IPayload {
  sub: string;
  email: string;
}

@injectable()
class RefreshTokenUseCase {
  constructor(
    @inject("UsersTokensRepository")
    private usersTokensRepository: IUsersTokensRepository,
    @inject("DayjsDateProvider")
    private dayjsDateProvider: IDateProvider
  ) {}

  async execute(token: string): Promise<string> {
    const { email, sub } = verify(token, auth.secret_refresh_token) as IPayload;
    const {
      expire_in_refresh_token,
      secret_refresh_token,
      expires_refresh_token_days,
    } = auth;

    const user_id = sub;

    const userToken = await this.usersTokensRepository.findByUserIdAndRefreshToken(
      user_id,
      token
    );
    if (!userToken) {
      throw new AppError("Refresh token does not exists");
    }

    await this.usersTokensRepository.deleteById(userToken.id);

    const expires_date = this.dayjsDateProvider.addDays(
      expires_refresh_token_days
    );

    const refresh_token = sign({ email }, secret_refresh_token, {
      subject: user_id,
      expiresIn: expire_in_refresh_token,
    });

    await this.usersTokensRepository.create({
      user_id,
      refresh_token,
      expires_date,
    });

    return refresh_token;
  }
}
export { RefreshTokenUseCase };
