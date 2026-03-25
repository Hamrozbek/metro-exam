// Vercel-dagi VITE_API_URL dan foydalanamiz (http://13.60.163.115:8000/api/v1)
const BASE_URL = import.meta.env.VITE_API_URL;

export const getTokens = () => ({
    access: localStorage.getItem("access_token"),
    refresh: localStorage.getItem("refresh_token"),
});

const getFullUrl = (endpoint: string) => {
    if (!BASE_URL) return endpoint;

    // BASE_URL oxiridagi va endpoint boshidagi slashlarni tozalaymiz
    const cleanBase = BASE_URL.replace(/\/+$/, "");
    const cleanEndpoint = endpoint.replace(/^\/+|\/+$/g, "");

    // Yakuniy URL doim oxirida slash bilan tugaydi (Django uchun muhim)
    return `${cleanBase}/${cleanEndpoint}/`;
};

// 1. Oddiy JSON so'rovlar uchun
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const { access } = getTokens();
    const fullUrl = getFullUrl(endpoint);

    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(access && { Authorization: `Bearer ${access}` }),
        ...options.headers,
    };

    const response = await fetch(fullUrl, { ...options, headers });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Xatolik yuz berdi");
    }

    return response.json();
};

// 2. Fayl yuklash uchun (Build xatosini yo'qotish uchun shart!)
export const apiUpload = async (endpoint: string, formData: FormData) => {
    const { access } = getTokens();
    const fullUrl = getFullUrl(endpoint);

    const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
            ...(access && { Authorization: `Bearer ${access}` }),
            // FormData bilan ishlaganda Content-Type sarlavhasi berilmaydi
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Fayl yuklashda xatolik");
    }

    return response.json();
};