import FinanceScreen from './FinanceScreen.jsx'

export default function PrivateFinanceScreen() {
  return (
    <FinanceScreen
      scope="private"
      txCollection="transactionsPrivate"
      settingsCollection="financeSettingsPrivate"
      trackerCollection="financeTrackerPrivate"
      trackerSettingsCollection="financeTrackerSettingsPrivate"
      sobrasCollection="financeSobrasPrivate"
    />
  )
}
