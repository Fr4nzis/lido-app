import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProdottoCarrello {
  id: string;
  nome: string;
  prezzo: number;
  qty: number;
}

interface CarrelloStore {
  items: ProdottoCarrello[];
  lettino: string;
  nomeCliente: string;
  modalita: 'lettino' | 'bancone';

  aggiungi: (prodotto: Omit<ProdottoCarrello, 'qty'>) => void;
  rimuovi: (id: string) => void;
  aumentaQty: (id: string) => void;
  diminuisciQty: (id: string) => void;
  svuota: () => void;

  setLettino: (lettino: string) => void;
  setNomeCliente: (nome: string) => void;
  setModalita: (modalita: 'lettino' | 'bancone') => void;

  totale: () => number;
  totaleItems: () => number;
}

export const useCarrelloStore = create<CarrelloStore>()(
  persist(
    (set, get) => ({
      items: [],
      lettino: '',
      nomeCliente: '',
      modalita: 'lettino',

      aggiungi: (prodotto) => {
        const items = get().items;
        const esistente = items.find((i) => i.id === prodotto.id);
        if (esistente) {
          set({
            items: items.map((i) =>
              i.id === prodotto.id ? { ...i, qty: i.qty + 1 } : i
            ),
          });
        } else {
          set({ items: [...items, { ...prodotto, qty: 1 }] });
        }
      },

      rimuovi: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      aumentaQty: (id) => {
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, qty: i.qty + 1 } : i
          ),
        });
      },

      diminuisciQty: (id) => {
        const items = get().items;
        const item = items.find((i) => i.id === id);
        if (!item) return;
        if (item.qty <= 1) {
          set({ items: items.filter((i) => i.id !== id) });
        } else {
          set({
            items: items.map((i) =>
              i.id === id ? { ...i, qty: i.qty - 1 } : i
            ),
          });
        }
      },

      svuota: () => set({ items: [], nomeCliente: '' }),
      setLettino: (lettino) => set({ lettino }),
      setNomeCliente: (nomeCliente) => set({ nomeCliente }),
      setModalita: (modalita) => set({ modalita }),

      totale: () =>
        get().items.reduce((sum, i) => sum + i.prezzo * i.qty, 0),

      totaleItems: () =>
        get().items.reduce((sum, i) => sum + i.qty, 0),
    }),
    {
      name: 'lido-carrello',
    }
  )
);