import React, { useState } from 'react';

export default function Main({ journal, setJournal }) {
    // Input for searching food
    const [searchQuery, setSearchQuery] = useState('');
    // Holds list of foods from fetched from database
    const [searchResults, setSearchResults] = useState([]);
    // State for whether or not an API request is loading
    const [isLoading, setIsLoading] = useState(false);
    // State used to reduce amount of search API called
    const [debounceTimeout, setDebounceTimeout] = useState(null);
    // State managing food item clicked and menu shown
    const [selectedFood, setSelectedFood] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    // State for selected date
    const today = new Date().toISOString().split("T")[0];
    const [date, setDate] = useState(today);
    // State for custom food
    const[customFood, setCustomFood] = useState({
        name: "",
        serving_size_g: 0,
        calories: 0,
        carbohydrates_total_g: 0, 
        protein_g: 0,
        fat_total_g: 0
    });
    const [isCustomOpen, setIsCustomOpen] = useState(false);
    // Get user id
    const user_id = localStorage.getItem("userId");


    // Handle search query changes
    const handleSearchChange = (event) => {
        const query = event.target.value;
        setSearchQuery(query);

        // Clear the previous timeout if the user is typing again
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        if (query) {
            // Debounce the API call to only trigger after the user stops typing
            const timeout = setTimeout(() => {
                searchFoods(query);
            }, 500);

            setDebounceTimeout(timeout);
        } else {
            setSearchResults([]);
        }
    };

    // Fetch food data from the backend
    const searchFoods = async (query) => {
        setIsLoading(true);
    
        try {
            const response = await fetch(`http://localhost:5002/api/search?query=${encodeURIComponent(query)}`, {
                method: 'GET'
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
    
            const foods = await response.json();
    
            if (foods && foods.length > 0) {
                setSearchResults(foods);
            } else {
                setSearchResults([]);
            }
        } catch (err) {
            console.error('Error fetching food data', err);
        } finally {
            setIsLoading(false);
        }
    };
    

    // Set selected food and open menu
    const handleFoodClick = (food) => {
        setSelectedFood(food);
        setIsMenuOpen(true);
    };

    // Close menu
    const closeMenu = () => {
        setIsMenuOpen(false);
        setIsCustomOpen(false);
        setSelectedFood(null);
    };


    const addToJournal = async (foodItem, mealType) => {
        setJournal((prevState) => {
            const newJournal = { ...prevState };
    
            if (!newJournal[date]) {
                newJournal[date] = { breakfast: [], lunch: [], dinner: [], snacks: [] };
            }
    
            const existingFood = newJournal[date][mealType].find(
                (item) => item.foodName === foodItem.name
            );
    
            if (existingFood) {
                existingFood.quantity += 1;
            } else {
                newJournal[date][mealType].push({
                    userId: user_id,
                    entry_date: date,
                    mealType,
                    foodName: foodItem.name,
                    serving_size_g: foodItem.serving_size_g,
                    quantity: 1,
                    calories: foodItem.calories,
                    carbohydrates_total_g: foodItem.carbohydrates_total_g,
                    protein_g: foodItem.protein_g,
                    fat_total_g: foodItem.fat_total_g,
                });
            }
    
            return newJournal;
        });
    
        try {
            const response = await fetch("http://localhost:5001/journal", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId: user_id,
                    entry_date: date,
                    mealType,
                    foodName: foodItem.name,
                    serving_size: foodItem.serving_size_g,
                    quantity: 1,
                    calories: foodItem.calories,
                    carbohydrates_total_g: foodItem.carbohydrates_total_g,
                    protein_g: foodItem.protein_g,
                    fat_total_g: foodItem.fat_total_g,
                }),
            });
        
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add food");
            }
        
            const data = await response.json();
            console.log("Response from backend:", data);
        } catch (error) {
            console.error("Error adding food:", error.message);
        }        
    
        closeMenu();
    };

    // HANDLE CUSTOM FOOD
    const handleCustomFood = () => {
        setIsCustomOpen(true);
    }

    const addCustomFoodToJournal = async (mealType) => {
        const newFoodEntry = {
            userId: user_id,
            entry_date: date,
            mealType,
            foodName: customFood.name,
            serving_size_g: customFood.serving_size_g,
            quantity: 1,
            calories: Number(customFood.calories),
            carbohydrates_total_g: Number(customFood.carbohydrates_total_g),
            protein_g: Number(customFood.protein_g),
            fat_total_g: Number(customFood.fat_total_g),
        };
    
        // Update state
        setJournal((prevState) => {
            const newJournal = { ...prevState };
    
            if (!newJournal[date]) {
                newJournal[date] = { breakfast: [], lunch: [], dinner: [], snacks: [] };
            }
    
            newJournal[date][mealType].push(newFoodEntry);
    
            return newJournal;
        });
    
        // Send to backend
        try {
            const response = await fetch("http://localhost:5001/journal", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newFoodEntry),
            });
        
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to add custom food");
            }
        
            const data = await response.json();
            console.log("Custom food added:", data);
        } catch (error) {
            console.error("Error adding custom food:", error.message);
        }        
    
        closeMenu();
    };
    
    // Render UI
    return (
        <div className="main-page">
            <div className="search">
                <h1>Search Food</h1>
    
                <div className="search-section">
                    <input
                        type="text"
                        placeholder="Search for food..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                    />
                </div>
    
                <div className="results-section">
                    {isLoading && <p>Loading...</p>}
    
                    {searchResults.length > 0 ? (
                        <ul>
                            {searchResults.map((food, index) => (
                                <li key={index} onClick={() => handleFoodClick(food)}>
                                    {food.name}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        searchQuery && !isLoading && <p>No results found for "{searchQuery}".</p>
                    )}
                </div>
    
                <div className="custom-food-section">
                    <button className="custom-food" onClick={handleCustomFood}>Create a Food</button>
                </div>
                {isCustomOpen && (
                    <div className="custom-menu">
                        <div className="custom-content">
                            <label>Food Name:</label>
                            <input 
                                value={customFood.name} 
                                onChange={(e) => setCustomFood({...customFood, name: e.target.value})} 
                            />
                            <label>Serving Size in grams:</label>
                            <input 
                                type="number"
                                value={customFood.serving_size_g} 
                                onChange={(e) => setCustomFood({...customFood, serving_size_g: e.target.value})} 
                            />
                            <label>Calories:</label>
                            <input 
                                type="number"
                                value={customFood.calories} 
                                onChange={(e) => setCustomFood({...customFood, calories: e.target.value})} 
                            />
                            <label>Carbs:</label>
                            <input 
                                type="number"
                                value={customFood.carbohydrates_total_g} 
                                onChange={(e) => setCustomFood({...customFood, carbohydrates_total_g: e.target.value})} 
                            />
                            <label>Protein:</label>
                            <input 
                                type="number"
                                value={customFood.protein_g} 
                                onChange={(e) => setCustomFood({...customFood, protein_g: e.target.value})} 
                            />
                            <label>Fat:</label>
                            <input 
                                type="number"
                                value={customFood.fat_total_g} 
                                onChange={(e) => setCustomFood({...customFood, fat_total_g: e.target.value})} 
                            />
                            <button onClick={() => addCustomFoodToJournal('breakfast')}>Add to Breakfast</button>
                            <button onClick={() => addCustomFoodToJournal('lunch')}>Add to Lunch</button>
                            <button onClick={() => addCustomFoodToJournal('dinner')}>Add to Dinner</button>
                            <button onClick={() => addCustomFoodToJournal('snacks')}>Add to Snacks</button>
                            <button onClick={closeMenu}>Close</button>
                        </div>
                    </div>
                )}
    
                <div className="date-section">
                    <input
                        id="date-picker"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)} // Update selected date
                    />
                </div>
    
                {isMenuOpen && selectedFood && (
                    <div className="menu">
                        <div className="menu-content">
                            <h3>{selectedFood.name}</h3>
                            <p>Serving Size: {selectedFood.serving_size_g}g</p>
                            <p>Calories: {selectedFood.calories}</p>
                            <p>Carbs: {selectedFood.carbohydrates_total_g}g</p>
                            <p>Protein: {selectedFood.protein_g}g</p>
                            <p>Fat: {selectedFood.fat_total_g}g</p>
                            <button onClick={() => addToJournal(selectedFood, 'breakfast')}>Add to Breakfast</button>
                            <button onClick={() => addToJournal(selectedFood, 'lunch')}>Add to Lunch</button>
                            <button onClick={() => addToJournal(selectedFood, 'dinner')}>Add to Dinner</button>
                            <button onClick={() => addToJournal(selectedFood, 'snacks')}>Add to Snacks</button>
                            <button onClick={closeMenu}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}