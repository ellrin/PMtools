const PageNavigationController = (() => {
  function showInputPage() {
    document.getElementById("json_input_page").classList.remove("is_hidden");
    document.getElementById("diagram_preview_page").classList.add("is_hidden");
    document.getElementById("go_to_input_button").classList.add("is_active");
    document.getElementById("go_to_preview_button").classList.remove("is_active");
  }

  function showPreviewPage() {
    document.getElementById("json_input_page").classList.add("is_hidden");
    document.getElementById("diagram_preview_page").classList.remove("is_hidden");
    document.getElementById("go_to_input_button").classList.remove("is_active");
    document.getElementById("go_to_preview_button").classList.add("is_active");
  }

  return { showInputPage, showPreviewPage };
})();
