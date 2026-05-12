import React, { createContext, useState, useEffect, useCallback } from 'react'; // Thêm useCallback
import axios from 'axios';

export const CartContext = createContext({
    cartItems: [],
    isCartOpen: false,
    setIsCartOpen: (isOpen) => {}, // Thêm tham số 'isOpen' vào đây
    fetchCartItems: () => {}
});

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    
    const userSession = JSON.parse(localStorage.getItem('userSession'));

    // Bọc hàm fetchCartItems bằng useCallback
    const fetchCartItems = useCallback(async () => {
        if (userSession) {
            try {
                const response = await axios.get(`http://localhost:8080/api/cart/user/${userSession.id}`);
                setCartItems(response.data);
            } catch (error) {
                console.error("Lỗi tải giỏ hàng:", error);
            }
        }
    }, [userSession?.id]); // Thêm dependency cho useCallback

    useEffect(() => {
        fetchCartItems();
    }, [fetchCartItems]); // Thêm fetchCartItems vào mảng dependency của useEffect

    return (
        <CartContext.Provider value={{ cartItems, fetchCartItems, isCartOpen, setIsCartOpen }}>
            {children}
        </CartContext.Provider>
    );
};