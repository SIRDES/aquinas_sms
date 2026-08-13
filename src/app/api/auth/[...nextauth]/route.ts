
import NextAuth from "next-auth/next";

import { nextAuthOPtions } from "@/utils/services/nextAuthOptions";

const handler = NextAuth(nextAuthOPtions);

export { handler as GET, handler as POST };
