import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      accessToken?: string;
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
  }

  interface Profile {
    picture?: string;
  }
}
