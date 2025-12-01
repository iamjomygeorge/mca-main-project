import logger from "@/utils/logger";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

class ApiService {
  async request(
    endpoint,
    { method = "GET", body, headers = {}, token = null } = {}
  ) {
    const config = {
      method,
      headers: {
        ...headers,
      },
    };

    if (body instanceof FormData) {
      config.body = body;
    } else {
      config.headers["Content-Type"] = "application/json";
      if (body) config.body = JSON.stringify(body);
    }

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        config.headers["Authorization"] = `Bearer ${storedToken}`;
      }
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config);

      if (response.status === 401) {
        logger.warn(`Unauthorized access attempt to ${endpoint}`);
      }

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data.error ||
          (data.errors && Array.isArray(data.errors)
            ? Object.values(data.errors[0])[0]
            : "An unexpected error occurred");

        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      logger.error(
        `API Request Failed: [${method}] ${endpoint}`,
        error.message
      );
      throw error;
    }
  }

  get(endpoint, options) {
    return this.request(endpoint, { ...options, method: "GET" });
  }
  post(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: "POST", body });
  }
  put(endpoint, body, options) {
    return this.request(endpoint, { ...options, method: "PUT", body });
  }
  delete(endpoint, options) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }
}

export const api = new ApiService();
