import React from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2, CreditCard, Wallet, Truck, ArrowRight, Check, Lock, Download, Loader2,
} from "lucide-react";
import StripePayment from "../../components/StripePayement.jsx";
import { useCheckoutFlow } from "../../hooks/useCheckoutFlow";
import { useDownloadInvoice } from "../../hooks/useDownloadInvoice";

export default function Checkout() {
  const {
    cart, navigate,
    currentStep, setCurrentStep,
    isOrdered, isSubmitting, setIsSubmitting,
    formData, setFormData,
    paymentMethod, setPaymentMethod,
    showMobileMoneyInput, setShowMobileMoneyInput,
    mobileMoneyNumber, setMobileMoneyNumber,
    fraisLivraison, totalGeneral,
    handleSubmitOrder,
    lastOrder,
  } = useCheckoutFlow();

  const { downloadInvoice, loading: downloading } = useDownloadInvoice();

  if (cart.length === 0 && !isOrdered) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-bold mb-4 text-gray-400">Votre panier est vide</h2>
        <Link to="/restaurants" className="px-8 py-3 bg-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-100">
          Découvrir nos restaurants
        </Link>
      </div>
    );
  }

  if (isOrdered) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 animate-bounce">
          <Check size={48} className="text-green-600" strokeWidth={4} />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4 text-center">Commande validée !</h1>
        <p className="text-gray-500 text-lg text-center max-w-md mb-10 font-medium">
          Merci, votre repas est en cours de préparation. Votre facture est disponible dès maintenant au téléchargement ci-dessous.
        </p>
        
        <div className="flex flex-col gap-4 w-full max-w-sm">
          {lastOrder && (
            <button 
              onClick={() => downloadInvoice(lastOrder.id, lastOrder.id)}
              disabled={downloading}
              className="w-full py-4 bg-orange-600 text-white rounded-2xl font-black shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all flex items-center justify-center gap-3"
            >
              {downloading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <Download size={24} />
              )}
              {downloading ? "Génération..." : "Télécharger ma facture"}
            </button>
          )}

          <div className="flex gap-4">
            <button onClick={() => navigate('/')} className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all">
              Retour à l'accueil
            </button>
            <button onClick={() => navigate('/orderhistory')} className="flex-1 py-4 bg-white border-2 border-gray-100 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm px-2">
              Voir historique
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Finaliser la commande</h1>

        {/* BARRE DE PROGRESSION */}
        <div className="flex items-center gap-4 mb-12 max-w-3xl text-sm font-bold">
          {[1, 2, 3].map((step, i) => {
            const labels = ['Livraison', 'Paiement', 'Récapitulatif'];
            return (
              <React.Fragment key={step}>
                {i > 0 && <div className={`flex-1 h-1 rounded-full transition-colors ${currentStep >= step ? 'bg-orange-600' : 'bg-gray-200'}`}></div>}
                <div className={`flex items-center gap-2 transition-colors ${currentStep >= step ? 'text-orange-600' : 'text-gray-300'}`}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${currentStep >= step ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-gray-200 text-white'}`}>{step}</span>
                  <span className="hidden sm:inline">{labels[i]}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">

            {/* ÉTAPE 1 : LIVRAISON */}
            <div className={`bg-white p-8 rounded-[32px] shadow-sm border transition-all ${currentStep === 1 ? 'border-orange-200 ring-4 ring-orange-50' : 'border-gray-100'}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${currentStep === 1 ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-500'}`}>1</span>
                  Adresse de livraison
                </h2>
                {currentStep > 1 && (
                  <button onClick={() => setCurrentStep(1)} className="text-sm font-bold text-orange-600 bg-orange-50 px-4 py-2 rounded-xl hover:bg-orange-100 transition-colors">Modifier</button>
                )}
              </div>

              {currentStep === 1 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Adresse exacte</label>
                    <input type="text" placeholder="Ex: Résidence les pins, Lac 2, Tunis" value={formData.adresse}
                      onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Téléphone</label>
                    <input type="tel" placeholder="216 -- --- ---" value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none font-medium" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Commentaire</label>
                    <input type="text" placeholder="Code porte, étage..." value={formData.commentaire}
                      onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
                      className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none font-medium" />
                  </div>
                  <div className="md:col-span-2 flex justify-end mt-4">
                    <button onClick={() => setCurrentStep(2)} disabled={!formData.adresse || !formData.telephone}
                      className="w-full md:w-auto px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all disabled:opacity-50">
                      Continuer vers le paiement <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl animate-fadeIn">
                  <div>
                    <p className="font-bold text-gray-900">{formData.adresse}</p>
                    <p className="text-sm text-gray-500 mt-1">{formData.telephone}</p>
                  </div>
                  <CheckCircle2 className="text-green-500" size={24} />
                </div>
              )}
            </div>

            {/* ÉTAPE 2 : PAIEMENT */}
            <div className={`bg-white p-8 rounded-[32px] shadow-sm border transition-all mt-8 ${currentStep === 2 ? 'border-orange-200 ring-4 ring-orange-50' : 'border-gray-100'} ${currentStep < 2 ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${currentStep === 2 ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-500'}`}>2</span>
                  Mode de paiement
                </h2>
                {currentStep > 2 && (
                  <button onClick={() => setCurrentStep(2)} className="text-sm font-bold text-orange-600 bg-orange-50 px-4 py-2 rounded-xl hover:bg-orange-100 transition-colors">Modifier</button>
                )}
              </div>

              <div className={currentStep === 2 && paymentMethod === 'carte' ? 'block' : 'hidden'}>
                <div className="p-5 rounded-2xl border-2 border-orange-500 bg-white mb-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-orange-100 text-orange-600"><CreditCard size={24} /></div>
                    <div className="flex-1">
                      <h3 className="font-bold flex items-center gap-2 text-orange-900">
                        Carte bancaire <Lock size={14} className="text-green-600" />
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">Paiement sécurisé en ligne via Stripe.</p>
                    </div>
                  </div>
                  <StripePayment amount={totalGeneral} onSuccess={handleSubmitOrder} onError={() => setIsSubmitting(false)} />
                  <div className="flex justify-end mt-4">
                    <button onClick={() => setCurrentStep(3)} className="px-8 py-3 bg-gray-900 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-all">
                      Confirmer ces informations <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>

              {currentStep === 2 ? (
                <div className="space-y-4 animate-fadeIn">
                  <div onClick={() => setPaymentMethod('livraison')}
                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'livraison' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${paymentMethod === 'livraison' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}><Truck size={24} /></div>
                      <div>
                        <h3 className={`font-bold ${paymentMethod === 'livraison' ? 'text-orange-900' : 'text-gray-900'}`}>Paiement à la livraison</h3>
                        <p className="text-xs text-gray-500 mt-1">Payez en espèces lorsque le livreur arrive.</p>
                      </div>
                    </div>
                  </div>

                  {paymentMethod !== 'carte' && (
                    <div onClick={() => setPaymentMethod('carte')} className="p-5 rounded-2xl border-2 border-gray-100 hover:border-gray-200 cursor-pointer transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gray-100 text-gray-500"><CreditCard size={24} /></div>
                        <div className="flex-1">
                          <h3 className="font-bold flex items-center gap-2 text-gray-900">
                            Carte bancaire <Lock size={14} className="text-green-600" />
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">Paiement sécurisé en ligne via Stripe.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className={`p-5 rounded-2xl border-2 transition-all ${paymentMethod === 'mobile_money' ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-gray-200 cursor-pointer'}`}>
                    <div className="flex items-center gap-4" onClick={() => { setPaymentMethod('mobile_money'); setShowMobileMoneyInput(!showMobileMoneyInput); }}>
                      <div className={`p-3 rounded-xl ${paymentMethod === 'mobile_money' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}><Wallet size={24} /></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className={`font-bold ${paymentMethod === 'mobile_money' ? 'text-orange-900' : 'text-gray-900'}`}>Mobile Money</h3>
                          <span className="text-xs font-bold text-orange-600 uppercase">
                            {showMobileMoneyInput && paymentMethod === 'mobile_money' ? 'Réduire' : 'Modifier le numéro'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Paiement via votre numéro : <span className="font-bold">{mobileMoneyNumber || formData.telephone}</span></p>
                      </div>
                    </div>
                    <div className={`overflow-hidden transition-all duration-300 ${paymentMethod === 'mobile_money' && showMobileMoneyInput ? 'max-height-40 mt-4 pt-4 border-t border-orange-100' : 'max-height-0'}`}>
                      <label className="block text-[10px] font-black text-orange-800 uppercase tracking-widest mb-2">Numéro de paiement (Orange, Moov, MTN...)</label>
                      <div className="flex gap-2">
                        <input type="tel" value={mobileMoneyNumber} onChange={(e) => setMobileMoneyNumber(e.target.value)} placeholder="Entrez le numéro pour le paiement"
                          className="flex-1 px-4 py-3 bg-white border border-orange-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-bold text-gray-900" />
                        <button onClick={() => setShowMobileMoneyInput(false)} className="px-4 py-3 bg-orange-600 text-white rounded-xl font-bold text-sm">Ok</button>
                      </div>
                    </div>
                  </div>

                  {paymentMethod !== 'carte' && (
                    <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
                      <button onClick={() => setCurrentStep(3)} className="w-full md:w-auto px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all">
                        Continuer vers le récapitulatif <ArrowRight size={18} />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white rounded-lg shadow-sm">
                        {paymentMethod === 'livraison'    && <Truck size={20} className="text-gray-700" />}
                        {paymentMethod === 'carte'        && <CreditCard size={20} className="text-gray-700" />}
                        {paymentMethod === 'mobile_money' && <Wallet size={20} className="text-gray-700" />}
                      </div>
                      <span className="font-bold text-gray-900">
                        {paymentMethod === 'livraison'    && 'Paiement à la livraison'}
                        {paymentMethod === 'carte'        && 'Carte bancaire'}
                        {paymentMethod === 'mobile_money' && `Mobile Money (${mobileMoneyNumber || formData.telephone})`}
                      </span>
                    </div>
                    <CheckCircle2 className="text-green-500" size={24} />
                  </div>
                  {paymentMethod === 'carte' && currentStep === 3 && (
                    <div className="hidden">
                      <StripePayment amount={totalGeneral} onSuccess={handleSubmitOrder} onError={() => setIsSubmitting(false)} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RÉCAPITULATIF */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 sticky top-28">
              <h2 className="text-xl font-black text-gray-900 mb-6">Récapitulatif de commande</h2>
              <div className="space-y-5 mb-8 max-h-[40vh] overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 items-center group">
                    <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                      <img src={item.image} alt={item.nom} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-sm font-bold text-gray-900 line-clamp-2 leading-tight">{item.nom}</span>
                      <span className="text-xs font-medium text-gray-400 mt-1">Quantité : {item.quantity}</span>
                    </div>
                    <span className="font-bold text-gray-900 shrink-0">{(parseFloat(item.prix) * item.quantity).toFixed(3)} DT</span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Sous-total</span>
                  <span>{(totalGeneral - fraisLivraison).toFixed(3)} DT</span>
                </div>
                <div className="flex justify-between text-gray-500 font-medium">
                  <span>Frais de livraison</span>
                  <span>{fraisLivraison.toFixed(3)} DT</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-lg font-black text-gray-900">Total à payer</span>
                  <span className="text-2xl font-black text-orange-600">{totalGeneral.toFixed(3)} DT</span>
                </div>
              </div>

              {currentStep === 3 ? (
                <button
                  onClick={(e) => {
                    if (paymentMethod === 'carte') {
                      setIsSubmitting(true);
                      const hiddenStripeBtn = document.getElementById('hidden-stripe-submit');
                      if (hiddenStripeBtn) hiddenStripeBtn.click();
                      else setIsSubmitting(false);
                    } else {
                      handleSubmitOrder(e);
                    }
                  }}
                  disabled={isSubmitting}
                  className="w-full mt-8 py-5 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-lg shadow-xl shadow-green-100 transition-all flex justify-center items-center gap-2 disabled:opacity-60"
                >
                  <CheckCircle2 size={24} />
                  {isSubmitting
                    ? (paymentMethod === 'carte' ? 'Traitement bancaire...' : 'Enregistrement...')
                    : (paymentMethod === 'mobile_money' ? 'Payer avec Mobile Money' : 'Valider & Payer')}
                </button>
              ) : (
                <div className="mt-8 p-4 border border-dashed border-gray-200 rounded-2xl text-gray-400 text-sm font-bold text-center">
                  Veuillez valider vos informations à l'étape 2 pour confirmer.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
