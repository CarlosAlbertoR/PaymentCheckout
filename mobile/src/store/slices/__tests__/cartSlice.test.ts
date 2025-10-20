import cartReducer, {
  addToCart,
  addQuantityToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
} from "../cartSlice";

const initialState = { items: [], total: 0 };

const mockItem = {
  productId: "1",
  name: "Test Product",
  price: 1000,
  quantity: 1,
  imageUrl: "test.jpg",
};

describe("cartSlice", () => {
  describe("addToCart", () => {
    it("should add new item to cart", () => {
      const action = addToCart(mockItem);
      const newState = cartReducer(initialState, action);

      expect(newState.items).toHaveLength(1);
      expect(newState.items[0]).toEqual(mockItem);
    });

    it("should update quantity if item already exists", () => {
      const stateWithItem = {
        ...initialState,
        items: [mockItem],
      };

      const action = addToCart({ ...mockItem, quantity: 2 });
      const newState = cartReducer(stateWithItem, action);

      expect(newState.items).toHaveLength(1);
      // addToCart reemplaza cantidad
      expect(newState.items[0].quantity).toBe(2);
    });
  });

  describe("removeFromCart", () => {
    it("should remove item from cart", () => {
      const stateWithItem = {
        ...initialState,
        items: [mockItem],
      };

      const action = removeFromCart("1");
      const newState = cartReducer(stateWithItem, action);

      expect(newState.items).toHaveLength(0);
    });

    it("should not remove item if it does not exist", () => {
      const stateWithItem = {
        ...initialState,
        items: [mockItem],
      };

      const action = removeFromCart("999");
      const newState = cartReducer(stateWithItem, action);

      expect(newState.items).toHaveLength(1);
    });
  });

  describe("updateQuantity", () => {
    it("should update item quantity", () => {
      const stateWithItem = {
        ...initialState,
        items: [mockItem],
      };

      const action = updateQuantity({ productId: "1", quantity: 5 });
      const newState = cartReducer(stateWithItem, action);

      expect(newState.items[0].quantity).toBe(5);
    });

    it("should remove item if quantity is 0", () => {
      const stateWithItem = {
        ...initialState,
        items: [mockItem],
      };

      const action = updateQuantity({ productId: "1", quantity: 0 });
      const newState = cartReducer(stateWithItem, action);

      expect(newState.items).toHaveLength(0);
    });

    it("should not update if item does not exist", () => {
      const stateWithItem = {
        ...initialState,
        items: [mockItem],
      };

      const action = updateQuantity({ productId: "999", quantity: 5 });
      const newState = cartReducer(stateWithItem, action);

      expect(newState.items[0].quantity).toBe(1);
    });
  });

  describe("clearCart", () => {
    it("should clear all items from cart", () => {
      const stateWithItems = {
        ...initialState,
        items: [
          mockItem,
          { ...mockItem, productId: "2", quantity: 2, name: "Another" },
        ],
      };

      const action = clearCart();
      const newState = cartReducer(stateWithItems, action);

      expect(newState.items).toHaveLength(0);
    });
  });
});
