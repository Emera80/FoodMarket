# FoodMarket - Documentation Backend

## Génération de PDF (xhtml2pdf)

Cette section détaille le fonctionnement de la génération de factures PDF au sein de l'application FoodMarket.

### Pourquoi xhtml2pdf ?
Nous utilisons la librairie `xhtml2pdf` (également connue sous le nom de `pisa`) pour transformer nos templates Django HTML/CSS en documents PDF. C'est une solution robuste qui ne nécessite pas de moteur de rendu externe lourd (comme Chromium).

### Contraintes Techniques Importantes
`xhtml2pdf` ne supporte pas les standards CSS modernes comme **Flexbox** ou **CSS Grid**. Pour garantir une mise en page fidèle, nous suivons ces règles :
- **Mise en page par Tableaux** : Nous utilisons exclusivement des balises `<table>` pour positionner les éléments.
- **Unités de mesure** : Les unités comme `pt`, `cm` ou `mm` sont privilégiées par rapport aux `px` pour un rendu constant à l'impression.
- **Encodage UTF-8** : Indispensable pour le support des caractères accentués français (é, à, ç, etc.).

### Flux de Génération
1. **Extraction** : La vue `GenererFacturePDFView` récupère la commande via son ID.
2. **Nettoyage** : Les données sont formatées côté Python (ex: concaténation des noms, formatage du mode de paiement) pour éviter les filtres de templates complexes non supportés.
3. **Rendering** : Le template `facture.html` est rendu en chaîne de caractères via `render_to_string`.
4. **Conversion** : La chaîne HTML est envoyée au moteur `pisa.CreatePDF` qui écrit le résultat binaire dans un buffer mémoire (`io.BytesIO`).
5. **Livraison** : Le PDF est renvoyé sous forme de `HttpResponse` avec un header `Content-Disposition: attachment` pour forcer le téléchargement.

### Sécurité
L'accès aux factures doit être protégé pour garantir que seul le propriétaire de la commande ou un administrateur puisse y accéder. (Voir les commentaires dans `views.py` pour l'activation des permissions).
