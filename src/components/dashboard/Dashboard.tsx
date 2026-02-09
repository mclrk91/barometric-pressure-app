import PressureCard from './PressureCard'
import CyclePhaseCard from './CyclePhaseCard'
import AlertCard from './AlertCard'
import RecentHeadaches from './RecentHeadaches'
import QuickLogButton from './QuickLogButton'

export default function Dashboard() {
  return (
    <>
      <AlertCard />
      <PressureCard />
      <CyclePhaseCard />
      <RecentHeadaches />
      <QuickLogButton />
    </>
  )
}
