import { useState } from "react";
import { HelpCircleIcon, MailIcon, ChevronDownIcon, BoxIcon, ZapIcon } from "../components/icons";

const FAQ = [
  {
    q: "Quanto tempo ci mette la spedizione?",
    a: "Le consegne in Italia arrivano in 2-3 giorni lavorativi. Per ordini sopra i 99€ la spedizione è gratuita.",
  },
  {
    q: "Posso restituire un prodotto?",
    a: "Sì, hai 14 giorni di tempo dalla ricezione per effettuare un reso. Contattaci via email per avviare la procedura e ti forniremo le istruzioni.",
  },
  {
    q: "I componenti sono originali?",
    a: "Tutti i prodotti venduti da KyronTech sono originali, nuovi, e acquistati direttamente dai distributori ufficiali di ciascun brand (NVIDIA, AMD, Intel, Corsair, ecc.).",
  },
  {
    q: "Offrite assistenza per il montaggio?",
    a: "Offriamo supporto tecnico pre e post vendita via email. Per il montaggio fisico collaboriamo con assemblatori partner — scrivici per ricevere i contatti nella tua zona.",
  },
  {
    q: "Come funziona il PC Builder?",
    a: "Il nostro PC Builder ti guida nella selezione dei componenti verificando automaticamente la compatibilità (socket CPU/mobo, tipo RAM, wattaggio PSU). Aggiungi il build completo al carrello con un click.",
  },
  {
    q: "Posso avere una fattura intestata alla mia azienda?",
    a: "Sì. In fase di checkout seleziona l'opzione 'Fatturazione aziendale' e inserisci P.IVA, ragione sociale e SDI. Riceverai la fattura elettronica tramite il sistema di interscambio.",
  },
  {
    q: "Come posso modificare o cancellare il mio ordine?",
    a: "Finché l'ordine è in stato 'In attesa' puoi contattarci e lo modifichiamo. Una volta spedito non possiamo più intervenire, ma puoi esercitare il diritto di reso entro 14 giorni.",
  },
  {
    q: "Cosa fare se ricevo un prodotto difettoso?",
    a: "Tutti i prodotti hanno 2 anni di garanzia. Se riscontri un difetto scrivici subito: organizziamo il ritiro gratuito e la sostituzione o il rimborso.",
  },
];

const TOPICS = [
  {
    icon: <BoxIcon />,
    title: "Ordini e spedizioni",
    desc: "Tracking, modifica ordini, tempi di consegna, resi.",
  },
  {
    icon: <ZapIcon />,
    title: "Supporto tecnico",
    desc: "Compatibilità componenti, consigli di build, troubleshooting.",
  },
  {
    icon: <HelpCircleIcon />,
    title: "Account e pagamenti",
    desc: "Gestione profilo, metodi di pagamento, fatturazione aziendale.",
  },
];

const SupportPage = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className="page-stack">
      <section className="support-hero">
        <span className="section-kicker">Supporto</span>
        <h1>Come possiamo aiutarti?</h1>
        <p>
          Il nostro team è disponibile per assisterti nella scelta, nel montaggio e nel post-vendita.
          Consulta le FAQ o scrivici direttamente.
        </p>
      </section>

      <section className="support-topics">
        {TOPICS.map((topic) => (
          <article key={topic.title} className="support-topic">
            <div className="support-topic__icon">{topic.icon}</div>
            <h3>{topic.title}</h3>
            <p>{topic.desc}</p>
          </article>
        ))}
      </section>

      <section className="support-faq">
        <div className="section-head">
          <div>
            <span className="section-kicker">FAQ</span>
            <h2>Domande frequenti</h2>
          </div>
        </div>

        <div className="support-faq__list">
          {FAQ.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <details
                key={item.q}
                className={`support-faq__item ${isOpen ? "is-open" : ""}`}
                open={isOpen}
                onClick={(event) => event.preventDefault()}
              >
                <summary
                  onClick={(event) => {
                    event.preventDefault();
                    toggle(index);
                  }}
                >
                  <span>{item.q}</span>
                  <ChevronDownIcon className="support-faq__chevron" />
                </summary>
                <div className="support-faq__body">
                  <p>{item.a}</p>
                </div>
              </details>
            );
          })}
        </div>
      </section>

      <section className="support-contact">
        <div className="support-contact__icon">
          <MailIcon />
        </div>
        <div className="support-contact__body">
          <h3>Non hai trovato quello che cerchi?</h3>
          <p>
            Scrivici a <a href="mailto:support@kyrontech.com">support@kyrontech.com</a> e ti
            rispondiamo entro 24 ore lavorative.
          </p>
        </div>
        <a href="mailto:support@kyrontech.com" className="btn-shell btn-shell--primary">
          Contattaci
        </a>
      </section>
    </div>
  );
};

export default SupportPage;
