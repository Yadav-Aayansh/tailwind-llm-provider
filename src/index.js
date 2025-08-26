var openaiConfig = async (options = {}) => {
    let config = parseStoredConfig(
      (options = {
        storage: localStorage,
        key: "bootstrapLLMProvider_openaiConfig",
        defaultBaseUrls: ["https://api.openai.com/v1"],
        baseUrls: undefined,
        show: false,
        title: "OpenAI API Configuration",
        baseUrlLabel: "API Base URL",
        apiKeyLabel: "API Key",
        buttonLabel: "Save & Test",
        help: "",
        ...options
      }).storage.getItem(options.key)
    );
  
    if (config && !options.show) {
      let models = await fetchModels(config.baseUrl, config.apiKey);
      return { ...config, baseURL: config.baseUrl, models: models };
    }
  
    return await showConfigModal(config, options);
  };
  
  function parseStoredConfig(storedData) {
    try {
      let parsed = JSON.parse(storedData);
      if (parsed && typeof parsed.baseUrl === "string" && typeof parsed.apiKey === "string") {
        return { baseUrl: parsed.baseUrl, apiKey: parsed.apiKey };
      }
      if (parsed && typeof parsed.baseURL === "string" && typeof parsed.apiKey === "string") {
        return { baseUrl: parsed.baseURL, apiKey: parsed.apiKey };
      }
    } catch {}
  }
  
  async function fetchModels(baseUrl, apiKey) {
    if (!/^https?:\/\//.test(baseUrl)) {
      throw new Error("Invalid URL");
    }
  
    let headers = apiKey ? { Authorization: `Bearer ${apiKey}` } : {};
    let response = await fetch(baseUrl.replace(/\/$/, "") + "/models", { headers });
  
    if (!response.ok) {
      throw new Error("Invalid API key or URL");
    }
  
    let { data } = await response.json();
    if (!data || !Array.isArray(data)) {
      throw new Error("Invalid response");
    }
  
    return data
      .map((model) => (typeof model === "string" ? model : model.id || ""))
      .filter(Boolean);
  }
  
  function showConfigModal(
    existingConfig,
    {
      storage,
      key,
      defaultBaseUrls,
      baseUrls,
      title,
      baseUrlLabel,
      apiKeyLabel,
      buttonLabel,
      help
    }
  ) {
    return new Promise((resolve, reject) => {
      removeExistingModal();
  
      let modalId = "llm-provider-modal";
      let currentBaseUrl = existingConfig?.baseUrl || baseUrls?.[0]?.url || defaultBaseUrls[0];
      let currentApiKey = existingConfig?.apiKey || "";
  
      // Create datalist options for default URLs
      let datalistOptions = defaultBaseUrls
        .map((url) => `<option value="${url}">`)
        .join("");
  
      // Create select options for custom base URLs
      let selectOptions = (baseUrls || [])
        .map(
          ({ url, name }) =>
            `<option value="${url}" ${url === currentBaseUrl ? "selected" : ""}>${name}</option>`
        )
        .join("");
  
      // Determine input field type (select or input with datalist)
      let baseUrlField = baseUrls
        ? `<select name="baseUrl" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">${selectOptions}</select>`
        : `<input name="baseUrl" type="url" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" list="llm-provider-dl" placeholder="https://api.openai.com/v1" value="${currentBaseUrl}">
           <datalist id="llm-provider-dl">${datalistOptions}</datalist>`;
  
      // Create modal HTML with Tailwind classes
      document.body.insertAdjacentHTML(
        "beforeend",
        `
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40" id="${modalId}">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 transform transition-all">
      <form class="bg-white rounded-lg">
        <div class="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold text-gray-900">${title}</h3>
          <button type="button" class="text-gray-400 hover:text-gray-600 transition-colors duration-200" aria-label="Close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="p-6">
          ${help ? `<div class="mb-4 text-sm text-gray-600">${help}</div>` : ""}
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">${baseUrlLabel}</label>
            ${baseUrlField}
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">${apiKeyLabel}</label>
            <input name="apiKey" type="password" class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" autocomplete="off" value="${currentApiKey}">
          </div>
          <div class="text-red-600 text-sm hidden" role="alert"></div>
        </div>
        <div class="px-6 pb-6">
          <button type="submit" class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">${buttonLabel}</button>
        </div>
      </form>
    </div>
  </div>`
      );
  
      let modal = document.getElementById(modalId);
      let form = modal.querySelector("form");
      let closeButton = modal.querySelector('button[aria-label="Close"]');
      let errorDisplay = modal.querySelector(".text-red-600");
  
      let cleanup = () => {
        removeExistingModal();
        window.removeEventListener("keydown", handleKeyDown);
      };
  
      function handleKeyDown(event) {
        if (event.key === "Escape") {
          cleanup();
          reject(new Error("cancelled"));
        }
      }
  
      function showError(message) {
        errorDisplay.textContent = message;
        errorDisplay.classList.remove("hidden");
      }
  
      function hideError() {
        errorDisplay.classList.add("hidden");
      }
  
      closeButton.onclick = () => {
        cleanup();
        reject(new Error("cancelled"));
      };
  
      // Close on backdrop click
      modal.onclick = (event) => {
        if (event.target === modal) {
          cleanup();
          reject(new Error("cancelled"));
        }
      };
  
      window.addEventListener("keydown", handleKeyDown);
  
      form.onsubmit = async (event) => {
        event.preventDefault();
        hideError();
  
        let baseUrl = form.baseUrl.value.trim();
        let apiKey = form.apiKey.value.trim();
  
        if (!/^https?:\/\//.test(baseUrl)) {
          return showError("Enter a valid URL");
        }
  
        let submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
  
        try {
          let models = await fetchModels(baseUrl, apiKey);
          storage.setItem(key, JSON.stringify({ baseUrl, apiKey }));
          cleanup();
          resolve({
            baseUrl,
            baseURL: baseUrl,
            apiKey,
            models
          });
        } catch (error) {
          showError(error.message);
          submitButton.disabled = false;
        }
      };
    });
  }
  
  function removeExistingModal() {
    let existingModal = document.getElementById("llm-provider-modal");
    if (existingModal) {
      existingModal.remove();
    }
  }
  
  export { openaiConfig };
