import prisma from '../../prisma/client';
import { hashPassword, comparePassword } from '../../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../utils/jwt';

export class AuthService {
  static async register(username: string, email: string, password: string) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Set first user as ADMIN, subsequent as USER
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? 'ADMIN' : 'USER';

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        role,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const accessToken = generateAccessToken({ userId: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id });

    // Store session (refresh token)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  static async refresh(refreshToken: string) {
    const session = await prisma.session.findUnique({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session) {
      throw new Error('Invalid refresh token');
    }

    if (new Date() > session.expiresAt) {
      await prisma.session.delete({ where: { id: session.id } });
      throw new Error('Refresh token has expired');
    }

    try {
      verifyRefreshToken(refreshToken);
    } catch (err) {
      await prisma.session.delete({ where: { id: session.id } });
      throw new Error('Invalid refresh token signature');
    }

    const newAccessToken = generateAccessToken({ userId: session.user.id, role: session.user.role });
    const newRefreshToken = generateRefreshToken({ userId: session.user.id });

    // Rotate refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.$transaction([
      prisma.session.delete({ where: { id: session.id } }),
      prisma.session.create({
        data: {
          userId: session.user.id,
          refreshToken: newRefreshToken,
          expiresAt,
        },
      }),
    ]);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  static async logout(refreshToken: string) {
    try {
      await prisma.session.delete({
        where: { refreshToken },
      });
    } catch (error) {
      // Ignore if session already deleted or non-existent
    }
    return { message: 'Logged out successfully' };
  }
}
