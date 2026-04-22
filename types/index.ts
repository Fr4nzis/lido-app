export type Categoria = 'bar' | 'cucina' | 'cocktail' | 'snack';

export interface Prodotto {
  id: string;
  nome: string;
  descrizione: string | null;
  prezzo: number;
  categoria: Categoria;
  immagine_url: string | null;
  disponibile: boolean;
  ordinamento: number;
  allergeni: string[] | null;
}

export interface ProdottoCarrello extends Prodotto {
  qty: number;
}

export interface ItemCarrello {
  id: string;
  nome: string;
  qty: number;
  prezzo_unitario: number;
}

export type StatoOrdine = 'in_attesa' | 'in_preparazione' | 'pronto' | 'consegnato' | 'annullato';
export type ModalitaOrdine = 'lettino' | 'bancone';

export interface Ordine {
  id: string;
  lettino: string;
  nome_cliente: string | null;
  prodotti: ItemCarrello[];
  totale: number;
  modalita: ModalitaOrdine;
  stato: StatoOrdine;
  stripe_session_id: string | null;
  note: string | null;
  created_at: string;
  aggiornato_il: string;
}

export type StatoOmbrellone = 'disponibile' | 'occupato' | 'bloccato' | 'selezionato';

export interface Ombrellone {
  id: string;
  codice: string;
  x: number;
  y: number;
  zona: string;
  prezzo: number;
  attivo: boolean;
  stato?: StatoOmbrellone;
}

export type StatoPrenotazione = 'bloccato' | 'prenotato' | 'cancellato';

export interface Prenotazione {
  id: string;
  ombrellone_id: string;
  data: string;
  nome_cliente: string | null;
  email_cliente: string | null;
  stato: StatoPrenotazione;
  stripe_session_id: string | null;
  blocco_scade_il: string | null;
  totale: number | null;
  created_at: string;
}