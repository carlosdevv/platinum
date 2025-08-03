import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accessToken?: string;
      steamUserId?: string;
    };
  }

  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
  }

  interface User {
    id: string;
    accessToken?: string;
    refreshToken?: string;
    steamUserId?: string;
  }

  interface Profile {
    picture?: string;
  }
}
