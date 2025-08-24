import { redirect } from "next/navigation";

export default function FeedPage() {
    redirect("/apps/publications?tab=0");
}

