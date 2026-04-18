export const useCurrency = () => {
  const currency = useState('currency', () => 'INR')
  
  const currencySymbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£'
  }

  const conversionRates: Record<string, number> = {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095
  }

  const formatPrice = (priceInINR: number): string => {
    const convertedPrice = priceInINR * conversionRates[currency.value]
    const symbol = currencySymbols[currency.value]
    return `${symbol}${convertedPrice.toFixed(2)}`
  }

  const setCurrency = (newCurrency: string) => {
    currency.value = newCurrency
    if (process.client) {
      localStorage.setItem('digikraft_currency', newCurrency)
    }
  }

  // Load from localStorage on client
  if (process.client) {
    const saved = localStorage.getItem('digikraft_currency')
    if (saved) {
      currency.value = saved
    }
  }

  return {
    currency,
    formatPrice,
    setCurrency,
    currencySymbols
  }
}
