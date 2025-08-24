import type { Metadata } from "next";

import { PageTitle } from "@/components/PageTitle";
import SocialFeedApp from "./SocialFeedApp";

export const metadata: Metadata = {
    title: "Feed Social",
};

export default function SocialFeedPage() {
    return (
        <>
            <PageTitle 
                title="Feed Social" 
                items={[{ label: "Apps" }, { label: "Feed Social", active: true }]} 
            />
            <div className="mt-6">
                <SocialFeedApp />
            </div>
        </>
    );
}

