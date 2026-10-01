import { WHATSAPP_NUMBER, BRAND } from './config'

export const fmtPrice = (n) =>
  `${new Intl.NumberFormat('fr-FR').format(Number(n) || 0).replace(/[  ]/g, ' ')} FCFA`

export const waLink = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ''}`

/** Transforme une tenue + choix en ligne de commande (utilisé par le panier et la commande directe). */
export function toOrderItem(t, { size = '', color = '', qty = 1 } = {}) {
  const img = t.images?.[0]
  return {
    key: `${t.id}|${size}|${color}`,
    id: t.id,
    name: t.name,
    price: t.price,
    size,
    color,
    qty,
    thumb: img?.thumb || '',
    imageUrl: img?.url || '',
  }
}

/**
 * Message WhatsApp : chaque tenue avec sa taille, sa couleur, sa quantité,
 * le lien de sa PHOTO et le lien de la fiche. (WhatsApp ne permet pas de joindre
 * un fichier via un lien : la photo s'ouvre/s'affiche via son lien.)
 */
export function orderMessage(items) {
  const many = items.length > 1
  const total = items.reduce((s, i) => s + i.price * i.qty, 0)
  const lines = [`Bonjour ${BRAND} 👋`, many ? 'Je souhaite commander ces tenues :' : 'Je souhaite commander cette tenue :', '']
  items.forEach((it, n) => {
    lines.push(`${many ? `${n + 1}. ` : ''}*${it.name}*`)
    lines.push(`Taille : ${it.size || 'à préciser'} • Couleur : ${it.color || 'à préciser'}`)
    lines.push(`Quantité : ${it.qty} × ${fmtPrice(it.price)}`)
    if (it.imageUrl) lines.push(`Photo : ${it.imageUrl}`)
    lines.push(`Fiche : ${window.location.origin}/tenue/${it.id}`)
    lines.push('')
  })
  if (many) lines.push(`*Total : ${fmtPrice(total)}*`)
  else lines.push(`*Prix : ${fmtPrice(total)}*`)
  return lines.join('\n')
}
