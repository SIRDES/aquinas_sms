"use client";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import LoadingAlert from "@/components/LoadingAlert";
import {
  ADMIN_USER_TYPE,
  ELECTION_USER_TYPE,
  TEACHER_USER_TYPE,
} from "@/utils/constants";

export default function Dashboard() {
  const { data: session, status } = useSession();

  // console.log("session", session)
  if (status === "loading") {
    return <LoadingAlert open={true} />;
  }

  if (status === "authenticated") {
    if (session?.user?.role === ADMIN_USER_TYPE) {
      return redirect("/dashboard");
    }
    if (session?.user?.role === TEACHER_USER_TYPE) {
      return redirect("/teacher");
    }
    if (session?.user?.role === ELECTION_USER_TYPE) {
      return redirect("/election");
    }
    return redirect("/login");
  }

  redirect("/login");
}
