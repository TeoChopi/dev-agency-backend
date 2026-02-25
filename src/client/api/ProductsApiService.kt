import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.request.*
import io.ktor.http.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/**
 * KMP client for products API with pagination support
 */
class ProductsApiService(
    private val httpClient: HttpClient,
    private val baseUrl: String = "http://localhost:3000/api"
) {
    private val json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
    }

    /**
     * Get paginated products with filters
     */
    suspend fun getProducts(params: ProductsApiParams): Result<PaginatedProductsResponse> {
        return try {
            val response = httpClient.get("$baseUrl/products") {
                url {
                    parameters.append("page", params.page.toString())
                    parameters.append("limit", params.limit.toString())
                    
                    params.sortBy?.let { parameters.append("sortBy", it) }
                    params.sortOrder?.let { parameters.append("sortOrder", it) }
                    params.search?.let { parameters.append("search", it) }
                    params.category?.let { parameters.append("category", it) }
                    params.minPrice?.let { parameters.append("minPrice", it.toString()) }
                    params.maxPrice?.let { parameters.append("maxPrice", it.toString()) }
                    params.isActive?.let { parameters.append("isActive", it.toString()) }
                }
            }

            if (response.status == HttpStatusCode.OK) {
                val paginatedResponse = response.body<PaginatedProductsResponse>()
                Result.success(paginatedResponse)
            } else {
                Result.failure(Exception("HTTP ${response.status.value}: Failed to fetch products"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Get product by ID
     */
    suspend fun getProductById(id: String): Result<ProductResponse> {
        return try {
            val response = httpClient.get("$baseUrl/products/$id")
            
            if (response.status == HttpStatusCode.OK) {
                val productResponse = response.body<ProductResponse>()
                Result.success(productResponse)
            } else if (response.status == HttpStatusCode.NotFound) {
                Result.failure(ProductNotFoundException("Product with ID $id not found"))
            } else {
                Result.failure(Exception("HTTP ${response.status.value}: Failed to fetch product"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Create new product
     */
    suspend fun createProduct(product: CreateProductRequest): Result<ProductResponse> {
        return try {
            val response = httpClient.post("$baseUrl/products") {
                contentType(ContentType.Application.Json)
                setBody(product)
            }

            if (response.status == HttpStatusCode.Created) {
                val productResponse = response.body<ProductResponse>()
                Result.success(productResponse)
            } else {
                Result.failure(Exception("HTTP ${response.status.value}: Failed to create product"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Update product by ID
     */
    suspend fun updateProduct(id: String, product: UpdateProductRequest): Result<ProductResponse> {
        return try {
            val response = httpClient.put("$baseUrl/products/$id") {
                contentType(ContentType.Application.Json)
                setBody(product)
            }

            if (response.status == HttpStatusCode.OK) {
                val productResponse = response.body<ProductResponse>()
                Result.success(productResponse)
            } else if (response.status == HttpStatusCode.NotFound) {
                Result.failure(ProductNotFoundException("Product with ID $id not found"))
            } else {
                Result.failure(Exception("HTTP ${response.status.value}: Failed to update product"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Delete product by ID
     */
    suspend fun deleteProduct(id: String): Result<Unit> {
        return try {
            val response = httpClient.delete("$baseUrl/products/$id")
            
            if (response.status == HttpStatusCode.NoContent) {
                Result.success(Unit)
            } else if (response.status == HttpStatusCode.NotFound) {
                Result.failure(ProductNotFoundException("Product with ID $id not found"))
            } else {
                Result.failure(Exception("HTTP ${response.status.value}: Failed to delete product"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}

/**
 * API request parameters with pagination support
 */
@Serializable
data class ProductsApiParams(
    val page: Int = 1,
    val limit: Int = 10,
    val sortBy: String? = null,
    val sortOrder: String? = null,
    val search: String? = null,
    val category: String? = null,
    val minPrice: Double? = null,
    val maxPrice: Double? = null,
    val isActive: Boolean? = null
)

/**
 * Product data models
 */
@Serializable
data class Product(
    val id: String,
    val name: String,
    val description: String?,
    val price: Double,
    val category: String,
    val stock: Int,
    val imageUrl: String?,
    val isActive: Boolean,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
data class CreateProductRequest(
    val name: String,
    val description: String?,
    val price: Double,
    val category: String,
    val stock: Int,
    val imageUrl: String?,
    val isActive: Boolean = true
)

@Serializable
data class UpdateProductRequest(
    val name: String?,
    val description: String?,
    val price: Double?,
    val category: String?,
    val stock: Int?,
    val imageUrl: String?,
    val isActive: Boolean?
)

/**
 * API response models
 */
@Serializable
data class PaginationMeta(
    val current_page: Int,
    val total_pages: Int,
    val total_items: Int,
    val items_per_page: Int,
    val has_next_page: Boolean,
    val has_previous_page: Boolean
)

@Serializable
data class PaginatedProductsResponse(
    val success: Boolean,
    val data: List<Product>,
    val pagination: PaginationMeta,
    val error: ApiError? = null
)

@Serializable
data class ProductResponse(
    val success: Boolean,
    val data: Product,
    val error: ApiError? = null
)

@Serializable
data class ApiError(
    val message: String,
    val code: String
)

/**
 * Custom exceptions
 */
class ProductNotFoundException(message: String) : Exception(message)