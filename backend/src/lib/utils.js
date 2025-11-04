import jwt from "jsonwebtoken";
import { ENV } from "./env.js";

export const generateToken = (userId, res) => {
  const { JWT_SECRET } = ENV;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: "7d",
  });

  const isProduction = ENV.NODE_ENV === 'production';
  
  const cookieOptions = {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true, // Prevent XSS attacks
    path: '/',
  };

  if (isProduction) {
    const domain = ENV.CLIENT_URL ? new URL(ENV.CLIENT_URL).hostname : undefined;
    if (domain) {
      // Remove port if present
      cookieOptions.domain = domain.split(':')[0];
    }
    cookieOptions.secure = true; // Only send over HTTPS
    cookieOptions.sameSite = 'none'; // Required for cross-site cookies
  } else {
    cookieOptions.sameSite = 'lax';
  }

  res.cookie('jwt', token, cookieOptions);

  return token;
};

// http://localhost
// https://dsmakmk.com
