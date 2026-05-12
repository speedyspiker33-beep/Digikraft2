/**
 * Currency formatting composable
 */

export const useCurrency = () => {
  const formatPrice = (price: number, currency = 'USD', locale = 'en-US'): string => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }

  const formatDiscount = (original: number, current: number): number => {
    return Math.round(((original - current) / original) * 100)
  }

  const calculateTax = (price: number, taxRate = 0.1): number => {
    return Math.round(price * taxRate * 100) / 100
  }

  const calculateTotal = (subtotal: number, tax: number, shipping = 0): number => {
    return Math.round((subtotal + tax + shipping) * 100) / 100
  }

  return {
    formatPrice,
    formatDiscount,
    calculateTax,
    calculateTotal
  }
}
