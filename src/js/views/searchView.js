// this class won't render anything, just get the query and listen for click event on the button

class SearchView {
  _parentEl = document.querySelector(".search");

  getQuery() {
    const query = this._parentEl.querySelector(".search__field").value;
    this._clearInput();
    return query;
  }

  _clearInput() {
    this._parentEl.querySelector(".search__field").value = "";
  }

  // will be like a "publisher"
  addHandlerSearch(handler) {
    this._parentEl.addEventListener("submit", function (e) {
      e.preventDefault();
      // call handler function => controlSearchResults, handler() is like a placeholder for any function
      handler();
    });
  }
}

export default new SearchView();
