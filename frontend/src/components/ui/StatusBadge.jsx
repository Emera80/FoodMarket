import React from 'react';

const STATUS_STYLES = {
  en_attente:    'bg-gray-100 text-gray-600 border-gray-200',
  confirmee:     'bg-gray-100 text-gray-600 border-gray-200',
  en_preparation:'bg-gray-100 text-gray-600 border-gray-200',
  en_livraison:  'bg-orange-50 text-orange-600 border-orange-100',
  livree:        'bg-green-50 text-green-600 border-green-100',
  annulee:       'bg-red-50 text-red-600 border-red-100',
};

const STATUS_LABELS = {
  en_attente:    'En attente',
  confirmee:     'En attente',
  en_preparation:'En attente',
  en_livraison:  'En livraison',
  livree:        'Livrée',
  annulee:       'Annulée',
};

export default function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-600';
  const label = STATUS_LABELS[status] || 'Inconnu';

  return (
    <span className={`px-4 py-1.5 font-bold text-sm rounded-full border ${style}`}>
      {label}
    </span>
  );
}
