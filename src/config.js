export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/$/, '')

// Numéro WhatsApp (chiffres uniquement, indicatif inclus)
export const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || '221781944541').replace(/\D/g, '')

export const BRAND = 'BakhYayeCouture'

// Logo : remplacez le fichier public/logo.svg, ou changez ce chemin (ex. '/logo.png')
export const LOGO_SRC = '/logo.svg'

export const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
