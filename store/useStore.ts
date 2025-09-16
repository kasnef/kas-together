import { create } from 'zustand';

export interface Item {
  id: string;      // ID duy nhất để xác định item
  name: string;    // Một thuộc tính dữ liệu, ví dụ là tên
  status: 'pending' | 'completed';
}

export interface SimpleItem {
  name: string;
}

export interface GenericStoreState {
  items: Item[]; // Mảng chứa tất cả các item
  simpleItem: SimpleItem;
  isLoading: boolean; // Một state ví dụ để quản lý trạng thái tải dữ liệu
  
  addItem: (name: string) => void;
  removeItem: (id: string) => void;
  updateItemStatus: (id: string, newStatus: Item['status']) => void;
  setItems: (newItems: Item[]) => void; // Action để thay thế toàn bộ danh sách
  setSimpleItem: (newItem: SimpleItem) => void;
  setLoading: (loadingState: boolean) => void;
}

export const useGenericStore = create<GenericStoreState>((set) => ({

  items: [],
  simpleItem: { name: "" },
  isLoading: false,

  addItem: (name) => {
    const newItem: Item = {
      id: new Date().toISOString(),
      name: name,
      status: 'pending',
    };

    set((state) => ({
      items: [...state.items, newItem],
    }));
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },

  updateItemStatus: (id, newStatus) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      ),
    }));
  },
  setItems: (newItems) => {
    set({ items: newItems });
  },

  setSimpleItem: (newItem) => {
    set({ simpleItem: newItem });
  },

  setLoading: (loadingState) => {
    set({ isLoading: loadingState });
  }
}));
