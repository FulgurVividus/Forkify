import * as model from "./model.js";
import { MODAL_CLOSE_SEC } from "./config.js";
import recipeView from "../js/views/recipeView.js";
import searchView from "../js/views/searchView.js";
import resultsView from "../js/views/resultsView.js";
import paginationView from "../js/views/paginationView.js";
import bookmarksView from "../js/views/bookmarksView.js";
import addRecipeView from "../js/views/addRecipeView.js";

import "core-js/stable";
import "regenerator-runtime/runtime";

// it's not JS, it's coming from Parcel
// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    const id = window.location.hash.slice(1);
    // console.log(id);

    if (!id) {
      return;
    }
    recipeView.renderSpinner();

    // 0) Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage());

    // 1) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);

    // 2) Loading Recipe
    await model.loadRecipe(id);

    // 3) Rendering Recipe
    recipeView.render(model.state.recipe);
  } catch (error) {
    recipeView.renderError();
    console.error(error);
  }
};

//# will call async loadSearchResults function
const controlSearchResults = async function () {
  try {
    resultsView.renderSpinner();

    // 1) to get search query
    const query = searchView.getQuery();
    if (!query) {
      return;
    }

    // 2) Load search results
    // doesn't return anything (just manipulates data), no need to store it
    await model.loadSearchResults(query);

    // 3) Render the results
    // resultsView.render(model.state.search.results);
    resultsView.render(model.getSearchResultsPage());

    // 4) Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (error) {
    console.log(error);
  }
};

//# new controller, be executed whenever a click happens in one of the buttons
const controlPagination = function (goToPage) {
  // 1) Render the NEW results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2) Render NEW pagination buttons
  paginationView.render(model.state.search);
};

//# Servings functionality
const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

//# Controller for adding a new bookmark
const controlAddBookmark = function () {
  // 1) Add/Remove bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id);
  }

  // Update recipe view
  recipeView.update(model.state.recipe);

  // Render bookmarks
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

//# Function will receive the data of new recipe
const controlAddRecipe = async function (newRecipe) {
  try {
    // Loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);

    // Render a new recipe
    recipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.recipe);

    // Change the ID in URL (History API), allows to change the URL without reloading the page
    window.history.pushState(null, "", `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (error) {
    // console.error(error);
    addRecipeView.renderError(error.message);
  }
};

//# will be called at the start when the page loads
// publisher/subscriber pattern
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
