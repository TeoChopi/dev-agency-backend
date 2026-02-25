import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*

/**
 * ViewModel for products with pagination support and incremental data loading
 */
class ProductsViewModel(
    private val apiService: ProductsApiService,
    private val coroutineScope: CoroutineScope = CoroutineScope(Dispatchers.Main)
) {
    // Loading states
    private val _loadingState = MutableStateFlow(LoadingState.IDLE)
    val loadingState: StateFlow<LoadingState> = _loadingState.asStateFlow()

    // Products data
    private val _products = MutableStateFlow<List<Product>>(emptyList())
    val products: StateFlow<List<Product>> = _products.asStateFlow()

    // Pagination state
    private val _currentPage = MutableStateFlow(1)
    val currentPage: StateFlow<Int> = _currentPage.asStateFlow()

    private val _totalPages = MutableStateFlow(0)
    val totalPages: StateFlow<Int> = _totalPages.asStateFlow()

    private val _totalItems = MutableStateFlow(0)
    val totalItems: StateFlow<Int> = _totalItems.asStateFlow()

    private val _hasNextPage = MutableStateFlow(false)
    val hasNextPage: StateFlow<Boolean> = _hasNextPage.asStateFlow()

    // Error state
    private val _error = MutableStateFlow<String?>(null)
    val error: StateFlow<String?> = _error.asStateFlow()

    // Search and filter state
    private val _searchQuery = MutableStateFlow("")
    val searchQuery: StateFlow<String> = _searchQuery.asStateFlow()

    private val _selectedCategory = MutableStateFlow<String?>(null)
    val selectedCategory: StateFlow<String?> = _selectedCategory.asStateFlow()

    private val _priceRange = MutableStateFlow<Pair<Double?, Double?>>(null to null)
    val priceRange: StateFlow<Pair<Double?, Double?>> = _priceRange.asStateFlow()

    // Configuration
    private val pageSize = 10
    private var currentJob: Job? = null

    init {
        loadProducts(refresh = true)
    }

    /**
     * Load products with pagination support
     */
    fun loadProducts(refresh: Boolean = false) {
        currentJob?.cancel()
        currentJob = coroutineScope.launch {
            try {
                val targetPage = if (refresh) 1 else _currentPage.value
                val loadingStateValue = if (refresh) LoadingState.LOADING else LoadingState.LOADING_MORE
                
                _loadingState.value = loadingStateValue
                _error.value = null

                val params = ProductsApiParams(
                    page = targetPage,
                    limit = pageSize,
                    sortBy = "createdAt",
                    sortOrder = "desc",
                    search = _searchQuery.value.takeIf { it.isNotBlank() },
                    category = _selectedCategory.value,
                    minPrice = _priceRange.value.first,
                    maxPrice = _priceRange.value.second,
                    isActive = true
                )

                val result = apiService.getProducts(params)
                
                result.fold(
                    onSuccess = { response ->
                        if (response.success) {
                            val newProducts = response.data
                            
                            if (refresh) {
                                // Replace all products for refresh
                                _products.value = newProducts
                                _currentPage.value = 1
                            } else {
                                // Append products for incremental loading
                                _products.value = _products.value + newProducts
                                _currentPage.value = targetPage
                            }
                            
                            // Update pagination metadata
                            updatePaginationMeta(response.pagination)
                            _loadingState.value = LoadingState.SUCCESS
                        } else {
                            val errorMessage = response.error?.message ?: "Unknown error occurred"
                            _error.value = errorMessage
                            _loadingState.value = LoadingState.ERROR
                        }
                    },
                    onFailure = { exception ->
                        _error.value = exception.message ?: "Network error occurred"
                        _loadingState.value = LoadingState.ERROR
                    }
                )
            } catch (e: Exception) {
                _error.value = e.message ?: "Unexpected error occurred"
                _loadingState.value = LoadingState.ERROR
            }
        }
    }

    /**
     * Load next page (incremental loading)
     */
    fun loadNextPage() {
        if (_loadingState.value == LoadingState.LOADING_MORE || !_hasNextPage.value) {
            return
        }
        
        _currentPage.value += 1
        loadProducts(refresh = false)
    }

    /**
     * Refresh products (reload from first page)
     */
    fun refreshProducts() {
        loadProducts(refresh = true)
    }

    /**
     * Search products by query
     */
    fun searchProducts(query: String) {
        if (_searchQuery.value == query) return
        
        _searchQuery.value = query
        loadProducts(refresh = true)
    }

    /**
     * Filter products by category
     */
    fun filterByCategory(category: String?) {
        if (_selectedCategory.value == category) return
        
        _selectedCategory.value = category
        loadProducts(refresh = true)
    }

    /**
     * Filter products by price range
     */
    fun filterByPriceRange(minPrice: Double?, maxPrice: Double?) {
        val newRange = minPrice to maxPrice
        if (_priceRange.value == newRange) return
        
        _priceRange.value = newRange
        loadProducts(refresh = true)
    }

    /**
     * Clear all filters
     */
    fun clearFilters() {
        _searchQuery.value = ""
        _selectedCategory.value = null
        _priceRange.value = null to null
        loadProducts(refresh = true)
    }

    /**
     * Get product by ID
     */
    fun getProductById(id: String, onResult: (Result<Product>) -> Unit) {
        coroutineScope.launch {
            try {
                val result = apiService.getProductById(id)
                result.fold(
                    onSuccess = { response ->
                        if (response.success) {
                            onResult(Result.success(response.data))
                        } else {
                            val errorMessage = response.error?.message ?: "Product not found"
                            onResult(Result.failure(Exception(errorMessage)))
                        }
                    },
                    onFailure = { exception ->
                        onResult(Result.failure(exception))
                    }
                )
            } catch (e: Exception) {
                onResult(Result.failure(e))
            }
        }
    }

    /**
     * Create new product
     */
    fun createProduct(product: CreateProductRequest, onResult: (Result<Product>) -> Unit) {
        coroutineScope.launch {
            try {
                val result = apiService.createProduct(product)
                result.fold(
                    onSuccess = { response ->
                        if (response.success) {
                            // Refresh products list to show new product
                            refreshProducts()
                            onResult(Result.success(response.data))
                        } else {
                            val errorMessage = response.error?.message ?: "Failed to create product"
                            onResult(Result.failure(Exception(errorMessage)))
                        }
                    },
                    onFailure = { exception ->
                        onResult(Result.failure(exception))
                    }
                )
            } catch (e: Exception) {
                onResult(Result.failure(e))
            }
        }
    }

    /**
     * Update product
     */
    fun updateProduct(id: String, product: UpdateProductRequest, onResult: (Result<Product>) -> Unit) {
        coroutineScope.launch {
            try {
                val result = apiService.updateProduct(id, product)
                result.fold(
                    onSuccess = { response ->
                        if (response.success) {
                            // Update product in local list
                            updateProductInList(response.data)
                            onResult(Result.success(response.data))
                        } else {
                            val errorMessage = response.error?.message ?: "Failed to update product"
                            onResult(Result.failure(Exception(errorMessage)))
                        }
                    },
                    onFailure = { exception ->
                        onResult(Result.failure(exception))
                    }
                )
            } catch (e: Exception) {
                onResult(Result.failure(e))
            }
        }
    }

    /**
     * Delete product
     */
    fun deleteProduct(id: String, onResult: (Result<Unit>) -> Unit) {
        coroutineScope.launch {
            try {
                val result = apiService.deleteProduct(id)
                result.fold(
                    onSuccess = {
                        // Remove product from local list
                        removeProductFromList(id)
                        onResult(Result.success(Unit))
                    },
                    onFailure = { exception ->
                        onResult(Result.failure(exception))
                    }
                )
            } catch (e: Exception) {
                onResult(Result.failure(e))
            }
        }
    }

    /**
     * Clear error state
     */
    fun clearError() {
        _error.value = null
    }

    /**
     * Cancel any ongoing operations
     */
    fun cancelOperations() {
        currentJob?.cancel()
        currentJob = null
    }

    /**
     * Update pagination metadata
     */
    private fun updatePaginationMeta(pagination: PaginationMeta) {
        _totalPages.value = pagination.total_pages
        _totalItems.value = pagination.total_items
        _hasNextPage.value = pagination.has_next_page
    }

    /**
     * Update product in local list
     */
    private fun updateProductInList(updatedProduct: Product) {
        val currentProducts = _products.value.toMutableList()
        val index = currentProducts.indexOfFirst { it.id == updatedProduct.id }
        if (index != -1) {
            currentProducts[index] = updatedProduct
            _products.value = currentProducts
        }
    }

    /**
     * Remove product from local list
     */
    private fun removeProductFromList(productId: String) {
        val currentProducts = _products.value.toMutableList()
        currentProducts.removeAll { it.id == productId }
        _products.value = currentProducts
        
        // Update total items count
        _totalItems.value = maxOf(0, _totalItems.value - 1)
    }
}

/**
 * Loading states for UI
 */
enum class LoadingState {
    IDLE,
    LOADING,
    LOADING_MORE,
    SUCCESS,
    ERROR
}