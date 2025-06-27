import { CampaignDetailsPage } from "@/components/campaign-details-page"

export default async function CampaignDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <CampaignDetailsPage campaignId={id} />
}
