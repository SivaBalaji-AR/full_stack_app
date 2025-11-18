import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  role: string;
  phone: string;
}

export async function getAuthenticatedUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('authToken')?.value;

    if (!token) {
      return null;
    }

    const secret = process.env.JWT_SECRET || "";
    const decoded = jwt.verify(token, secret) as TokenPayload;

    return decoded;
  } catch (error) {
    return null;
  }
}
