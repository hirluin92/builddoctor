import { redirect } from "next/navigation";

export default function Home() {
  const isMock = process.env.NEXT_PUBLIC_DEVOPS_MODE === "mock";
  
  if (isMock) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
