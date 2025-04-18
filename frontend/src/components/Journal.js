import React, { useState, useEffect, useCallback } from "react";

export default function Journal({ journal, setJournal }) {
    // State for food modal
    const [selectedFood, setSelectedFood] = useState(null);
    // Get today's date in the format yyyy-mm-dd
    const today = new Date().toISOString().split("T")[0];
    // Set today's date as default
    const [date, setDate] = useState(today);

    // Hold journal entries for selected date
    const [currentEntries, setCurrentEntries] = useState({
        breakfast: [],
        lunch: [],
        dinner: [],
        snacks: []
    });
    const userId = localStorage.getItem("userId");

    const fetchJournalEntries = useCallback(async (selectedDate) => {
        try {
            const userId = localStorage.getItem("userId");
    
            const url = `http://localhost:5001/journal?date=${selectedDate}&userId=${userId}`;
            const response = await fetch(url);
            const data = await response.json();
    
            if (response.ok) {
                const journalData = data.journal?.[selectedDate] ?? { breakfast: [], lunch: [], dinner: [], snacks: [] };
                setJournal(data.journal || {});
                setCurrentEntries(journalData);
            } 
            else {
                console.error("Error fetching journal entries:", data.error || "Unknown error");
            }
        } 
        catch (error) {
            console.error("Failed to fetch journal entries:", error);
        }
    }, [setJournal]);
    
    
    useEffect(() => {
        fetchJournalEntries(date);
    }, [date, fetchJournalEntries]);
    

    // Update current entries whenever the date changes
    const handleDateChange = (event) => {
        const newDate = event.target.value;
        setDate(newDate);
    };

    // Calculate total calories for only breakfast, lunch, dinner, or snacks
    const calculateTotalCalories = (mealType) => {
        let total = 0;
        for (let i = 0; i < currentEntries[mealType].length; i++) {
            let food = currentEntries[mealType][i]; 
            total += food.calories * food.quantity;
        }
        return total;
    };

    // Calculate the final total calories across all meals
    const calculateFinalTotalCalories = () => {
        return (
            calculateTotalCalories("breakfast") +
            calculateTotalCalories("lunch") +
            calculateTotalCalories("dinner") +
            calculateTotalCalories("snacks")
        );
    };

    // Open the menu
    const openMenu = (food) => {
        setSelectedFood(food);
    };

    // Close the menu
    const closeMenu = () => {
        setSelectedFood(null);
    };

    // Handle quantity change
    const handleQuantityChange = (event) => {
        const newQuantity = parseInt(event.target.value) || 0;
        setSelectedFood((prev) => ({
            ...prev,
            quantity: newQuantity,
        }));
    };

    const saveUpdatedQuantity = async () => {
        if (!selectedFood) return;

        try {
            const response = await fetch(`http://localhost:5001/update-journal`, {
                method: "PATCH", 
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({
                   userId: userId, 
                   date: date,
                   mealType: selectedFood.meal_type,
                   foodName: selectedFood.food_name,
                   newQuantity: selectedFood.quantity, 
                }),
            });

            if (response.ok) {
                await fetchJournalEntries(date);
                setSelectedFood(null);
            }
            else {
                console.error("Failed updating quantity")
            }
        }
        catch (error) {
            console.error("Error updating quantity: ", error);
        }
    };

    return (
        <div className="journal-page">
            <h1>Journal</h1>
            
            <input 
                type="date" 
                value={date} 
                onChange={handleDateChange}
            />

            {selectedFood && (
                <div className="menu">
                    <div className="menu-content">
                        <h2>{selectedFood.name}</h2>
                        <p>Serving Size: {selectedFood.serving_size}g</p>
                        <p>Calories: {selectedFood.calories || 'N/A'}</p>
                        <p>Carbs: {selectedFood.carbohydrates_total_g || 'N/A'}g</p>
                        <p>Protein: {selectedFood.protein_g || 'N/A'}g</p>
                        <p>Fat: {selectedFood.fat_total_g || 'N/A'}g</p>
                        <label>
                            Quantity:
                            <input
                                type="number"
                                value={selectedFood.quantity}
                                onChange={handleQuantityChange}
                                min="0"
                            />
                        </label>
                        <button onClick={saveUpdatedQuantity}>
                            Save
                        </button>
                        <button onClick={closeMenu}>
                            Close
                        </button>
                    </div>
                </div>
            )}
    
            <div className="meals">
                {["breakfast", "lunch", "dinner", "snacks"].map((mealType) => (
                    <div className="meal-types" key={mealType}>
                        <h3>{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</h3>
                        <ul>
                            {currentEntries[mealType]?.length > 0 ? (
                                currentEntries[mealType].map((food, index) => (
                                    <li key={index} onClick={() => openMenu(food)} style={{ cursor: 'pointer' }}>
                                        {food.food_name} - {food.quantity}x - {food.calories * food.quantity} calories
                                    </li>
                                ))
                            ) : (
                                <p>No items added to {mealType}.</p>
                            )}
                        </ul>
                    </div>
                ))}
            </div>
    
            <div className="total-calories-today">
                <h2>Total Calories Today</h2>
                <p>{calculateFinalTotalCalories()} calories</p>
            </div>
        </div>
    );
}