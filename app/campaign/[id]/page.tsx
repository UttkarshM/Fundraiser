import { CampaignDetailsPage } from "@/components/campaign-details-page"

export default function CampaignDetails({ params }: { params: { id: string } }) {
  return <CampaignDetailsPage campaignId={params.id} />
}
