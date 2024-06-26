import { API_URL } from "./config.js";
import { RESULT_PER_PAGE, KEY } from "./config.js";
// import { getJSON, sendJSON } from "./helpers.js";
import { AJAX } from "./helpers.js";

//# state object, contains all the data needed for the application
export const state = {
  recipe: {},
  search: {
    query: "",
    results: [],
    page: 1,
    resultsPerPage: RESULT_PER_PAGE,
  },
  bookmarks: [],
};

//# Function for creating a new object containing no underscores
const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    ...(recipe.key && { key: recipe.key }),
  };
};

//# this function will be responsible for fetching recipe data from forkify API
export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);

    // marking the bookmarks that are in the array "bookmarks"
    if (state.bookmarks.some((bookmark) => bookmark.id === id)) {
      state.recipe.bookmarked = true;
    } else {
      state.recipe.bookmarked = false;
    }
    // console.log(state.recipe);
  } catch (error) {
    // Temporary error handling
    alert(`${error} 🛑`);
    // Rethrowing error to actually catch it in the controller.js
    throw error;
  }
};

//# Implementing search functionality
export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;

    // buy adding KEY, it will load all recipes including the ones that contain our own key
    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    // console.log(data);

    state.search.results = data.data.recipes.map((rec) => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        ...(rec.key && { key: rec.key }),
      };
    });
    // when we do a new search, then the page resets to 1
    state.search.page = 1;
  } catch (error) {
    console.log(`${error} 🛑`);
    throw error;
  }
};

//# pagination
export const getSearchResultsPage = function (page = state.search.page) {
  // on which page currently the user is
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage; // 0
  const end = page * state.search.resultsPerPage; // 9

  return state.search.results.slice(start, end);
};

//# Update Servings functionality
export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach((ing) => {
    // newQt = oldQt * newServings / oldServings
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });

  // Update servings in the state
  state.recipe.servings = newServings;
};

//# LocalStorage setting
const persistBookmarks = function () {
  localStorage.setItem("bookmarks", JSON.stringify(state.bookmarks));
};

//# Bookmark functionality
export const addBookmark = function (recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) {
    state.recipe.bookmarked = true;
  }

  //
  persistBookmarks();
};

//# UnBookmark functionality
export const deleteBookmark = function (id) {
  // Delete bookmark
  const index = state.bookmarks.findIndex((el) => el.id === id);
  state.bookmarks.splice(index, 1);

  // Mark current recipe as NOT bookmarked
  if (id === state.recipe.id) {
    state.recipe.bookmarked = false;
  }

  //
  persistBookmarks();
};

//# Initialization function
const init = function () {
  const storage = localStorage.getItem("bookmarks");
  if (storage) {
    state.bookmarks = JSON.parse(storage);
  }
};
init();

//# Debugging function
// can be used while developing
const clearBookmarks = function () {
  localStorage.clear("bookmarks");
};
// clearBookmarks();

//# Function will make a request to the API and upload a new recipe
export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter((entry) => entry[0].startsWith("ingredient") && entry[1] !== "")
      .map((ing) => {
        // const ingArr = ing[1].replaceAll(" ", "").split(",");
        const ingArr = ing[1].split(",").map((el) => el.trim());
        if (ingArr.length !== 3) {
          throw new Error(
            `Wrong ingredient format! Please use the correct format :)`
          );
        }

        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    // object ready to upload to the API
    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };
    // sending the data
    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (error) {
    throw error;
  }
};
