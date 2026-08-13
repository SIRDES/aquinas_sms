import { getServerSession } from "next-auth";
import { nextAuthOPtions } from "./nextAuthOptions";

/**
 * A server-side utility function to retrieve the current session and ensure
 * the user has the required permission. Since this is NOT in a "use server"
 * file, it will not be exposed as an API endpoint to the client and can be
 * safely imported directly into any "use server" Server Action file.
 */
export const getCurrentServerUser = async (permission: string) => {
  const session = await getServerSession(nextAuthOPtions);

  if (!session) {
    throw new Error("Authentication required");
  }

  if (!session.user.userPermissions?.includes(permission)) {
    throw new Error("You don't have the required permission to perform this action");
  }

  return session;
};


export const getCurrentServerUserWithoutPermission = async () => {
  const session = await getServerSession(nextAuthOPtions);

  if (!session) {
    throw new Error("Authentication required");
  }


  return session;
};