import React, { createContext, useContext, useEffect, useState } from 'react'

export type CurrencyCode = 'XOF' | 'NGN' | 'GHS' | 'EUR' | 'USD'

interface CurrencyContextType {
  currency: CurrencyCode
  setCurrency: (code: CurrencyCode) => void
  formatCurrency: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined,
)

const CURRENCY_CONFIG: Record<
  CurrencyCode,
  { locale: string; symbol: string; label: string }
> = {
  XOF: { locale: 'fr-FR', symbol: 'CFA', label: 'CFA' },
  NGN: { locale: 'en-NG', symbol: '₦', label: 'NGN' },
  GHS: { locale: 'en-GH', symbol: 'GH₵', label: 'GHS' },
  EUR: { locale: 'de-DE', symbol: '€', label: 'EUR' },
  USD: { locale: 'en-US', symbol: '$', label: 'USD' },
}

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>('XOF')

  useEffect(() => {
    const stored = localStorage.getItem('app_currency') as CurrencyCode
    if (stored && CURRENCY_CONFIG[stored]) {
      setCurrencyState(stored)
    }
  }, [])

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code)
    localStorage.setItem('app_currency', code)
  }

  const formatCurrency = (amount: number) => {
    if (typeof amount !== 'number')
      return `${CURRENCY_CONFIG[currency].symbol} 0`

    const config = CURRENCY_CONFIG[currency]
    const formatter = new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: currency === 'XOF' ? 'XOF' : currency,
      minimumFractionDigits: 0,
    })

    let formatted = formatter.format(amount)

    // Custom overrides for specific symbols if Intl doesn't match perfectly or for consistency
    if (currency === 'XOF') {
      formatted = formatted.replace('F CFA', 'CFA').replace('FCFA', 'CFA')
    }

    return formatted
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
