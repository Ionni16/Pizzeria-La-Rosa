// app/[lang]/page.tsx
import Link from "next/link";
import Image from "next/image";
import { Inter, Fraunces } from "next/font/google";
import { UserCog } from "lucide-react";


import MenuDishRow from "@/app/components/MenuDishRow";
import { getMenuData, type DishRow, type CategoryRow } from "@/lib/supabase/menu/getMenuData";

type Lang = "it" | "en";
type Section = { id: string; title: string; items: DishRow[] };

const body = Inter({ subsets: ["latin"], variable: "--font-body" });
const display = Fraunces({ subsets: ["latin"], variable: "--font-display" });

function pickLang(lang: Lang, it: string | null, en: string | null) {
  const v = lang === "it" ? it : en;
  return (v ?? it ?? en ?? "").trim();
}

export default async function MenuPage({ params }: { params: Promise<{ lang: Lang }> }) {
  const { lang } = await params;

  const { categories: cats, dishes: ds } = await getMenuData();

  // lingua: 1 solo pulsante che mostra l’altra
  const otherLang: Lang = lang === "it" ? "en" : "it";
  const otherLangHref = `/${otherLang}`;
  const otherLangLabel = otherLang.toUpperCase();

  // piatti senza categoria
  const uncategorized = ds.filter((d: DishRow) => !d.category_id);

  const sections: Section[] = (cats as CategoryRow[]).map((c: CategoryRow) => ({
    id: c.id,
    title: pickLang(lang, c.name_it, c.name_en),
    items: ds.filter((d: DishRow) => d.category_id === c.id),
  }));

  if (uncategorized.length) {
    sections.push({
      id: "uncategorized",
      title: lang === "it" ? "Altro" : "Other",
      items: uncategorized,
    });
  }

  const visibleSections = sections.filter((s: Section) => s.items.length > 0);

  return (
    <main className={`${body.variable} ${display.variable} min-h-screen bg-[#fbf7f0] text-neutral-900`}>
      {/* HEADER */}
      <header className="sticky top-0 z-10 bg-[#fbf7f0]/90 backdrop-blur border-b border-black/10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative h-12 w-12 shrink-0">
              <Image src="/logo-2026.png" alt="Pizzeria La Rosa" fill className="object-contain" priority />
            </div>
            <h1
              className="leading-[0.95] tracking-tight"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="block text-[14px] sm:text-[15px] font-semibold uppercase tracking-[0.25em] text-neutral-600">
                Pizzeria
              </span>

              <span className="block text-[36px] sm:text-[44px] font-semibold text-neutral-900">
                <span className="text-[#1f7a3a]/90">La</span>{" "}
                <span className="text-[#c81f2d]/85">Rosa</span>
              </span>
            </h1>
          </div>

          {/* RIGHT ACTIONS: lingua + admin */}
          <div className="flex items-center gap-2">
            {/* Switch lingua */}
            <Link
              href={otherLangHref}
              className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-white/85 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-white transition"
              aria-label={lang === "it" ? "Switch to English" : "Passa a Italiano"}
            >
              <span className="inline-block h-2 w-2 rounded-full bg-[#c81f2d]" />
              {otherLangLabel}
            </Link>

            {/* Icona Admin */}
            <Link
              href="/admin/login"
              aria-label="Area amministratore"
              title="Area amministratore"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/85 text-neutral-700 hover:bg-white hover:text-neutral-900 transition"
            >
              <UserCog size={18} />
            </Link>
          </div>

        </div>

        {/* linea oro logo */}
        <div className="h-[3px] w-full bg-[#d4a23a]" />
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white/88 shadow-[0_18px_60px_-42px_rgba(0,0,0,0.45)]">
          {/* watermark leggero */}
          <div className="pointer-events-none absolute -top-10 -right-10 h-44 w-44 opacity-[0.05]">
            <Image src="/logo.png" alt="" fill className="object-contain" />
          </div>

          {/* Sezioni */}
          <div className="divide-y divide-black/10">
            {visibleSections.map((section: Section, idx: number) => (
              <details key={section.id} open={idx === 0} className="group">
                <summary
                  className="list-none cursor-pointer px-6 py-6 flex items-center justify-between gap-4
                             [&::-webkit-details-marker]:hidden"
                >
                  {/* TITOLO CATEGORIA: più grande + colori logo */}
                  <div className="min-w-0 flex items-start gap-3">
                    <span className="mt-2 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[#1f7a3a]" />
                    <h2
                      className="min-w-0 flex-1 whitespace-normal break-words text-[26px] sm:text-[30px] font-semibold tracking-tight text-[#c81f2d] leading-tight"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {section.title}
                    </h2>
                  </div>

                  {/* toggle premium */}
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-black/10 bg-white text-neutral-700">
                    <span className="group-open:hidden text-xl leading-none">+</span>
                    <span className="hidden group-open:inline text-xl leading-none">−</span>
                  </span>
                </summary>

                {/* underline oro solo quando aperto (dettaglio premium) */}
                <div className="px-6">
                  <div className="hidden group-open:block h-[2px] w-16 bg-[#d4a23a] rounded-full mb-2" />
                </div>

                <div className="px-6 pb-2">
                  {section.items.map((dish: DishRow) => (
                    <MenuDishRow key={dish.id} lang={lang} dish={dish} />
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* SEZIONE INFO (IT/EN) */}
        <section className="mt-10 rounded-2xl border border-black/10 bg-white/90 shadow-[0_18px_60px_-42px_rgba(0,0,0,0.45)] overflow-hidden">
          <div className="px-6 py-8 space-y-8 text-neutral-800 text-[14.5px] leading-relaxed">
            {lang === "it" ? (
              <>
                {/* ITALIANO */}
                <div>
                  <h3 className="mb-2 text-[20px] font-semibold text-[#c81f2d]" style={{ fontFamily: "var(--font-display)" }}>
                    Informazioni importanti
                  </h3>
                  <p>
                    In caso di allergie, vi chiediamo cortesemente di comunicarlo <strong>SEMPRE in cassa</strong>, al momento
                    dell&apos;ordine.
                    <br />
                    <strong>Non abbiamo pizze senza glutine.</strong>
                  </p>
                </div>

                <div>
                  <h3
                    className="mb-3 text-[20px] font-semibold text-[#c81f2d]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    I NOSTRI ORARI
                  </h3>

                  <div className="grid grid-cols-[70px_1fr] gap-y-1 text-[14.5px]">
                    <div className="font-semibold">LUN.</div><div>12:00 - 14:00</div>
                    <div className="font-semibold">MAR.</div><div>Giorno di chiusura</div>
                    <div className="font-semibold">MER.</div><div>12:00 - 14:00 e 18:00 - 21:30</div>
                    <div className="font-semibold">GIO.</div><div>12:00 - 14:00 e 18:00 - 21:30</div>
                    <div className="font-semibold">VEN.</div><div>12:00 - 14:00 e 18:00 - 21:30</div>
                    <div className="font-semibold">SAB.</div><div>12:00 - 14:00 e 18:00 - 21:30</div>
                    <div className="font-semibold">DOM.</div><div>18:00 - 21:30</div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 text-[20px] font-semibold text-[#c81f2d]" style={{ fontFamily: "var(--font-display)" }}>
                    PRENOTAZIONE TELEFONICA
                  </h3>
                  <p>
                    Potete prenotare le vostre pizze o riservare un tavolo telefonando a questo numero:
                    <br />
                    <a href="tel:0341321601" className="font-semibold text-neutral-900 hover:underline">
                      📞 0341 321601
                    </a>
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-[20px] font-semibold text-[#c81f2d]" style={{ fontFamily: "var(--font-display)" }}>
                    PRENOTAZIONE WHATSAPP
                  </h3>
                  <p>
                    Potete mandare un messaggio a questo numero:
                    <br />
                    <a href="https://wa.me/393896655887" className="font-semibold text-neutral-900 hover:underline">
                      💬 389 6655887
                    </a>
                  </p>
                  <p className="mt-2 text-neutral-700">
                    Risponderemo ai messaggi in ordine di arrivo (generalmente entro 15 minuti)
                  </p>

                  <p className="mt-3">
                    Se volete prenotare una consegna a domicilio potete scriverci con anticipo (anche dalla mattina) indicando:
                  </p>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>nome sul citofono</li>
                    <li>indirizzo di consegna</li>
                    <li>scelta delle pizze</li>
                    <li>orario indicativo</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 text-[20px] font-semibold text-[#c81f2d]" style={{ fontFamily: "var(--font-display)" }}>
                    CONSEGNE A DOMICILIO
                  </h3>
                  <p>Effettuiamo consegne a domicilio con i nostri rider</p>
                  <ul className="mt-2 space-y-1">
                    <li>Costo consegna: da €2,00 a €4,50 (a seconda della distanza)</li>
                    <li>Costo consegna per una sola pizza: €3,00 a €5,00 (a seconda della distanza)</li>
                    <li>Ci riserviamo 10/15 minuti di tolleranza sull’orario concordato</li>
                    <li className="italic">[oppure puoi ordinare tramite TAAC Delivery]</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 text-[20px] font-semibold text-[#c81f2d]" style={{ fontFamily: "var(--font-display)" }}>
                    RITIRO IN PIZZERIA
                  </h3>
                  <p>
                    L’asporto con prenotazione anticipata avrà sempre precedenza.
                    <br />
                    Non facciamo mai trovare le pizze pronte, ma aspettiamo sempre il vostro arrivo prima di infornare.
                  </p>
                  <p className="mt-2">
                    Confidando nella vostra puntualità, vi consegneremo le pizze appena possibile (alterniamo infornate di
                    tavoli, ritiri e consegne)
                  </p>
                </div>

                <div>
                  <h3 className="mb-2 text-[20px] font-semibold text-[#c81f2d]" style={{ fontFamily: "var(--font-display)" }}>
                    TAVOLI
                  </h3>
                  <p>La pizzeria è dotata di una piccola sala con tavoli al piano superiore.</p>
                  <p className="mt-2">
                    Vi ricordiamo che siamo una pizzeria da asporto pertanto non abbiamo il servizio al tavolo.
                  </p>
                  <p className="mt-2">
                    Chiediamo, gentilmente, di lasciare libero il tavolo una volta terminato di mangiare per dare la possibilità
                    anche ad altre persone di gustare la pizza sul posto.
                  </p>
                  <p className="mt-2">Consigliamo sempre di chiamare con anticipo per prenotare il vostro tavolo</p>
                </div>

                <div>
                  <h3 className="mb-2 text-[20px] font-semibold text-[#c81f2d]" style={{ fontFamily: "var(--font-display)" }}>
                    MODALITÀ DI PAGAMENTO
                  </h3>
                  <ul className="space-y-1">
                    <li>•Contanti (per le consegne a domicilio i rider portano sempre il resto fino a 50€)</li>
                    <li>•POS/Carta</li>
                    <li>•Satispay</li>
                    <li><strong>NON</strong> accettiamo Ticket o Buoni pasto</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                {/* ENGLISH */}
                <div>
                  <h3
                    className="mb-2 text-[20px] font-semibold uppercase tracking-wide text-[#c81f2d]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Important information
                  </h3>
                  <p>
                    If you have any allergies, please make sure you <strong>always</strong> inform us at the till when placing
                    your order.
                    <br />
                    <strong>We do not offer gluten-free pizzas.</strong>
                  </p>
                </div>

                <div>
                  <h3
                    className="mb-2 text-[20px] font-semibold uppercase tracking-wide text-[#c81f2d]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Opening hours
                  </h3>

                  <div className="grid grid-cols-[70px_1fr] gap-y-1 text-[14.5px]">
                    <div className="font-semibold">Mon.</div><div>12:00 - 14:00</div>
                    <div className="font-semibold">Tue.</div><div>Closed</div>
                    <div className="font-semibold">Wed.</div><div>12:00 - 14:00 &amp; 18:00 - 21:30</div>
                    <div className="font-semibold">Thu.</div><div>12:00 - 14:00 &amp; 18:00 - 21:30</div>
                    <div className="font-semibold">Fri.</div><div>12:00 - 14:00 &amp; 18:00 - 21:30</div>
                    <div className="font-semibold">Sat.</div><div>12:00 - 14:00 &amp; 18:00 - 21:30</div>
                    <div className="font-semibold">Sun.</div><div>18:00 - 21:30</div>
                  </div>
                </div>

                <div>
                  <h3
                    className="mb-2 text-[20px] font-semibold uppercase tracking-wide text-[#c81f2d]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Phone booking
                  </h3>
                  <p>
                    You can pre-order your pizzas or reserve a table by calling:
                    <br />
                    <a href="tel:0341321601" className="font-semibold text-neutral-900 hover:underline">
                      📞 +39 0341 321601
                    </a>
                  </p>
                </div>

                <div>
                  <h3
                    className="mb-2 text-[20px] font-semibold uppercase tracking-wide text-[#c81f2d]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    WhatsApp booking
                  </h3>
                  <p>
                    You can message us at:
                    <br />
                    <a href="https://wa.me/393896655887" className="font-semibold text-neutral-900 hover:underline">
                      💬 +39 389 6655887
                    </a>
                  </p>
                  <p className="mt-2 text-neutral-700">
                    We reply in order of arrival (usually within 15 minutes).
                  </p>

                  <p className="mt-3">
                    If you want to book a home delivery, please message us in advance (even in the morning) with:
                  </p>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>name on the doorbell</li>
                    <li>delivery address</li>
                    <li>your pizza selection</li>
                    <li>approximate time</li>
                  </ul>
                </div>

                <div>
                  <h3
                    className="mb-2 text-[20px] font-semibold uppercase tracking-wide text-[#c81f2d]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Home delivery
                  </h3>
                  <p>We deliver with our own riders.</p>
                  <ul className="mt-2 space-y-1">
                    <li>Delivery fee: from €2.00 to €4.50 (depending on distance)</li>
                    <li>Delivery fee for a single pizza: €3.00 to €5.00 (depending on distance)</li>
                    <li>We allow a 10–15 minute tolerance on the agreed time</li>
                    <li className="italic">[or you can order via TAAC Delivery]</li>
                  </ul>
                </div>

                <div>
                  <h3
                    className="mb-2 text-[20px] font-semibold uppercase tracking-wide text-[#c81f2d]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Pickup in store
                  </h3>
                  <p>
                    Takeaway orders with advance booking will always have priority.
                    <br />
                    We never prepare pizzas in advance: we always wait for your arrival before baking.
                  </p>
                  <p className="mt-2">
                    If you are on time, we will hand over your pizzas as soon as possible (we alternate oven batches for tables,
                    pickups and deliveries).
                  </p>
                </div>

                <div>
                  <h3
                    className="mb-2 text-[20px] font-semibold uppercase tracking-wide text-[#c81f2d]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Tables
                  </h3>
                  <p>The pizzeria has a small upstairs dining area with tables.</p>
                  <p className="mt-2">
                    Please note: we are primarily a takeaway pizzeria, so we do not provide table service.
                  </p>
                  <p className="mt-2">
                    Kindly free up the table once you finish eating, so other guests can also enjoy their pizza on site.
                  </p>
                  <p className="mt-2">
                    We always recommend calling ahead to reserve your table.
                  </p>
                </div>

                <div>
                  <h3
                    className="mb-2 text-[20px] font-semibold uppercase tracking-wide text-[#c81f2d]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Payment methods
                  </h3>
                  <ul className="space-y-1">
                    <li>•Cash (for home deliveries our riders can always give change up to €50)</li>
                    <li>•Card / POS</li>
                    <li>•Satispay</li>
                    <li><strong>We do not accept meal vouchers.</strong></li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </section>



        <p className="mt-6 text-center text-sm text-neutral-500">
          {lang === "it"
            ? "© 2026 Pizzeria La Rosa - Tutti i diritti riservati"
            : "© 2026 Pizzeria La Rosa - All rights reserved"}
        </p>
      </div>
    </main>
  );
}
