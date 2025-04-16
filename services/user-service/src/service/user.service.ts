import User from '../models/user.model';
import UserType from '../types/user.type';

export class UserService {
  static async registerUser(payload: UserType) {
    const data = await User.create({
      ...payload,
    });

    return data;
  }

  // Login pengguna
  static async loginUser(payload: UserType) {
    const user = await User.findOne({ email: payload.email });
    return user;
  }

  // Mendapatkan data pengguna berdasarkan user_id
  static async getUserById(user_id: string) {
    const user = await User.findOne({ user_id });
    return user;
  }

  static async getUserByEmail(payload: UserType) {
    const user = await User.findOne({ email: payload.email });
    return user;
  }

  static async updateUser(user_id: string, payload: UserType) {
    const user = await User.findOneAndUpdate({ user_id }, payload, {
      new: true,
    });

    return user;
  }

  static async deleteUser(user_id: string) {
    const data = await User.findOneAndDelete({ user_id });
    return data;
  }

  static async getRefreshToken(user_id: string): Promise<string | null> {
    const user = await User.findOne({ user_id }).select('refreshToken');
    return user?.refreshToken || null;
  }
}
